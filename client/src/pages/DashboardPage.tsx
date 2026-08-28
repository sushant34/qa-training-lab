import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProjects, getRequirements, getTestCases, getExecutions, getBugReports, getMyScore } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import { BookOpen, FileText, Play, Bug, CheckCircle, XCircle } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    requirements: 0,
    testCases: 0,
    executedTests: 0,
    passedTests: 0,
    failedTests: 0,
    bugsReported: 0,
    overallScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const projects = await getProjects();
      const projectId = projects[0]?.id;

      if (projectId) {
        const [requirements, testCases, executions, bugs, score] = await Promise.all([
          getRequirements(projectId),
          getTestCases(projectId),
          getExecutions(projectId),
          getBugReports(projectId),
          getMyScore(projectId),
        ]);

        const passedTests = executions.filter(e => e.status === 'PASS').length;
        const failedTests = executions.filter(e => e.status === 'FAIL').length;

        setStats({
          requirements: requirements.length,
          testCases: testCases.length,
          executedTests: executions.length,
          passedTests,
          failedTests,
          bugsReported: bugs.length,
          overallScore: score.overall_score,
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.full_name}!</h1>
        <p className="text-slate-600 mt-1">
          Track your progress in the E-Commerce Testing Challenge.
        </p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Testing Progress</h2>
        <ProgressBar value={stats.overallScore} label="Overall Score" color="bg-blue-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.requirements}</p>
              <p className="text-sm text-slate-500">Requirements</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.testCases}</p>
              <p className="text-sm text-slate-500">Test Cases</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Play size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.executedTests}</p>
              <p className="text-sm text-slate-500">Executed Tests</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Bug size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.bugsReported}</p>
              <p className="text-sm text-slate-500">Bugs Reported</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.passedTests}</p>
              <p className="text-sm text-slate-500">Passed Tests</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <XCircle size={24} className="text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.failedTests}</p>
              <p className="text-sm text-slate-500">Failed Tests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Quick Tips</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• Read each requirement carefully before creating your test cases.</li>
          <li>• Think about positive, negative and boundary scenarios.</li>
          <li>• A good test case should have a clear expected result.</li>
          <li>• Always compare actual behavior against the requirement.</li>
          <li>• A bug report should contain enough information for another person to reproduce the issue.</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
