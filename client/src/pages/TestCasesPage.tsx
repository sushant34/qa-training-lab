import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getTestCases, createTestCase, updateTestCase, deleteTestCase, getRequirements, getProjects } from '../services/api';
import { TestCase, Requirement } from '../types';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';

const TestCasesPage: React.FC = () => {
  const { user, isIntern } = useAuth();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<TestCase | null>(null);
  const [filter, setFilter] = useState({ requirement: '', search: '' });
  const [formData, setFormData] = useState({
    project_id: 1,
    requirement_id: '',
    title: '',
    preconditions: '',
    test_data: '',
    steps: '',
    expected_result: '',
    priority: 'P2',
    test_type: 'Functional',
    api_method: '',
    api_endpoint: '',
    api_headers: '',
    api_body: '',
    expected_status_code: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const projects = await getProjects();
      const projectId = projects[0]?.id;
      const [cases, reqs] = await Promise.all([
        getTestCases(projectId),
        getRequirements(projectId),
      ]);
      setTestCases(cases);
      setRequirements(reqs);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTestCase) {
        await updateTestCase(editingTestCase.id, {
          ...formData,
          requirement_id: formData.requirement_id ? Number(formData.requirement_id) : undefined,
        } as any);
        toast.success('Test case updated successfully');
      } else {
        await createTestCase({
          ...formData,
          requirement_id: formData.requirement_id ? Number(formData.requirement_id) : undefined,
        } as any);
        toast.success('Test case created successfully');
      }
      setShowModal(false);
      setEditingTestCase(null);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save test case');
    }
  };

  const handleEdit = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setFormData({
      project_id: testCase.project_id,
      requirement_id: testCase.requirement_id?.toString() || '',
      title: testCase.title,
      preconditions: testCase.preconditions || '',
      test_data: testCase.test_data || '',
      steps: testCase.steps,
      expected_result: testCase.expected_result,
      priority: testCase.priority,
      test_type: testCase.test_type,
      api_method: testCase.api_method || '',
      api_endpoint: testCase.api_endpoint || '',
      api_headers: testCase.api_headers || '',
      api_body: testCase.api_body || '',
      expected_status_code: testCase.expected_status_code?.toString() || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (testCase: TestCase) => {
    try {
      await deleteTestCase(testCase.id);
      toast.success('Test case deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete test case');
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: 1,
      requirement_id: '',
      title: '',
      preconditions: '',
      test_data: '',
      steps: '',
      expected_result: '',
      priority: 'P2',
      test_type: 'Functional',
      api_method: '',
      api_endpoint: '',
      api_headers: '',
      api_body: '',
      expected_status_code: '',
    });
  };

  const filteredTestCases = testCases.filter(tc => {
    const matchesRequirement = !filter.requirement || tc.requirement_id?.toString() === filter.requirement;
    const matchesSearch = !filter.search || 
      tc.tc_id.toLowerCase().includes(filter.search.toLowerCase()) ||
      tc.title.toLowerCase().includes(filter.search.toLowerCase());
    return matchesRequirement && matchesSearch;
  });

  const columns = [
    { key: 'tc_id', label: 'ID', render: (tc: TestCase) => <span className="font-mono text-blue-600">{tc.tc_id}</span> },
    { key: 'title', label: 'Title' },
    { key: 'requirement', label: 'Requirement', render: (tc: TestCase) => tc.requirement_req_id || '-' },
    { key: 'test_type', label: 'Type', render: (tc: TestCase) => <StatusBadge status={tc.test_type} size="sm" /> },
    { key: 'priority', label: 'Priority', render: (tc: TestCase) => <StatusBadge status={tc.priority} size="sm" /> },
    { key: 'status', label: 'Status', render: (tc: TestCase) => <StatusBadge status={tc.status} size="sm" /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (tc: TestCase) => (
        <div className="flex gap-2">
          {isIntern && (
            <>
              <button onClick={(e) => { e.stopPropagation(); handleEdit(tc); }} className="p-1 hover:bg-slate-100 rounded">
                <Edit size={16} className="text-slate-600" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(tc); }} className="p-1 hover:bg-red-50 rounded">
                <Trash2 size={16} className="text-red-600" />
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test Cases</h1>
          <p className="text-slate-600 mt-1">
            Try to write test cases that prove whether the requirement is working correctly.
          </p>
        </div>
        {isIntern && (
          <button
            onClick={() => { resetForm(); setEditingTestCase(null); setShowModal(true); }}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Create Test Case
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <select
          value={filter.requirement}
          onChange={(e) => setFilter({ ...filter, requirement: e.target.value })}
          className="input-field w-auto"
        >
          <option value="">All Requirements</option>
          {requirements.map(req => (
            <option key={req.id} value={req.id}>{req.req_id} - {req.title}</option>
          ))}
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
        emptyMessage="No test cases found. Create your first test case!"
      />

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTestCase(null); }}
        title={editingTestCase ? 'Edit Test Case' : 'Create Test Case'}
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
              placeholder="Test case title"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Test Type</label>
              <select
                value={formData.test_type}
                onChange={(e) => setFormData({ ...formData, test_type: e.target.value })}
                className="input-field"
              >
                <option value="Functional">Functional</option>
                <option value="UI/UX">UI/UX</option>
                <option value="Security">Security</option>
                <option value="Performance">Performance</option>
                <option value="API">API</option>
              </select>
            </div>
          </div>

          {formData.test_type === 'API' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">HTTP Method</label>
                  <select
                    value={formData.api_method}
                    onChange={(e) => setFormData({ ...formData, api_method: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select method</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Endpoint URL</label>
                  <input
                    type="text"
                    value={formData.api_endpoint}
                    onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                    className="input-field"
                    placeholder="/api/products"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Expected Status Code</label>
                  <input
                    type="number"
                    value={formData.expected_status_code}
                    onChange={(e) => setFormData({ ...formData, expected_status_code: e.target.value })}
                    className="input-field"
                    placeholder="200"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Headers (JSON)</label>
                  <input
                    type="text"
                    value={formData.api_headers}
                    onChange={(e) => setFormData({ ...formData, api_headers: e.target.value })}
                    className="input-field"
                    placeholder='{"Content-Type":"application/json"}'
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Request Body (JSON)</label>
                <textarea
                  value={formData.api_body}
                  onChange={(e) => setFormData({ ...formData, api_body: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder='{"key": "value"}'
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="label">Preconditions</label>
            <textarea
              value={formData.preconditions}
              onChange={(e) => setFormData({ ...formData, preconditions: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="Any preconditions for this test"
            />
          </div>

          <div className="form-group">
            <label className="label">Test Data</label>
            <textarea
              value={formData.test_data}
              onChange={(e) => setFormData({ ...formData, test_data: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="Test data to be used"
            />
          </div>

          <div className="form-group">
            <label className="label">Steps *</label>
            <textarea
              value={formData.steps}
              onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
              className="input-field"
              rows={4}
              placeholder="Step 1: Navigate to...&#10;Step 2: Click on...&#10;Step 3: Enter..."
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Expected Result *</label>
            <textarea
              value={formData.expected_result}
              onChange={(e) => setFormData({ ...formData, expected_result: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="What should happen when these steps are followed?"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => { setShowModal(false); setEditingTestCase(null); }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTestCase ? 'Update Test Case' : 'Create Test Case'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm!)}
        title="Delete Test Case"
        message={`Are you sure you want to delete ${deleteConfirm?.tc_id}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default TestCasesPage;
