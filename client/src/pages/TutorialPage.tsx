import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Play, Bug, CheckCircle, BarChart3, ChevronRight, ChevronLeft, Rocket } from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  objective: string;
  action: string;
  route: string;
  icon: React.ElementType;
  color: string;
}

const steps: TutorialStep[] = [
  {
    id: 1,
    title: 'Read the Requirements',
    description: 'Before writing any test cases, carefully read through each requirement. Understanding what the application is supposed to do is the foundation of all testing.',
    objective: 'Understand what you are testing and what "correct behavior" looks like.',
    action: 'Go to Requirements',
    route: '/requirements',
    icon: BookOpen,
    color: 'bg-indigo-600',
  },
  {
    id: 2,
    title: 'Explore the Application',
    description: 'Navigate through the e-commerce store. Try registering, logging in, searching for products, adding items to the cart, and checking out. Get familiar with how it works — and how it breaks.',
    objective: 'Build familiarity with the application and start noticing unusual behavior.',
    action: 'Open the Store',
    route: '/ecommerce/shop',
    icon: Play,
    color: 'bg-emerald-600',
  },
  {
    id: 3,
    title: 'Write Your First Test Case',
    description: 'Go to the Test Cases page and create a test case for one of the requirements. Start with REQ-001 (User Registration). Think about what should happen, what steps to follow, and what the expected result is.',
    objective: 'Practice writing structured test cases with clear steps and expected results.',
    action: 'Create a Test Case',
    route: '/test-cases',
    icon: FileText,
    color: 'bg-violet-600',
  },
  {
    id: 4,
    title: 'Execute Your Tests',
    description: 'Go to Test Execution and run the test cases you created. Follow each step in the e-commerce app and record whether the test passed or failed. If a test fails, that\'s a potential bug!',
    objective: 'Practice systematic test execution and result documentation.',
    action: 'Execute Tests',
    route: '/test-execution',
    icon: Play,
    color: 'bg-amber-600',
  },
  {
    id: 5,
    title: 'Report a Bug',
    description: 'When you find a test that fails, create a bug report. Include detailed steps to reproduce, what you expected to happen vs. what actually happened, and assign appropriate severity and priority.',
    objective: 'Learn to write clear, actionable bug reports.',
    action: 'Report a Bug',
    route: '/bug-reports',
    icon: Bug,
    color: 'bg-red-600',
  },
  {
    id: 6,
    title: 'Check Your Score',
    description: 'Visit the My Score page to see how your testing performance is evaluated. The scoring considers bug detection, report quality, test case quality, and more.',
    objective: 'Understand the evaluation criteria and identify areas for improvement.',
    action: 'View My Score',
    route: '/my-score',
    icon: BarChart3,
    color: 'bg-blue-600',
  },
  {
    id: 7,
    title: 'Find More Bugs',
    description: 'Explore the e-commerce app thoroughly. Test edge cases, boundary conditions, and error scenarios. The more you test, the more bugs you\'ll find!',
    objective: 'Develop systematic testing strategies and maximize bug detection.',
    action: 'View E-Commerce App',
    route: '/ecommerce/shop',
    icon: Rocket,
    color: 'bg-pink-600',
  },
];

const STORAGE_KEY = 'qa-tutorial-progress';

const TutorialPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedSteps]));
  }, [completedSteps]);

  const markComplete = () => {
    setCompletedSteps(prev => new Set(prev).add(steps[currentStep].id));
  };

  const isLastStep = currentStep === steps.length - 1;
  const allComplete = completedSteps.size === steps.length;
  const step = steps[currentStep];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen size={24} />
            QA Workflow Tutorial
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
        <button
          onClick={() => { localStorage.removeItem(STORAGE_KEY); setCompletedSteps(new Set()); setCurrentStep(0); }}
          className="btn btn-outline btn-sm"
        >
          Reset
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-2">
          {Array.from({ length: steps.length }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                completedSteps.has(steps[i].id)
                  ? 'bg-emerald-500'
                  : i === currentStep
                  ? 'bg-indigo-500'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(i)}
              className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                i === currentStep
                  ? 'bg-indigo-100 text-indigo-700 font-semibold'
                  : completedSteps.has(s.id)
                  ? 'bg-emerald-50 text-emerald-600'
                   : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              {completedSteps.has(s.id) ? '✓' : s.id}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-xl ${step.color} text-white shrink-0`}>
            <step.icon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{step.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{step.description}</p>
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-1">Learning Objective</p>
          <p className="text-sm text-indigo-700 dark:text-indigo-300">{step.objective}</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="btn btn-outline btn-sm"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="flex gap-2">
            {!completedSteps.has(step.id) && (
              <button onClick={markComplete} className="btn btn-success btn-sm">
                <CheckCircle size={16} />
                Mark Complete
              </button>
            )}
            <button
              onClick={() => navigate(step.route)}
              className="btn btn-primary btn-sm"
            >
              {step.action}
              <ChevronRight size={16} />
            </button>
            {!isLastStep && (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn btn-outline btn-sm"
              >
                Next
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {allComplete && (
        <div className="card bg-gradient-to-r from-emerald-500 to-teal-500 border-0 text-white text-center py-8">
          <CheckCircle size={48} className="mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Tutorial Complete!</h2>
          <p className="text-emerald-100 dark:text-emerald-200 mb-4">You've learned the complete QA workflow. Now go find those bugs!</p>
          <button onClick={() => navigate('/dashboard')} className="btn bg-white text-emerald-600 hover:bg-emerald-50">
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default TutorialPage;
