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

  let bugDetectionScore = 0;
  let requirementMappingScore = 0;
  let reproductionStepsScore = 0;
  let expectedResultScore = 0;
  let actualResultScore = 0;
  let severityScore = 0;
  let priorityScore = 0;

  if (groundTruthBugs.length > 0) {
    const detectedRequirements = new Set();
    groundTruthBugs.forEach(gtBug => {
      const found = userBugs.find(ub =>
        ub.requirement_id === gtBug.requirement_id
      );
      if (found) {
        detectedRequirements.add(gtBug.requirement_id);
      }
    });

    bugDetectionScore = Math.min(30, (detectedRequirements.size / groundTruthBugs.length) * 30);

    userBugs.forEach(bug => {
      const matchingGroundTruth = groundTruthBugs.find(gt =>
        gt.requirement_id === bug.requirement_id
      );

      if (matchingGroundTruth) {
        requirementMappingScore += 15 / userBugs.length;

        if (bug.steps_to_reproduce && bug.steps_to_reproduce.length > 10) {
          reproductionStepsScore += 15 / userBugs.length;
        }

        if (bug.expected_result && bug.expected_result.length > 5) {
          expectedResultScore += 10 / userBugs.length;
        }

        if (bug.actual_result && bug.actual_result.length > 5) {
          actualResultScore += 10 / userBugs.length;
        }

        if (bug.severity === matchingGroundTruth.severity) {
          severityScore += 10 / userBugs.length;
        }

        if (bug.priority === matchingGroundTruth.priority) {
          priorityScore += 10 / userBugs.length;
        }
      }
    });
  }

  const overallScore = Math.min(100, Math.round(
    bugDetectionScore +
    requirementMappingScore +
    reproductionStepsScore +
    expectedResultScore +
    actualResultScore +
    severityScore +
    priorityScore
  ));

  return {
    bug_detection_score: Math.round(bugDetectionScore * 100) / 100,
    requirement_mapping_score: Math.round(requirementMappingScore * 100) / 100,
    reproduction_steps_score: Math.round(reproductionStepsScore * 100) / 100,
    expected_result_score: Math.round(expectedResultScore * 100) / 100,
    actual_result_score: Math.round(actualResultScore * 100) / 100,
    severity_score: Math.round(severityScore * 100) / 100,
    priority_score: Math.round(priorityScore * 100) / 100,
    overall_score: overallScore,
  };
};

router.get('/my-score/:projectId', authenticateToken, (req, res) => {
  const evaluation = db.prepare(
    'SELECT * FROM evaluations WHERE user_id = ? AND project_id = ?'
  ).get(req.user.id, req.params.projectId);

  if (!evaluation) {
    const newEvaluation = calculateEvaluation(req.user.id, req.params.projectId);

    db.prepare(
      `INSERT INTO evaluations (user_id, project_id, bug_detection_score, requirement_mapping_score, reproduction_steps_score, expected_result_score, actual_result_score, severity_score, priority_score, overall_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      req.user.id,
      req.params.projectId,
      newEvaluation.bug_detection_score,
      newEvaluation.requirement_mapping_score,
      newEvaluation.reproduction_steps_score,
      newEvaluation.expected_result_score,
      newEvaluation.actual_result_score,
      newEvaluation.severity_score,
      newEvaluation.priority_score,
      newEvaluation.overall_score
    );

    return res.json(newEvaluation);
  }

  const updatedEvaluation = calculateEvaluation(req.user.id, req.params.projectId);

  db.prepare(
    `UPDATE evaluations SET bug_detection_score = ?, requirement_mapping_score = ?, reproduction_steps_score = ?, expected_result_score = ?, actual_result_score = ?, severity_score = ?, priority_score = ?, overall_score = ?, evaluated_at = CURRENT_TIMESTAMP
     WHERE user_id = ? AND project_id = ?`
  ).run(
    updatedEvaluation.bug_detection_score,
    updatedEvaluation.requirement_mapping_score,
    updatedEvaluation.reproduction_steps_score,
    updatedEvaluation.expected_result_score,
    updatedEvaluation.actual_result_score,
    updatedEvaluation.severity_score,
    updatedEvaluation.priority_score,
    updatedEvaluation.overall_score,
    req.user.id,
    req.params.projectId
  );

  res.json(updatedEvaluation);
});

router.get('/intern/:userId/:projectId', authenticateToken, requireRole('TRAINER'), (req, res) => {
  const evaluation = db.prepare(
    'SELECT * FROM evaluations WHERE user_id = ? AND project_id = ?'
  ).get(req.params.userId, req.params.projectId);

  if (!evaluation) {
    const newEvaluation = calculateEvaluation(req.params.userId, req.params.projectId);

    db.prepare(
      `INSERT INTO evaluations (user_id, project_id, bug_detection_score, requirement_mapping_score, reproduction_steps_score, expected_result_score, actual_result_score, severity_score, priority_score, overall_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      req.params.userId,
      req.params.projectId,
      newEvaluation.bug_detection_score,
      newEvaluation.requirement_mapping_score,
      newEvaluation.reproduction_steps_score,
      newEvaluation.expected_result_score,
      newEvaluation.actual_result_score,
      newEvaluation.severity_score,
      newEvaluation.priority_score,
      newEvaluation.overall_score
    );

    return res.json(newEvaluation);
  }

  const updatedEvaluation = calculateEvaluation(req.params.userId, req.params.projectId);

  db.prepare(
    `UPDATE evaluations SET bug_detection_score = ?, requirement_mapping_score = ?, reproduction_steps_score = ?, expected_result_score = ?, actual_result_score = ?, severity_score = ?, priority_score = ?, overall_score = ?, evaluated_at = CURRENT_TIMESTAMP
     WHERE user_id = ? AND project_id = ?`
  ).run(
    updatedEvaluation.bug_detection_score,
    updatedEvaluation.requirement_mapping_score,
    updatedEvaluation.reproduction_steps_score,
    updatedEvaluation.expected_result_score,
    updatedEvaluation.actual_result_score,
    updatedEvaluation.severity_score,
    updatedEvaluation.priority_score,
    updatedEvaluation.overall_score,
    req.params.userId,
    req.params.projectId
  );

  res.json(updatedEvaluation);
});

router.get('/all-interns/:projectId', authenticateToken, requireRole('TRAINER'), (req, res) => {
  const interns = db.prepare('SELECT id, username, email, full_name FROM users WHERE role = ?').all('INTERN');

  const results = interns.map(intern => {
    const evaluation = calculateEvaluation(intern.id, req.params.projectId);

    return {
      intern,
      evaluation,
    };
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
