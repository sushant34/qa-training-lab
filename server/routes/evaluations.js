const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

const calculateEvaluation = (userId, projectId) => {
  const groundTruthBugs = db.prepare(
    'SELECT * FROM ground_truth_bugs WHERE project_id = ?'
  ).all(projectId);

  const userBugs = db.prepare(
    'SELECT * FROM bug_reports WHERE user_id = ? AND project_id = ?'
  ).all(userId, projectId);

  const userTestCases = db.prepare(
    'SELECT * FROM test_cases WHERE user_id = ? AND project_id = ?'
  ).all(userId, projectId);

  const userExecutions = db.prepare(`
    SELECT te.*, tc.requirement_id
    FROM test_executions te
    JOIN test_cases tc ON te.test_case_id = tc.id
    WHERE te.user_id = ? AND tc.project_id = ?
  `).all(userId, projectId);

  // Bug scoring (scaled down to make room for test case scoring)
  let bugDetectionScore = 0;
  let requirementMappingScore = 0;
  let reproductionStepsScore = 0;
  let expectedResultScore = 0;
  let actualResultScore = 0;
  let severityScore = 0;
  let priorityScore = 0;

  if (groundTruthBugs.length > 0 && userBugs.length > 0) {
    const detectedRequirements = new Set();
    groundTruthBugs.forEach(gtBug => {
      const found = userBugs.find(ub => ub.requirement_id === gtBug.requirement_id);
      if (found) detectedRequirements.add(gtBug.requirement_id);
    });

    bugDetectionScore = Math.min(25, (detectedRequirements.size / groundTruthBugs.length) * 25);

    userBugs.forEach(bug => {
      const matchingGT = groundTruthBugs.find(gt => gt.requirement_id === bug.requirement_id);
      if (matchingGT) {
        requirementMappingScore += 10 / userBugs.length;
        if (bug.steps_to_reproduce && bug.steps_to_reproduce.length > 10) {
          reproductionStepsScore += 10 / userBugs.length;
        }
        if (bug.expected_result && bug.expected_result.length > 5) {
          expectedResultScore += 8 / userBugs.length;
        }
        if (bug.actual_result && bug.actual_result.length > 5) {
          actualResultScore += 7 / userBugs.length;
        }
        if (bug.severity === matchingGT.severity) {
          severityScore += 5 / userBugs.length;
        }
        if (bug.priority === matchingGT.priority) {
          priorityScore += 5 / userBugs.length;
        }
      }
    });
  }

  // Test case quality scoring (max 15)
  let testCaseQualityScore = 0;

  if (userTestCases.length > 0) {
    let qualityPoints = 0;
    const maxPerCase = 15 / userTestCases.length;

    userTestCases.forEach(tc => {
      let casePoints = 0;

      // Has preconditions filled (+3 points worth)
      if (tc.preconditions && tc.preconditions.trim().length > 0) {
        casePoints += maxPerCase * 0.2;
      }

      // Steps are multi-line and >20 chars (+4 points worth)
      if (tc.steps && tc.steps.length > 20 && tc.steps.includes('\n')) {
        casePoints += maxPerCase * 0.27;
      } else if (tc.steps && tc.steps.length > 20) {
        casePoints += maxPerCase * 0.13;
      }

      // Expected result is >10 chars (+3 points worth)
      if (tc.expected_result && tc.expected_result.length > 10) {
        casePoints += maxPerCase * 0.2;
      }

      // Linked to a requirement (+3 points worth)
      if (tc.requirement_id) {
        casePoints += maxPerCase * 0.2;
      }

      // Has test data defined (+2 points worth)
      if (tc.test_data && tc.test_data.trim().length > 0) {
        casePoints += maxPerCase * 0.13;
      }

      qualityPoints += Math.min(maxPerCase, casePoints);
    });

    testCaseQualityScore = Math.min(15, qualityPoints);
  }

  // Test execution scoring (max 15)
  let testExecutionScore = 0;

  if (userTestCases.length > 0) {
    const executedCount = userExecutions.length;
    const executionRate = executedCount / userTestCases.length;

    // At least 1 test executed (+5)
    if (executedCount >= 1) {
      testExecutionScore += 5;
    }

    // >50% of test cases executed (+5)
    if (executionRate > 0.5) {
      testExecutionScore += 5;
    }

    // At least 1 bug reported from a failed test (+5)
    const failedExecutions = userExecutions.filter(e => e.status === 'FAIL');
    const bugsFromFailed = userBugs.filter(b => b.test_case_id !== null);
    if (failedExecutions.length > 0 && bugsFromFailed.length > 0) {
      testExecutionScore += 5;
    }
  }

  const overallScore = Math.min(100, Math.round(
    bugDetectionScore +
    requirementMappingScore +
    reproductionStepsScore +
    expectedResultScore +
    actualResultScore +
    severityScore +
    priorityScore +
    testCaseQualityScore +
    testExecutionScore
  ));

  return {
    bug_detection_score: Math.round(bugDetectionScore * 100) / 100,
    requirement_mapping_score: Math.round(requirementMappingScore * 100) / 100,
    reproduction_steps_score: Math.round(reproductionStepsScore * 100) / 100,
    expected_result_score: Math.round(expectedResultScore * 100) / 100,
    actual_result_score: Math.round(actualResultScore * 100) / 100,
    severity_score: Math.round(severityScore * 100) / 100,
    priority_score: Math.round(priorityScore * 100) / 100,
    test_case_quality_score: Math.round(testCaseQualityScore * 100) / 100,
    test_execution_score: Math.round(testExecutionScore * 100) / 100,
    overall_score: overallScore,
  };
};

