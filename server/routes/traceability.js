const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/:projectId', authenticateToken, (req, res) => {
  const projectId = req.params.projectId;

  const requirements = db.prepare(
    'SELECT * FROM requirements WHERE project_id = ? ORDER BY req_id ASC'
  ).all(projectId);

  const testCases = db.prepare(
    'SELECT requirement_id, COUNT(*) as count FROM test_cases WHERE project_id = ? AND requirement_id IS NOT NULL GROUP BY requirement_id'
  ).all(projectId);

  const bugReports = db.prepare(
    'SELECT requirement_id, COUNT(*) as count FROM bug_reports WHERE project_id = ? AND requirement_id IS NOT NULL GROUP BY requirement_id'
  ).all(projectId);

  const tcMap = {};
  testCases.forEach(tc => { tcMap[tc.requirement_id] = tc.count; });

  const brMap = {};
  bugReports.forEach(br => { brMap[br.requirement_id] = br.count; });

  const items = requirements.map(req => {
    const hasTC = tcMap[req.id] || 0;
    const hasBR = brMap[req.id] || 0;
    let status = 'gaps';
    if (hasTC > 0 && hasBR > 0) status = 'covered';
    else if (hasTC > 0) status = 'partial';

    return {
      id: req.id,
      req_id: req.req_id,
      title: req.title,
      has_test_cases: hasTC > 0,
      test_case_count: hasTC,
      has_bugs: hasBR > 0,
      bug_count: hasBR,
      status,
    };
  });

  const totalReqs = requirements.length;
  const withTC = items.filter(i => i.has_test_cases).length;
  const withBR = items.filter(i => i.has_bugs).length;
  const fullyCovered = items.filter(i => i.status === 'covered').length;

  res.json({
    requirements: items,
    summary: {
      total_requirements: totalReqs,
      with_test_cases: withTC,
      with_bugs: withBR,
      fully_covered: fullyCovered,
      coverage_percentage: totalReqs > 0 ? Math.round((fullyCovered / totalReqs) * 1000) / 10 : 0,
    },
  });
});

module.exports = router;
