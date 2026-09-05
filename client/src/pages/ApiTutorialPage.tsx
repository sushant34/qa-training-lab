import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Send, CheckCircle, ChevronRight, ChevronLeft, Key, Search, Bug, FileText } from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  content: string;
  example: { method: string; url: string; body?: string };
  expectedStatus: number;
  expectedDescription: string;
  icon: React.ElementType;
  color: string;
}

const steps: TutorialStep[] = [
  {
    id: 1,
    title: 'What is API Testing?',
    content: 'API testing verifies that application programming interfaces work correctly. Unlike UI testing that interacts with buttons and forms, API testing sends HTTP requests directly to the server and validates the responses. This is faster, more reliable, and can catch issues that UI testing might miss.\n\nAPIs use HTTP methods:\n• GET — Retrieve data\n• POST — Create new data\n• PUT — Update existing data\n• DELETE — Remove data',
    example: { method: 'GET', url: '/api/health' },
    expectedStatus: 200,
    expectedDescription: 'Server responds with { "status": "ok" } — confirming the API is running.',
    icon: Code,
    color: 'bg-indigo-600',
  },
  {
    id: 2,
    title: 'HTTP Methods in Action',
    content: 'Let\'s try different HTTP methods on the Products API. A GET request retrieves data without modifying anything. Try fetching all products — you should get a list of products with their details.',
    example: { method: 'GET', url: '/api/products' },
    expectedStatus: 200,
    expectedDescription: 'Returns a paginated list of products with id, name, price, category, stock.',
    icon: Send,
    color: 'bg-emerald-600',
  },
  {
    id: 3,
    title: 'Understanding Status Codes',
    content: 'Status codes tell you what happened with your request:\n\n• 2xx — Success (200 OK, 201 Created)\n• 4xx — Client error (400 Bad Request, 401 Unauthorized, 404 Not Found)\n• 5xx — Server error (500 Internal Server Error)\n\nLet\'s intentionally trigger a 401 by accessing a protected endpoint without a token.',
    example: { method: 'GET', url: '/api/products' },
    expectedStatus: 401,
    expectedDescription: 'Returns 401 Unauthorized — the API requires a valid token.',
    icon: FileText,
    color: 'bg-amber-600',
  },
  {
    id: 4,
    title: 'Authentication & Tokens',
    content: 'Most APIs require authentication. This app uses JWT (JSON Web Tokens). To access protected endpoints, you need to:\n\n1. Login to get a token\n2. Include the token in the Authorization header\n\nLet\'s login first. Use the API Tester to send a POST request with the intern credentials.',
    example: {
      method: 'POST',
      url: '/api/ecommerce/auth/login',
      body: JSON.stringify({ username: 'intern', password: 'intern123' }, null, 2),
    },
    expectedStatus: 200,
    expectedDescription: 'Returns a JWT token and user info. Copy the token for authenticated requests.',
    icon: Key,
    color: 'bg-violet-600',
  },
  {
    id: 5,
    title: 'Request Body & JSON',
    content: 'POST and PUT requests often include a request body with JSON data. Let\'s create a test case by sending a POST request with JSON body.\n\nThe Content-Type header must be set to application/json to tell the server you\'re sending JSON.',
    example: {
      method: 'POST',
      url: '/api/test-cases',
      body: JSON.stringify({
        project_id: 1,
        title: 'API Test Case from Tutorial',
        steps: 'Step 1: Send GET request\nStep 2: Verify response',
        expected_result: 'Response contains product list',
        test_type: 'API',
        priority: 'P2',
      }, null, 2),
    },
    expectedStatus: 201,
    expectedDescription: 'Returns the created test case with a generated tc_id (e.g., TC-001).',
    icon: Code,
    color: 'bg-blue-600',
  },
  {
    id: 6,
    title: 'Query Parameters',
    content: 'Query parameters filter or modify the response. They appear after the ? in the URL:\n\n• /api/products?category=Electronics — filter by category\n• /api/products?search=mouse — search products\n• /api/products?page=2&limit=5 — pagination\n\nMultiple parameters are joined with &.',
    example: { method: 'GET', url: '/api/products?category=Electronics' },
    expectedStatus: 200,
    expectedDescription: 'Returns only products in the Electronics category.',
    icon: Search,
    color: 'bg-cyan-600',
  },
  {
    id: 7,
    title: 'Finding API Bugs',
    content: 'Now let\'s find real bugs! The e-commerce API has intentional defects. Try these:\n\n1. Add to cart with negative quantity — POST /api/cart/add with { "product_id": 1, "quantity": -1 }\n2. Checkout without phone — POST /api/checkout without phone field\n3. Search for SQL injection — GET /api/products?search=\' OR 1=1 --\n\nEach bug you find can be reported as a bug report linked to the appropriate requirement.',
    example: {
      method: 'POST',
      url: '/api/cart/add',
      body: JSON.stringify({ product_id: 1, quantity: -1 }, null, 2),
    },
    expectedStatus: 200,
    expectedDescription: 'Bug: Server accepts negative quantity instead of returning 400 Bad Request.',
    icon: Bug,
    color: 'bg-red-600',
  },
];

const STORAGE_KEY = 'qa-api-tutorial-progress';

const ApiTutorialPage: React.FC = () => {
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
            <Code size={24} />
            API Testing Tutorial
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Step {currentStep + 1} of {steps.length}</p>
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
                completedSteps.has(steps[i].id) ? 'bg-emerald-500' : i === currentStep ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'
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
                i === currentStep ? 'bg-indigo-100 text-indigo-700 font-semibold dark:bg-indigo-900/50 dark:text-indigo-300'
                  : completedSteps.has(s.id) ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
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
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{step.title}</h2>
            <div className="text-slate-600 dark:text-slate-400 mt-3 leading-relaxed whitespace-pre-line text-sm">{step.content}</div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Try It — Example Request</p>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              step.example.method === 'GET' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                : step.example.method === 'POST' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                : step.example.method === 'PUT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
            }`}>{step.example.method}</span>
            <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{step.example.url}</span>
          </div>
          {step.example.body && (
            <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs overflow-x-auto font-mono mt-2">
              {step.example.body}
            </pre>
          )}
          <button
            onClick={() => navigate('/api-tester')}
            className="btn btn-primary btn-sm mt-3"
          >
            Open in API Tester
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1">Expected Result</p>
          <p className="text-sm text-indigo-700 dark:text-indigo-400">
            <strong>Status: {step.expectedStatus}</strong> — {step.expectedDescription}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} className="btn btn-outline btn-sm">
            <ChevronLeft size={16} /> Previous
          </button>
          <div className="flex gap-2">
            {!completedSteps.has(step.id) && (
              <button onClick={markComplete} className="btn btn-success btn-sm">
                <CheckCircle size={16} /> Mark Complete
              </button>
            )}
            {!isLastStep && (
              <button onClick={() => setCurrentStep(currentStep + 1)} className="btn btn-outline btn-sm">
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {allComplete && (
        <div className="card bg-gradient-to-r from-emerald-500 to-teal-500 border-0 text-white text-center py-8">
          <CheckCircle size={48} className="mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Tutorial Complete!</h2>
          <p className="text-emerald-100 mb-4">You've learned the fundamentals of API testing. Now try the challenges!</p>
          <button onClick={() => navigate('/api-challenges')} className="btn bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700">
            Start Challenges
          </button>
        </div>
      )}
    </div>
  );
};

export default ApiTutorialPage;
