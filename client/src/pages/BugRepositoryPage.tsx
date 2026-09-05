import React, { useState, useEffect } from 'react';
import { getDetectionStatus, getProjects } from '../services/api';
import { GroundTruthBug } from '../types';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

const BugRepositoryPage: React.FC = () => {
  const [bugs, setBugs] = useState<GroundTruthBug[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const projects = await getProjects();
      const projectId = projects[0]?.id;
      if (projectId) {
        const groundTruthBugs = await getDetectionStatus(projectId);
        setBugs(groundTruthBugs);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ground Truth Bug Repository</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          View all intentional defects and their detection status by interns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{bugs.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Bugs</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">
            {bugs.filter(b => b.detection_status === 'Detected').length}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Detected</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">
            {bugs.filter(b => b.detection_status === 'Not Detected').length}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Not Detected</p>
        </div>
      </div>

      <DataTable
        data={bugs}
        columns={[
          { key: 'bug_id', label: 'Bug ID', render: (bug: GroundTruthBug) => <span className="font-mono text-red-600">{bug.bug_id}</span> },
          { key: 'requirement_req_id', label: 'Requirement', render: (bug: GroundTruthBug) => <span className="font-mono text-blue-600">{bug.requirement_req_id}</span> },
          { key: 'title', label: 'Title' },
          { key: 'module', label: 'Module' },
          { key: 'severity', label: 'Severity', render: (bug: GroundTruthBug) => <StatusBadge status={bug.severity} size="sm" /> },
          { key: 'priority', label: 'Priority', render: (bug: GroundTruthBug) => <StatusBadge status={bug.priority} size="sm" /> },
          {
            key: 'detection_status',
            label: 'Detection Status',
            render: (bug: GroundTruthBug) => (
              <div className="flex items-center gap-2">
                {bug.detection_status === 'Detected' ? (
                  <>
                    <CheckCircle size={16} className="text-green-600" />
                    <StatusBadge status="Detected" size="sm" />
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-red-600" />
                    <StatusBadge status="Not Detected" size="sm" />
                  </>
                )}
              </div>
            ),
          },
        ]}
        emptyMessage="No ground truth bugs found."
      />
    </div>
  );
};

export default BugRepositoryPage;
