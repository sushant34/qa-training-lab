import React, { useState, useEffect } from 'react';
import { getProjects, getCoverage } from '../services/api';
import { CoverageData } from '../types';
import { BarChart3, AlertCircle, CheckCircle, FileText, Bug } from 'lucide-react';

const CoverageDashboardPage: React.FC = () => {
  const [data, setData] = useState<CoverageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const projects = await getProjects();
      const projectId = projects[0]?.id;
      if (projectId) {
        const coverage = await getCoverage(projectId);
        setData(coverage);
      }
    } catch (error) {
      console.error('Failed to load coverage data:', error);
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

  if (!data) return null;

  const { summary, uncovered_requirements, module_stats } = data;
  const coveragePercent = summary.coverage_percentage;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 size={24} />
          Test Coverage Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Visual overview of your test coverage across all requirements.
        </p>
      </div>

      <div className="card bg-gradient-to-r from-indigo-600 to-violet-600 border-0 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Overall Coverage</h2>
          <span className="text-4xl font-bold">{coveragePercent}%</span>
        </div>
        <div className="h-4 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${coveragePercent}%` }}
          />
        </div>
        <p className="text-sm text-indigo-200 mt-2">
          {summary.with_test_cases} of {summary.total_requirements} requirements have test cases
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-100 rounded-xl mx-auto w-fit mb-2">
            <FileText size={22} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.total_test_cases}</p>
          <p className="text-sm text-slate-500">Test Cases</p>
        </div>
        <div className="card text-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-100 rounded-xl mx-auto w-fit mb-2">
            <CheckCircle size={22} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.with_test_cases}</p>
          <p className="text-sm text-slate-500">Covered Reqs</p>
        </div>
        <div className="card text-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-red-100 rounded-xl mx-auto w-fit mb-2">
            <AlertCircle size={22} className="text-red-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.without_test_cases}</p>
          <p className="text-sm text-slate-500">Uncovered</p>
        </div>
        <div className="card text-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-100 rounded-xl mx-auto w-fit mb-2">
            <Bug size={22} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.total_bug_reports}</p>
          <p className="text-sm text-slate-500">Bugs Found</p>
        </div>
      </div>

      {uncovered_requirements.length > 0 && (
        <div className="card border-amber-200 bg-amber-50/50">
          <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600" />
            Requirements Needing Test Cases ({uncovered_requirements.length})
          </h2>
          <div className="space-y-2">
            {uncovered_requirements.map(req => (
              <div key={req.req_id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-100">
                <span className="font-mono text-sm font-semibold text-indigo-600 shrink-0">{req.req_id}</span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{req.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{req.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(module_stats).length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Module Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(module_stats).map(([module, stats]) => {
              const pct = stats.total > 0 ? Math.round((stats.with_tc / stats.total) * 100) : 0;
              return (
                <div key={module} className="flex items-center gap-4">
                  <span className="font-medium text-slate-700 w-24 shrink-0">{module}</span>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-600 w-20 text-right">
                    {stats.with_tc}/{stats.total} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverageDashboardPage;
