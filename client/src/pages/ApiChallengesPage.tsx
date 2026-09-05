import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, getRequirements, createBugReport } from '../services/api';
import toast from 'react-hot-toast';
import { Bug, Send, CheckCircle, ChevronRight, Lightbulb, ExternalLink } from 'lucide-react';

interface Challenge {
  id: number;
  title: string;
  description: string;
  endpoint: string;
  method: string;
  body?: string;
  headers?: Record<string, string>;
  bugId: string;
  requirementId?: number;
  reqId: string;
  expectedBehavior: string;
  actualBehavior: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  hint: string;
  steps: string[];
}

const challenges: Omit<Challenge, 'requirementId'>[] = [
  {
    id: 1,
    title: 'Login Accepts Wrong Password',
    description: 'Test if the login endpoint accepts an incorrect password for a valid user.',
    endpoint: '/api/ecommerce/auth/login',
    method: 'POST',
    body: JSON.stringify({ username: 'intern', password: 'wrongpassword' }, null, 2),
    bugId: 'GT-003',
    reqId: 'REQ-002',
    expectedBehavior: 'Server should return 401 Unauthorized with "Invalid credentials".',
    actualBehavior: 'Server returns 200 OK with a valid token — authentication bypass.',
    severity: 'Critical',
    priority: 'P0',
    hint: 'Try logging in with the intern account but a wrong password. Check the response status and body.',
    steps: [
      'Open API Tester',
      'Set method to POST, URL to /api/ecommerce/auth/login',
      'Set body to {"username":"intern","password":"wrongpassword"}',
      'Send the request',
      'Check if you get 200 OK with a token (bug) or 401 (correct)',
    ],
  },
  {
    id: 2,
    title: 'Registration Accepts Short Password',
    description: 'Test if the registration endpoint accepts passwords shorter than 8 characters.',
    endpoint: '/api/ecommerce/auth/register',
    method: 'POST',
    body: JSON.stringify({ username: 'testuser', email: 'test@test.com', password: 'short', confirmPassword: 'short', full_name: 'Test User' }, null, 2),
    bugId: 'GT-001',
    reqId: 'REQ-001',
    expectedBehavior: 'Server should return 400 with "Password must be at least 8 characters".',
    actualBehavior: 'Server returns 201 — accepts weak passwords.',
    severity: 'High',
    priority: 'P1',
    hint: 'Try registering with a password like "short" (5 chars). The requirement says 8+ characters.',
    steps: [
      'Open API Tester',
      'Set method to POST, URL to /api/ecommerce/auth/register',
      'Set body with a password shorter than 8 characters',
      'Send the request',
      'Check if you get 201 (bug) or 400 (correct)',
    ],
  },
  {
    id: 3,
    title: 'Cart Allows Negative Quantity',
    description: 'Test if the cart API accepts negative quantity values.',
    endpoint: '/api/cart/add',
    method: 'POST',
    body: JSON.stringify({ product_id: 1, quantity: -1 }, null, 2),
    bugId: 'GT-006',
    reqId: 'REQ-005',
    expectedBehavior: 'Server should return 400 Bad Request — quantity cannot be negative.',
    actualBehavior: 'Server returns 200 OK and adds the item with negative quantity.',
    severity: 'High',
    priority: 'P1',
    hint: 'Add a product to cart with quantity set to -1. A valid API should reject negative values.',
    steps: [
      'Login first to get a token',
      'Open API Tester',
      'Set method to POST, URL to /api/cart/add',
      'Auto-fill the Authorization token',
      'Set body to {"product_id":1,"quantity":-1}',
      'Send the request',
      'Check if you get 200 (bug) or 400 (correct)',
    ],
  },
  {
    id: 4,
    title: 'Cart Allows Zero Quantity',
    description: 'Test if the cart update endpoint accepts quantity of 0.',
    endpoint: '/api/cart/update',
    method: 'PUT',
    body: JSON.stringify({ product_id: 1, quantity: 0 }, null, 2),
    bugId: 'GT-005',
    reqId: 'REQ-005',
    expectedBehavior: 'Quantity must be at least 1. Setting to 0 should remove the item or return error.',
    actualBehavior: 'Server accepts quantity 0, resulting in incorrect cart calculations.',
    severity: 'Medium',
    priority: 'P2',
    hint: 'First add a product to cart, then try updating its quantity to 0.',
    steps: [
      'Login and add a product to cart first',
      'Open API Tester',
      'Set method to PUT, URL to /api/cart/update',
      'Set body to {"product_id":1,"quantity":0}',
      'Send the request',
      'Check if the server rejects it or silently accepts',
    ],
  },
  {
    id: 5,
    title: 'Cart Allows Quantity Exceeding Stock',
    description: 'Test if the cart API allows adding more items than available stock.',
    endpoint: '/api/cart/add',
    method: 'POST',
    body: JSON.stringify({ product_id: 1, quantity: 9999 }, null, 2),
    bugId: 'GT-018',
    reqId: 'REQ-011',
    expectedBehavior: 'Server should return 400 if requested quantity exceeds available stock.',
    actualBehavior: 'Server accepts any quantity regardless of stock level.',
    severity: 'High',
    priority: 'P1',
    hint: 'Check the product stock first (GET /api/products/1), then try adding more than that.',
    steps: [
      'First check product stock: GET /api/products/1',
      'Login and open API Tester',
      'Set method to POST, URL to /api/cart/add',
      'Set quantity higher than the stock value',
      'Send the request',
      'Check if the server rejects it or accepts it',
    ],
  },
  {
    id: 6,
    title: 'Checkout Without Phone Number',
    description: 'Test if the checkout endpoint requires a phone number.',
    endpoint: '/api/checkout',
    method: 'POST',
    body: JSON.stringify({ full_name: 'Test User', email: 'test@test.com', address: '123 Test St' }, null, 2),
    bugId: 'GT-008',
    reqId: 'REQ-007',
    expectedBehavior: 'Server should return 400 — phone is a required field.',
    actualBehavior: 'Server processes the order without a phone number.',
    severity: 'Medium',
    priority: 'P2',
    hint: 'Add items to cart, then checkout without including the phone field.',
    steps: [
      'Login and add items to cart',
      'Open API Tester',
      'Set method to POST, URL to /api/checkout',
      'Set body WITHOUT the phone field',
      'Send the request',
      'Check if the order is created (bug) or rejected (correct)',
    ],
  },
  {
    id: 7,
    title: 'Search SQL Injection',
    description: 'Test if the product search is vulnerable to SQL injection.',
    endpoint: "/api/products?search=' OR 1=1 --",
    method: 'GET',
    bugId: 'GT-019',
    reqId: 'REQ-015',
    expectedBehavior: 'Server should safely handle special characters and return normal results or error.',
    actualBehavior: 'SQL injection payload may cause unexpected behavior or return all products.',
    severity: 'Critical',
    priority: 'P0',
    hint: 'Try putting SQL code in the search parameter. A secure API should sanitize input.',
    steps: [
      'Open API Tester',
      'Set method to GET',
      'Try URL: /api/products?search=\' OR 1=1 --',
      'Also try: /api/products?search="; DROP TABLE products; --',
      'Check if the response shows all products (injection worked) or normal results',
    ],
  },
  {
    id: 8,
    title: 'Price Calculation Bug',
    description: 'Test if the checkout total has a calculation error for specific products.',
    endpoint: '/api/checkout',
    method: 'POST',
    body: JSON.stringify({ full_name: 'Test', email: 'test@test.com', phone: '123', address: 'Test' }, null, 2),
    bugId: 'GT-007',
    reqId: 'REQ-006',
    expectedBehavior: 'Total should equal price × quantity for each item, summed across all items.',
    actualBehavior: 'Products with IDs 3, 7, or 12 have an extra $1 added to the total.',
    severity: 'High',
    priority: 'P1',
    hint: 'Add product ID 3 (Smartphone Stand, $24.99) to cart with quantity 1. The total should be $24.99 but checkout shows $25.99.',
    steps: [
      'Login and add product ID 3 to cart with quantity 1',
      'Check cart total: GET /api/cart (note the total)',
      'Also check: GET /api/products/3 to verify the price',
      'Compare: cart shows $25.99 but product price is $24.99',
      'The extra $1 is the bug',
    ],
  },
];

