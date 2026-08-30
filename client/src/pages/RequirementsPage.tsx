import React, { useState, useEffect } from 'react';
import { getRequirements, getProjects } from '../services/api';
import { Requirement, Project } from '../types';
import { BookOpen, Download, FileText } from 'lucide-react';
import { generateBRS } from '../utils/generateBRS';

const RequirementsPage: React.FC = () => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const projects = await getProjects();
      const activeProject = projects[0];
      if (activeProject) {
        setProject(activeProject);
        const reqs = await getRequirements(activeProject.id);
        setRequirements(reqs);
      }
    } catch (error) {
      console.error('Failed to load requirements:', error);
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Requirements</h1>
          <p className="text-slate-500 mt-1">
            Read each requirement carefully before creating your test cases. Think about positive, negative and boundary scenarios.
          </p>
        </div>
        <button
          onClick={generateBRS}
          className="btn btn-primary shrink-0"
        >
          <Download size={18} />
          Download BRS (PDF)
        </button>
      </div>

      {project && (
        <div className="card bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <FileText size={22} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{project.name}</h2>
              <p className="text-slate-600 mt-1">{project.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-sm font-medium text-slate-700 border border-slate-200">
                  {project.difficulty}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-sm font-medium text-emerald-700 border border-emerald-200">
                  {requirements.length} requirements
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {requirements.map((req) => (
          <div
            key={req.id}
            className="card cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
            onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-indigo-100 rounded-xl">
                <BookOpen size={20} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">{req.req_id}</span>
                  <h3 className="text-lg font-semibold text-slate-900">{req.title}</h3>
                </div>
                <p className="text-slate-600 mt-1.5">{req.description}</p>

                {expandedId === req.id && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl animate-[fadeInUp_.2s_ease-out]">
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                      Acceptance Criteria
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {req.acceptance_criteria.split('\n').map((criteria, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5 shrink-0">
                            <span className="text-emerald-600 text-xs font-bold">✓</span>
                          </span>
                          <span>{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <span className={`text-slate-400 transition-transform ${expandedId === req.id ? 'rotate-180' : ''}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequirementsPage;