const scoreFields = 'bug_detection_score, requirement_mapping_score, reproduction_steps_score, expected_result_score, actual_result_score, severity_score, priority_score, test_case_quality_score, test_execution_score, overall_score';
const scorePlaceholders = '?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
const scoreUpdateSet = 'bug_detection_score = ?, requirement_mapping_score = ?, reproduction_steps_score = ?, expected_result_score = ?, actual_result_score = ?, severity_score = ?, priority_score = ?, test_case_quality_score = ?, test_execution_score = ?, overall_score = ?';

const upsertEvaluation = (evalData, userId, projectId) => {
  const existing = db.prepare(
    'SELECT id FROM evaluations WHERE user_id = ? AND project_id = ?'
  ).get(userId, projectId);

  if (existing) {
    db.prepare(
      `UPDATE evaluations SET ${scoreUpdateSet}, evaluated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND project_id = ?`
    ).run(
      evalData.bug_detection_score, evalData.requirement_mapping_score,
      evalData.reproduction_steps_score, evalData.expected_result_score,
      evalData.actual_result_score, evalData.severity_score,
      evalData.priority_score, evalData.test_case_quality_score,
      evalData.test_execution_score, evalData.overall_score,
      userId, projectId
    );
  } else {
    db.prepare(
      `INSERT INTO evaluations (user_id, project_id, ${scoreFields}) VALUES (?, ?, ${scorePlaceholders})`
    ).run(
      userId, projectId,
      evalData.bug_detection_score, evalData.requirement_mapping_score,
      evalData.reproduction_steps_score, evalData.expected_result_score,
      evalData.actual_result_score, evalData.severity_score,
      evalData.priority_score, evalData.test_case_quality_score,
      evalData.test_execution_score, evalData.overall_score
    );
  }
};

router.get('/my-score/:projectId', authenticateToken, (req, res) => {
  const evaluation = calculateEvaluation(req.user.id, req.params.projectId);
  upsertEvaluation(evaluation, req.user.id, req.params.projectId);
  res.json(evaluation);
});

router.get('/intern/:userId/:projectId', authenticateToken, requireRole('TRAINER'), (req, res) => {
  const evaluation = calculateEvaluation(req.params.userId, req.params.projectId);
  upsertEvaluation(evaluation, req.params.userId, req.params.projectId);
  res.json(evaluation);
});

router.get('/all-interns/:projectId', authenticateToken, requireRole('TRAINER'), (req, res) => {
  const interns = db.prepare('SELECT id, username, email, full_name FROM users WHERE role = ?').all('INTERN');

  const results = interns.map(intern => {
    const evaluation = calculateEvaluation(intern.id, req.params.projectId);
    upsertEvaluation(evaluation, intern.id, req.params.projectId);
    return { intern, evaluation };
  });

  res.json(results);
});

router.post('/reset/:userId/:projectId', authenticateToken, requireRole('TRAINER'), (req, res) => {
  db.prepare('DELETE FROM evaluations WHERE user_id = ? AND project_id = ?').run(req.params.userId, req.params.projectId);
  db.prepare('DELETE FROM test_executions WHERE user_id = ? AND test_case_id IN (SELECT id FROM test_cases WHERE project_id = ?)').run(req.params.userId, req.params.projectId);
  db.prepare('DELETE FROM test_cases WHERE user_id = ? AND project_id = ?').run(req.params.userId, req.params.projectId);
  db.prepare('DELETE FROM bug_reports WHERE user_id = ? AND project_id = ?').run(req.params.userId, req.params.projectId);

  res.json({ message: 'Training attempt reset successfully' });
});

module.exports = router;