const STORAGE_KEY = 'qa-api-challenges-progress';

const ApiChallengesPage: React.FC = () => {
  const navigate = useNavigate();
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [expandedChallenge, setExpandedChallenge] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<number | null>(null);
  const [requirements, setRequirements] = useState<{ id: number; req_id: string }[]>([]);

  useEffect(() => {
    loadRequirements();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedChallenges]));
  }, [completedChallenges]);

  const loadRequirements = async () => {
    try {
      const projects = await getProjects();
      const projectId = projects[0]?.id;
      if (projectId) {
        const reqs = await getRequirements(projectId);
        setRequirements(reqs);
      }
    } catch (error) {
      console.error('Failed to load requirements:', error);
    }
  };

  const handleComplete = (challengeId: number) => {
    setCompletedChallenges(prev => new Set(prev).add(challengeId));
    toast.success('Challenge completed!');
  };

  const handleSubmitBug = async (challenge: Omit<Challenge, 'requirementId'>) => {
    const req = requirements.find(r => r.req_id === challenge.reqId);
    try {
      const projects = await getProjects();
      const projectId = projects[0]?.id;
      if (projectId) {
        await createBugReport({
          project_id: projectId,
          requirement_id: req?.id,
          title: challenge.title,
          steps_to_reproduce: challenge.steps.join('\n'),
          expected_result: challenge.expectedBehavior,
          actual_result: challenge.actualBehavior,
          severity: challenge.severity,
          priority: challenge.priority,
          environment: 'API Tester, Chrome, macOS',
        });
        toast.success('Bug report created! View it in Bug Reports.');
        handleComplete(challenge.id);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create bug report');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Bug size={24} />
          API Bug-Finding Challenges
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Find real bugs in the API by testing endpoints. {completedChallenges.size} of {challenges.length} completed.
        </p>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-2">
          {challenges.map((c) => (
            <div
              key={c.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                completedChallenges.has(c.id) ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
              }`}
            >
              {completedChallenges.has(c.id) ? '✓' : c.id}
            </div>
          ))}
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${(completedChallenges.size / challenges.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {challenges.map((challenge) => {
          const isCompleted = completedChallenges.has(challenge.id);
          const isExpanded = expandedChallenge === challenge.id;
          const showingHint = showHint === challenge.id;

          return (
            <div key={challenge.id} className={`card ${isCompleted ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/30' : ''}`}>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedChallenge(isExpanded ? null : challenge.id)}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCompleted ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                  }`}>
                    {isCompleted ? <CheckCircle size={16} /> : challenge.id}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{challenge.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        challenge.method === 'GET' ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300'
                          : challenge.method === 'POST' ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                          : challenge.method === 'PUT' ? 'bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300'
                          : 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'
                      }`}>{challenge.method}</span>
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{challenge.endpoint}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${challenge.severity === 'Critical' ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300' : challenge.severity === 'High' ? 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300' : 'bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300'}`}>
                    {challenge.severity}
                  </span>
                  <ChevronRight size={16} className={`text-slate-400 dark:text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">{challenge.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-900/50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 mb-1">Expected</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">{challenge.expectedBehavior}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-1">Actual (Bug)</p>
                      <p className="text-sm text-red-700 dark:text-red-300">{challenge.actualBehavior}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Steps to Reproduce</p>
                    <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
                      {challenge.steps.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                  </div>

                  {challenge.body && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Request Body</p>
                      <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 dark:text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                        {challenge.body}
                      </pre>
                    </div>
                  )}

                  {showingHint && (
                    <div className="bg-amber-50 dark:bg-amber-900/50 rounded-xl p-3 flex items-start gap-2">
                      <Lightbulb size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-200">{challenge.hint}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button onClick={() => navigate('/api-tester')} className="btn btn-primary btn-sm">
                      <ExternalLink size={14} /> Open in API Tester
                    </button>
                    {!showingHint && (
                      <button onClick={() => setShowHint(challenge.id)} className="btn btn-outline btn-sm">
                        <Lightbulb size={14} /> Show Hint
                      </button>
                    )}
                    {!isCompleted && (
                      <button onClick={() => handleSubmitBug(challenge)} className="btn btn-success btn-sm">
                        <Send size={14} /> Submit Bug Report
                      </button>
                    )}
                    {isCompleted && (
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle size={14} /> Completed
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApiChallengesPage;
