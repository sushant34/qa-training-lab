import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTestCases, getExecutions, createExecution, getProjects } from '../services/api';
import { TestCase, TestExecution } from '../types';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { Play, Bug } from 'lucide-react';

const TestExecutionPage: React.FC = () => {
  const { user, isIntern } = useAuth();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [filter, setFilter] = useState({ status: '', search: '' });
  const [formData, setFormData] = useState({
    status: 'PASS',
    actual_result: '',
    comments: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const projects = await getProjects();
      const projectId = projects[0]?.id;
      const [cases, execs] = await Promise.all([
        getTestCases(projectId),
        getExecutions(projectId),
      ]);
      setTestCases(cases);
      setExecutions(execs);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setFormData({
      status: 'PASS',
      actual_result: '',
      comments: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestCase) return;

    try {
      await createExecution({
        test_case_id: selectedTestCase.id,
        status: formData.status as any,
        actual_result: formData.actual_result || undefined,
        comments: formData.comments || undefined,
      });
      toast.success('Test executed successfully');
      setShowModal(false);
      setSelectedTestCase(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to execute test');
    }
  };

  const handleReportBug = () => {
    setShowModal(false);
    window.location.href = `/bug-reports?testCaseId=${selectedTestCase?.id}`;
  };

  const getExecutionStatus = (testCaseId: number) => {
    const execution = executions.find(e => e.test_case_id === testCaseId);
    return execution?.status || 'NOT_EXECUTED';
  };

  const filteredTestCases = testCases.map(tc => ({
    ...tc,
    executionStatus: getExecutionStatus(tc.id),
  })).filter(tc => {
    const matchesStatus = !filter.status || tc.executionStatus === filter.status;
    const matchesSearch = !filter.search || 
      tc.tc_id.toLowerCase().includes(filter.search.toLowerCase()) ||
      tc.title.toLowerCase().includes(filter.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const columns = [
    { key: 'tc_id', label: 'ID', render: (tc: any) => <span className="font-mono text-blue-600 dark:text-blue-400">{tc.tc_id}</span> },
    { key: 'title', label: 'Title' },
    { key: 'requirement', label: 'Requirement', render: (tc: any) => tc.requirement_req_id || '-' },
    { key: 'executionStatus', label: 'Status', render: (tc: any) => <StatusBadge status={tc.executionStatus} size="sm" /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (tc: any) => (
        isIntern && (
          <button onClick={(e) => { e.stopPropagation(); handleExecute(tc); }} className="btn btn-primary btn-sm">
            <Play size={14} />
            Execute
          </button>
        )
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Test Execution</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Execute your test cases and record the results. When a test fails, report it as a bug.
        </p>
      </div>

      <div className="flex gap-4">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="input-field w-auto"
        >
          <option value="">All Statuses</option>
          <option value="PASS">Pass</option>
          <option value="FAIL">Fail</option>
          <option value="BLOCKED">Blocked</option>
          <option value="NOT_EXECUTED">Not Executed</option>
        </select>
        <input
          type="text"
          placeholder="Search test cases..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="input-field max-w-xs"
        />
      </div>

      <DataTable
        data={filteredTestCases}
        columns={columns}
        emptyMessage="No test cases found. Create test cases first!"
      />

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedTestCase(null); }}
        title={`Execute: ${selectedTestCase?.tc_id}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-300">{selectedTestCase?.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Expected: {selectedTestCase?.expected_result}</p>
          </div>

          <div className="form-group">
            <label className="label">Execution Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field"
            >
              <option value="PASS">Pass</option>
              <option value="FAIL">Fail</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Actual Result</label>
            <textarea
              value={formData.actual_result}
              onChange={(e) => setFormData({ ...formData, actual_result: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="What actually happened?"
            />
          </div>

          <div className="form-group">
            <label className="label">Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="Additional comments"
            />
          </div>

          <div className="flex justify-between">
            {formData.status === 'FAIL' && isIntern && (
              <button type="button" onClick={handleReportBug} className="btn btn-danger">
                <Bug size={16} />
                Report Bug
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={() => { setShowModal(false); setSelectedTestCase(null); }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Execution
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TestExecutionPage;
