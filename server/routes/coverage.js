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

  const totalTC = testCases.reduce((sum, t) => sum + t.count, 0);
  const totalBR = bugReports.reduce((sum, b) => sum + b.count, 0);

  const withTC = Object.keys(tcMap).length;
  const withBR = Object.keys(brMap).length;
  const uncovered = requirements.filter(r => !tcMap[r.id]);

  const moduleStats = {};
  requirements.forEach(req => {
    const module = req.req_id.replace(/-\d+$/, '');
    if (!moduleStats[module]) {
      moduleStats[module] = { total: 0, with_tc: 0, with_bugs: 0 };
    }
    moduleStats[module].total++;
    if (tcMap[req.id]) moduleStats[module].with_tc++;
    if (brMap[req.id]) moduleStats[module].with_bugs++;
  });

  res.json({
    summary: {
      total_requirements: requirements.length,
      with_test_cases: withTC,
      without_test_cases: requirements.length - withTC,
      with_bugs: withBR,
      total_test_cases: totalTC,
      total_bug_reports: totalBR,
      coverage_percentage: requirements.length > 0 ? Math.round((withTC / requirements.length) * 1000) / 10 : 0,
    },
    uncovered_requirements: uncovered.map(r => ({
      req_id: r.req_id,
      title: r.title,
      description: r.description,
    })),
    module_stats: moduleStats,
  });
});

module.exports = router;
