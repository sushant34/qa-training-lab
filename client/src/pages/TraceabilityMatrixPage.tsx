import React, { useState, useEffect } from 'react';
import { getProjects, getTraceability } from '../services/api';
import { TraceabilityMatrix, TraceabilityItem } from '../types';
import { Link, GitBranch, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const TraceabilityMatrixPage: React.FC = () => {
  const [data, setData] = useState<TraceabilityMatrix | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const projects = await getProjects();
      const projectId = projects[0]?.id;
      if (projectId) {
        const matrix = await getTraceability(projectId);
        setData(matrix);
      }
    } catch (error) {
      console.error('Failed to load traceability data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: TraceabilityItem['status']) => {
    switch (status) {
      case 'covered': return <CheckCircle size={18} className="text-emerald-500 dark:text-emerald-400" />;
      case 'partial': return <AlertTriangle size={18} className="text-amber-500 dark:text-amber-400" />;
      case 'gaps': return <XCircle size={18} className="text-red-500 dark:text-red-400" />;
    }
  };

  const getStatusLabel = (status: TraceabilityItem['status']) => {
    switch (status) {
      case 'covered': return <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Fully Covered</span>;
      case 'partial': return <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Partial Coverage</span>;
      case 'gaps': return <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">No Coverage</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <GitBranch size={24} />
          Traceability Matrix
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          View the mapping between requirements, test cases, and bug reports.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{data.summary.total_requirements}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Requirements</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{data.summary.with_test_cases}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">With Test Cases</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{data.summary.fully_covered}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Fully Covered</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{data.summary.coverage_percentage}%</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Coverage</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Requirement</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Title</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Test Cases</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Bug Reports</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {data.requirements.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm font-medium text-indigo-600 dark:text-indigo-400">{item.req_id}</td>
                  <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">{item.title}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${item.has_test_cases ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'}`}>
                      {item.test_case_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${item.has_bugs ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'}`}>
                      {item.bug_count}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(item.status)}
                      {getStatusLabel(item.status)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TraceabilityMatrixPage;
