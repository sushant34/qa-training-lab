import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { getBugReports, createBugReport, updateBugReport, deleteBugReport, getRequirements, getProjects, getTestCases } from '../services/api';
import { BugReport, Requirement, TestCase } from '../types';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Bug, ExternalLink } from 'lucide-react';

const BugReportsPage: React.FC = () => {
  const { user, isIntern } = useAuth();
  const [searchParams] = useSearchParams();
  const testCaseId = searchParams.get('testCaseId');
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBug, setEditingBug] = useState<BugReport | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<BugReport | null>(null);
  const [viewBug, setViewBug] = useState<BugReport | null>(null);
  const [filter, setFilter] = useState({ status: '', severity: '', search: '' });
  const [formData, setFormData] = useState({
    project_id: 1,
    requirement_id: '',
    test_case_id: testCaseId || '',
    title: '',
    environment: 'Chrome, Windows 10',
    steps_to_reproduce: '',
    expected_result: '',
    actual_result: '',
    severity: 'Medium',
    priority: 'P2',
    additional_notes: '',
  });

  useEffect(() => {
    loadData();
    if (testCaseId) {
      setShowModal(true);
    }
  }, [testCaseId]);

  const loadData = async () => {
    try {
      const projects = await getProjects();
      const projectId = projects[0]?.id;
      const [bugs, reqs, cases] = await Promise.all([
        getBugReports(projectId),
        getRequirements(projectId),
        getTestCases(projectId),
      ]);
      setBugReports(bugs);
      setRequirements(reqs);
      setTestCases(cases);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        requirement_id: formData.requirement_id ? Number(formData.requirement_id) : undefined,
        test_case_id: formData.test_case_id ? Number(formData.test_case_id) : undefined,
        severity: formData.severity as 'Critical' | 'High' | 'Medium' | 'Low',
        priority: formData.priority as 'P0' | 'P1' | 'P2' | 'P3',
      };

      if (editingBug) {
        await updateBugReport(editingBug.id, payload);
        toast.success('Bug report updated successfully');
      } else {
        await createBugReport(payload);
        toast.success('Bug report submitted successfully');
      }
      setShowModal(false);
      setEditingBug(null);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save bug report');
    }
  };

  const handleEdit = (bug: BugReport) => {
    setEditingBug(bug);
    setFormData({
      project_id: bug.project_id,
      requirement_id: bug.requirement_id?.toString() || '',
      test_case_id: bug.test_case_id?.toString() || '',
      title: bug.title,
      environment: bug.environment || '',
      steps_to_reproduce: bug.steps_to_reproduce,
      expected_result: bug.expected_result,
      actual_result: bug.actual_result,
      severity: bug.severity,
      priority: bug.priority,
      additional_notes: bug.additional_notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (bug: BugReport) => {
    try {
      await deleteBugReport(bug.id);
      toast.success('Bug report deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete bug report');
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: 1,
      requirement_id: '',
      test_case_id: '',
      title: '',
      environment: 'Chrome, Windows 10',
      steps_to_reproduce: '',
      expected_result: '',
      actual_result: '',
      severity: 'Medium',
      priority: 'P2',
      additional_notes: '',
    });
  };

  const filteredBugs = bugReports.filter(bug => {
    const matchesStatus = !filter.status || bug.status === filter.status;
    const matchesSeverity = !filter.severity || bug.severity === filter.severity;
    const matchesSearch = !filter.search || 
      bug.bug_id.toLowerCase().includes(filter.search.toLowerCase()) ||
      bug.title.toLowerCase().includes(filter.search.toLowerCase());
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  const columns = [
    { key: 'bug_id', label: 'ID', render: (bug: BugReport) => <span className="font-mono text-red-600 dark:text-red-400">{bug.bug_id}</span> },
    { key: 'title', label: 'Title' },
    { key: 'requirement', label: 'Req ID', render: (bug: BugReport) => bug.requirement_req_id || '-' },
    { key: 'severity', label: 'Severity', render: (bug: BugReport) => <StatusBadge status={bug.severity} size="sm" /> },
    { key: 'priority', label: 'Priority', render: (bug: BugReport) => <StatusBadge status={bug.priority} size="sm" /> },
    { key: 'status', label: 'Status', render: (bug: BugReport) => <StatusBadge status={bug.status} size="sm" /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (bug: BugReport) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); setViewBug(bug); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <ExternalLink size={16} className="text-slate-600 dark:text-slate-400" />
          </button>
          {isIntern && (
            <>
              <button onClick={(e) => { e.stopPropagation(); handleEdit(bug); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                <Edit size={16} className="text-slate-600 dark:text-slate-400" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(bug); }} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                <Trash2 size={16} className="text-red-600 dark:text-red-400" />
              </button>
            </>
          )}
        </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bug Reports</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Describe what you observed, not what you think the developer should change.
          </p>
        </div>
        {isIntern && (
          <button
            onClick={() => { resetForm(); setEditingBug(null); setShowModal(true); }}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Report Bug
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="input-field w-auto"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Under Review">Under Review</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select
          value={filter.severity}
          onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
          className="input-field w-auto"
        >
          <option value="">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <input
          type="text"
          placeholder="Search bugs..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="input-field max-w-xs"
        />
      </div>

      <DataTable
        data={filteredBugs}
        columns={columns}
        emptyMessage="No bug reports found. Start testing the e-commerce application!"
      />

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingBug(null); }}
        title={editingBug ? 'Edit Bug Report' : 'Report Bug'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="label">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="Brief description of the bug"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Requirement</label>
              <select
                value={formData.requirement_id}
                onChange={(e) => setFormData({ ...formData, requirement_id: e.target.value })}
                className="input-field"
              >
                <option value="">Select requirement</option>
                {requirements.map(req => (
                  <option key={req.id} value={req.id}>{req.req_id} - {req.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Test Case</label>
              <select
                value={formData.test_case_id}
                onChange={(e) => setFormData({ ...formData, test_case_id: e.target.value })}
                className="input-field"
              >
                <option value="">Select test case</option>
                {testCases.map(tc => (
                  <option key={tc.id} value={tc.id}>{tc.tc_id} - {tc.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Environment</label>
            <input
              type="text"
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              className="input-field"
              placeholder="Browser, OS, etc."
            />
          </div>

          <div className="form-group">
            <label className="label">Steps to Reproduce *</label>
            <textarea
              value={formData.steps_to_reproduce}
              onChange={(e) => setFormData({ ...formData, steps_to_reproduce: e.target.value })}
              className="input-field"
              rows={4}
              placeholder="Step 1: Navigate to...&#10;Step 2: Click on...&#10;Step 3: Enter..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Expected Result *</label>
              <textarea
                value={formData.expected_result}
                onChange={(e) => setFormData({ ...formData, expected_result: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="What should have happened?"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Actual Result *</label>
              <textarea
                value={formData.actual_result}
                onChange={(e) => setFormData({ ...formData, actual_result: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="What actually happened?"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="input-field"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input-field"
              >
                <option value="P0">P0 - Critical</option>
                <option value="P1">P1 - High</option>
                <option value="P2">P2 - Medium</option>
                <option value="P3">P3 - Low</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Additional Notes</label>
            <textarea
              value={formData.additional_notes}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="Any additional information"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => { setShowModal(false); setEditingBug(null); }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingBug ? 'Update Bug Report' : 'Submit Bug Report'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!viewBug}
        onClose={() => setViewBug(null)}
        title={`Bug Report: ${viewBug?.bug_id}`}
        maxWidth="max-w-2xl"
      >
        {viewBug && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{viewBug.title}</h3>
              <div className="flex gap-2 mt-2">
                <StatusBadge status={viewBug.severity} />
                <StatusBadge status={viewBug.priority} />
                <StatusBadge status={viewBug.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Requirement</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{viewBug.requirement_req_id || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Test Case</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{viewBug.test_case_tc_id || '-'}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Environment</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{viewBug.environment || '-'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Steps to Reproduce</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{viewBug.steps_to_reproduce}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Expected Result</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{viewBug.expected_result}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Actual Result</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{viewBug.actual_result}</p>
              </div>
            </div>

            {viewBug.additional_notes && (
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Additional Notes</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{viewBug.additional_notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm!)}
        title="Delete Bug Report"
        message={`Are you sure you want to delete ${deleteConfirm?.bug_id}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default BugReportsPage;
