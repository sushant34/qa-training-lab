import React, { useState, useEffect } from 'react';
import { getAllInternScores, getProjects, getInterns, getTestCases, getExecutions, getBugReports } from '../services/api';
import { User, Evaluation, Project } from '../types';
import ProgressBar from '../components/ProgressBar';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Play, Bug, Award, TrendingUp } from 'lucide-react';

const TrainerDashboardPage: React.FC = () => {
  const [internData, setInternData] = useState<{ intern: User; evaluation: Evaluation }[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState({
    totalInterns: 0,
    activeInterns: 0,
    totalTestCases: 0,
    totalExecutions: 0,
    totalBugs: 0,
    confirmedBugs: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const projects = await getProjects();
      const activeProject = projects[0];
      if (activeProject) {
        setProject(activeProject);

        const [internScores, interns, testCases, executions, bugs] = await Promise.all([
          getAllInternScores(activeProject.id),
          getInterns(),
          getTestCases(activeProject.id),
          getExecutions(activeProject.id),
          getBugReports(activeProject.id),
        ]);

        setInternData(internScores);

        const avgScore = internScores.length > 0
          ? internScores.reduce((sum, d) => sum + d.evaluation.overall_score, 0) / internScores.length
          : 0;

        setStats({
          totalInterns: interns.length,
          activeInterns: interns.length,
          totalTestCases: testCases.length,
          totalExecutions: executions.length,
          totalBugs: bugs.length,
          confirmedBugs: bugs.filter(b => b.status === 'Resolved').length,
          avgScore: Math.round(avgScore),
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'intern',
      label: 'Intern',
      render: (row: any) => (
        <div>
          <p className="font-medium text-slate-900">{row.intern.full_name}</p>
          <p className="text-xs text-slate-500">{row.intern.email}</p>
        </div>
      ),
    },
    {
      key: 'testCases',
      label: 'Test Cases',
      render: (row: any) => row.evaluation.test_case_quality_score > 0 ? '✓' : '-',
    },
    {
      key: 'executions',
      label: 'Executed',
      render: (row: any) => row.evaluation.test_execution_score > 0 ? '✓' : '-',
    },
    {
      key: 'bugsFound',
      label: 'Bugs Found',
      render: (row: any) => Math.round(row.evaluation.bug_detection_score / 25 * 39),
    },
    {
      key: 'bugDetection',
      label: 'Bug Detection %',
      render: (row: any) => (
        <ProgressBar
          value={row.evaluation.bug_detection_score}
          max={25}
          showLabel={false}
          color="bg-red-600"
        />
      ),
    },
    {
      key: 'testCaseQuality',
      label: 'Test Case Quality %',
      render: (row: any) => (
        <ProgressBar
          value={row.evaluation.test_case_quality_score}
          max={15}
          showLabel={false}
          color="bg-blue-600"
        />
      ),
    },
    {
      key: 'overallScore',
      label: 'Overall Score',
      render: (row: any) => (
        <span className="font-bold text-lg">{Math.round(row.evaluation.overall_score)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row: any) => (
        <button
          onClick={() => navigate(`/interns?userId=${row.intern.id}`)}
          className="btn btn-sm btn-outline"
        >
          View Details
        </button>
      ),
    },
  ];

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
        <h1 className="text-2xl font-bold text-slate-900">Trainer Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Monitor intern progress and evaluate testing performance.
        </p>
      </div>

      <div className="card bg-gradient-to-r from-indigo-600 to-violet-600 border-0 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-1">Average Intern Score</h2>
            <p className="text-indigo-200">across all interns in this project</p>
          </div>
          <div className="w-24 h-24 rounded-full bg-white/15 flex items-center justify-center backdrop-blur">
            <span className="text-4xl font-bold">{stats.avgScore}</span>
          </div>
        </div>
        <div className="mt-4 h-2.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{ width: `${stats.avgScore}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Users size={22} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalInterns}</p>
              <p className="text-sm text-slate-500">Total Interns</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-100 rounded-xl">
              <FileText size={22} className="text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalTestCases}</p>
              <p className="text-sm text-slate-500">Total Test Cases</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Play size={22} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalExecutions}</p>
              <p className="text-sm text-slate-500">Total Executions</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-xl">
              <Bug size={22} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalBugs}</p>
              <p className="text-sm text-slate-500">Total Bugs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Intern Performance</h2>
        <DataTable
          data={internData}
          columns={columns}
          emptyMessage="No intern data available yet."
        />
      </div>
    </div>
  );
};

export default TrainerDashboardPage;
