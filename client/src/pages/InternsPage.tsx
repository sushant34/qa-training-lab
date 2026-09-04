import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getInterns, getTestCases, getExecutions, getBugReports, getInternEvaluation, getProjects, resetTraining } from '../services/api';
import { User, TestCase, TestExecution, BugReport, Evaluation } from '../types';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { Users, ArrowLeft, RotateCcw } from 'lucide-react';

const InternsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const [interns, setInterns] = useState<User[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<User | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (userId) {
        const internsList = await getInterns();
        const intern = internsList.find(i => i.id === Number(userId));
        if (intern) {
          setSelectedIntern(intern);
          const projects = await getProjects();
          const projectId = projects[0]?.id;
          if (projectId) {
            const [cases, execs, bugs, evalData] = await Promise.all([
              getTestCases(projectId, Number(userId)),
              getExecutions(projectId, Number(userId)),
              getBugReports(projectId, Number(userId)),
              getInternEvaluation(Number(userId), projectId),
            ]);
            setTestCases(cases);
            setExecutions(execs);
            setBugReports(bugs);
            setEvaluation(evalData);
          }
        }
      } else {
        const internsList = await getInterns();
        setInterns(internsList);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!selectedIntern) return;
    try {
      const projects = await getProjects();
      const projectId = projects[0]?.id;
      if (projectId) {
        await resetTraining(selectedIntern.id, projectId);
        toast.success('Training reset successfully');
        loadData();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset training');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedIntern && userId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => { setSelectedIntern(null); window.history.replaceState({}, '', '/interns'); }} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{selectedIntern.full_name}</h1>
              <p className="text-slate-600">{selectedIntern.email}</p>
            </div>
          </div>
          <button onClick={() => setShowResetConfirm(true)} className="btn btn-danger">
            <RotateCcw size={16} />
            Reset Training
          </button>
        </div>

        {evaluation && (
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Evaluation</h2>
            <div className="grid grid-cols-2 gap-4">
              <ProgressBar value={evaluation.overall_score} label="Overall Score" color="bg-blue-600" />
              <ProgressBar value={evaluation.bug_detection_score} max={25} label="Bug Detection" color="bg-red-600" />
              <ProgressBar value={evaluation.requirement_mapping_score} max={10} label="Requirement Mapping" color="bg-green-600" />
              <ProgressBar value={evaluation.reproduction_steps_score} max={10} label="Reproduction Steps" color="bg-yellow-600" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-blue-600">{testCases.length}</p>
            <p className="text-sm text-slate-500">Test Cases</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">{executions.length}</p>
            <p className="text-sm text-slate-500">Executions</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-red-600">{bugReports.length}</p>
            <p className="text-sm text-slate-500">Bug Reports</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Test Cases</h2>
          <DataTable
            data={testCases}
            columns={[
              { key: 'tc_id', label: 'ID', render: (tc: TestCase) => <span className="font-mono text-blue-600">{tc.tc_id}</span> },
              { key: 'title', label: 'Title' },
              { key: 'test_type', label: 'Type', render: (tc: TestCase) => <StatusBadge status={tc.test_type} size="sm" /> },
              { key: 'priority', label: 'Priority', render: (tc: TestCase) => <StatusBadge status={tc.priority} size="sm" /> },
              { key: 'status', label: 'Status', render: (tc: TestCase) => <StatusBadge status={tc.status} size="sm" /> },
            ]}
            emptyMessage="No test cases created yet."
          />
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Bug Reports</h2>
          <DataTable
            data={bugReports}
            columns={[
              { key: 'bug_id', label: 'ID', render: (bug: BugReport) => <span className="font-mono text-red-600">{bug.bug_id}</span> },
              { key: 'title', label: 'Title' },
              { key: 'severity', label: 'Severity', render: (bug: BugReport) => <StatusBadge status={bug.severity} size="sm" /> },
              { key: 'priority', label: 'Priority', render: (bug: BugReport) => <StatusBadge status={bug.priority} size="sm" /> },
              { key: 'status', label: 'Status', render: (bug: BugReport) => <StatusBadge status={bug.status} size="sm" /> },
            ]}
            emptyMessage="No bug reports submitted yet."
          />
        </div>

        <ConfirmDialog
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={handleReset}
          title="Reset Training"
          message={`Are you sure you want to reset all training data for ${selectedIntern.full_name}? This will delete all test cases, executions, and bug reports.`}
          confirmText="Reset"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Interns</h1>
        <p className="text-slate-600 mt-1">
          View and manage intern accounts and their progress.
        </p>
      </div>

      <DataTable
        data={interns}
        columns={[
          { key: 'full_name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'username', label: 'Username' },
          {
            key: 'actions',
            label: '',
            render: (intern: User) => (
              <button
                onClick={() => window.location.href = `/interns?userId=${intern.id}`}
                className="btn btn-sm btn-outline"
              >
                View Details
              </button>
            ),
          },
        ]}
        emptyMessage="No interns found."
      />
    </div>
  );
};

export default InternsPage;
