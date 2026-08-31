import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProjects, getRequirements, getTestCases, getExecutions, getBugReports, getMyScore } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import { BookOpen, FileText, Play, Bug, CheckCircle, XCircle, Lightbulb, Rocket, GraduationCap } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tutorialComplete = localStorage.getItem('qa-tutorial-progress');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.full_name}! 👋</h1>
          <p className="text-slate-500 mt-1">
            Track your progress in the E-Commerce Testing Challenge.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full">
          <Rocket size={16} />
          <span className="text-sm font-semibold">{stats.testCases} test cases created</span>
        </div>
      </div>

      {!tutorialComplete && (
        <div className="card bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <GraduationCap size={22} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">New to QA Testing?</h3>
              <p className="text-sm text-slate-600">Start with our step-by-step tutorial to learn the workflow.</p>
            </div>
          </div>
          <button onClick={() => navigate('/tutorial')} className="btn btn-success btn-sm shrink-0">
            Start Tutorial
          </button>
        </div>
      )}

      <div className="card bg-gradient-to-r from-indigo-600 to-violet-600 border-0 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Overall Score</h2>
          <span className="text-3xl font-bold">{stats.overallScore}<span className="text-lg text-indigo-200">/100</span></span>
        </div>
        <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, stats.overallScore)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <BookOpen size={22} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.requirements}</p>
              <p className="text-sm text-slate-500">Requirements</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-100 rounded-xl">
              <FileText size={22} className="text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.testCases}</p>
              <p className="text-sm text-slate-500">Test Cases</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Play size={22} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.executedTests}</p>
              <p className="text-sm text-slate-500">Executed Tests</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-xl">
              <Bug size={22} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.bugsReported}</p>
              <p className="text-sm text-slate-500">Bugs Reported</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card border-emerald-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <CheckCircle size={22} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats.passedTests}</p>
              <p className="text-sm text-slate-500">Passed Tests</p>
            </div>
          </div>
        </div>

        <div className="card border-red-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-xl">
              <XCircle size={22} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.failedTests}</p>
              <p className="text-sm text-slate-500">Failed Tests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-amber-100">
            <Lightbulb size={18} className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Quick Tips</h2>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">◆</span>
            Read each requirement carefully before creating your test cases.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">◆</span>
            Think about positive, negative and boundary scenarios.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">◆</span>
            A good test case should have a clear expected result.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">◆</span>
            Always compare actual behavior against the requirement.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">◆</span>
            A bug report should contain enough info for someone to reproduce it.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
