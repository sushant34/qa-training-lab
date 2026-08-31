import React, { useState, useEffect } from 'react';
import { getMyScore, getProjects } from '../services/api';
import { Evaluation } from '../types';
import ProgressBar from '../components/ProgressBar';
import { Award, Target, FileText, AlertTriangle, CheckCircle, BarChart3, ClipboardCheck, Zap } from 'lucide-react';

const MyScorePage: React.FC = () => {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScore();
  }, []);

  const loadScore = async () => {
    try {
      const projects = await getProjects();
      const projectId = projects[0]?.id;
      if (projectId) {
        const score = await getMyScore(projectId);
        setEvaluation(score);
      }
    } catch (error) {
      console.error('Failed to load score:', error);
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

  if (!evaluation) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No evaluation data available yet.</p>
      </div>
    );
  }

  const scoreCategories = [
    {
      name: 'Bug Detection',
      score: evaluation.bug_detection_score,
      max: 25,
      icon: Target,
      color: 'bg-red-600',
      description: 'Ability to find intentional defects',
    },
    {
      name: 'Requirement Mapping',
      score: evaluation.requirement_mapping_score,
      max: 10,
      icon: FileText,
      color: 'bg-blue-600',
      description: 'Mapping bugs to correct requirements',
    },
    {
      name: 'Reproduction Steps',
      score: evaluation.reproduction_steps_score,
      max: 10,
      icon: AlertTriangle,
      color: 'bg-yellow-600',
      description: 'Quality of steps to reproduce',
    },
    {
      name: 'Expected Result',
      score: evaluation.expected_result_score,
      max: 8,
      icon: CheckCircle,
      color: 'bg-green-600',
      description: 'Accuracy of expected behavior',
    },
    {
      name: 'Actual Result',
      score: evaluation.actual_result_score,
      max: 7,
      icon: BarChart3,
      color: 'bg-purple-600',
      description: 'Clarity of actual behavior',
    },
    {
      name: 'Severity Rating',
      score: evaluation.severity_score,
      max: 5,
      icon: AlertTriangle,
      color: 'bg-orange-600',
      description: 'Accuracy of severity classification',
    },
    {
      name: 'Priority Rating',
      score: evaluation.priority_score,
      max: 5,
      icon: Award,
      color: 'bg-indigo-600',
      description: 'Accuracy of priority classification',
    },
    {
      name: 'Test Case Quality',
      score: evaluation.test_case_quality_score,
      max: 15,
      icon: ClipboardCheck,
      color: 'bg-teal-600',
      description: 'Test structure, steps, preconditions, and linking',
    },
    {
      name: 'Test Execution',
      score: evaluation.test_execution_score,
      max: 15,
      icon: Zap,
      color: 'bg-pink-600',
      description: 'Executing tests and reporting bugs from failures',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Score</h1>
        <p className="text-slate-600 mt-1">
          View your testing performance and evaluation details.
        </p>
      </div>

      <div className="card text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
          <span className="text-3xl font-bold text-blue-600">{Math.round(evaluation.overall_score)}</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Overall Score</h2>
        <p className="text-slate-500">out of 100</p>
        <div className="mt-4 max-w-md mx-auto">
          <ProgressBar value={evaluation.overall_score} label="Overall Progress" color="bg-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scoreCategories.map((category) => (
          <div key={category.name} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${category.color}/10`}>
                <category.icon size={20} className={category.color.replace('bg-', 'text-')} />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{category.name}</h3>
                <p className="text-xs text-slate-500">{category.description}</p>
              </div>
            </div>
            <ProgressBar
              value={category.score}
              max={category.max}
              label={`${Math.round(category.score)} / ${category.max}`}
              color={category.color}
            />
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Scoring Criteria</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
          <div className="space-y-3">
            <p><strong>Bug Detection (25%):</strong> Finding intentional defects in the application.</p>
            <p><strong>Requirement Mapping (10%):</strong> Correctly identifying which requirement each bug violates.</p>
            <p><strong>Reproduction Steps (10%):</strong> Writing clear steps that allow others to reproduce the issue.</p>
            <p><strong>Expected Result (8%):</strong> Accurately describing what should have happened.</p>
            <p><strong>Actual Result (7%):</strong> Clearly documenting what actually happened.</p>
          </div>
          <div className="space-y-3">
            <p><strong>Severity Rating (5%):</strong> Correctly classifying the impact of each bug.</p>
            <p><strong>Priority Rating (5%):</strong> Correctly classifying the urgency of each bug.</p>
            <p><strong>Test Case Quality (15%):</strong> Writing well-structured test cases with preconditions, detailed steps, expected results, and requirement links.</p>
            <p><strong>Test Execution (15%):</strong> Executing test cases, recording results, and reporting bugs from failed tests.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyScorePage;
