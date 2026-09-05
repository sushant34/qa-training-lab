import React, { useState, useRef } from 'react';
import { getAuthToken } from '../services/api';
import { Send, Clock, Trash2 } from 'lucide-react';

interface HistoryEntry {
  method: string;
  url: string;
  status: number;
  time: number;
}

const ENDPOINTS = [
  'GET /api/health',
  'GET /api/products',
  'GET /api/products/categories',
  'GET /api/products/:id',
  'GET /api/products/:id/related',
  'GET /api/cart',
  'GET /api/wishlist',
  'GET /api/checkout/history',
  'GET /api/requirements',
  'GET /api/test-cases',
  'GET /api/executions',
  'GET /api/bug-reports',
  'GET /api/projects',
  'GET /api/traceability/:projectId',
  'GET /api/coverage/:projectId',
  'POST /api/auth/login',
  'POST /api/auth/register',
  'POST /api/ecommerce/auth/login',
  'POST /api/ecommerce/auth/register',
  'POST /api/cart/add',
  'POST /api/checkout',
  'POST /api/wishlist/add',
  'POST /api/test-cases',
  'POST /api/bug-reports',
  'PUT /api/cart/update',
  'PUT /api/test-cases/:id',
  'PUT /api/bug-reports/:id',
  'DELETE /api/cart/remove/:productId',
  'DELETE /api/cart/clear',
  'DELETE /api/wishlist/remove/:productId',
  'DELETE /api/test-cases/:id',
  'DELETE /api/bug-reports/:id',
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const ApiTesterPage: React.FC = () => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('/api/products');
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([
    { key: 'Content-Type', value: 'application/json' },
  ]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    body: string;
    time: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [endpointSearch, setEndpointSearch] = useState('');
  const [showEndpoints, setShowEndpoints] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const filteredEndpoints = ENDPOINTS.filter(ep =>
    ep.toLowerCase().includes(endpointSearch.toLowerCase())
  );

  const autoFillToken = () => {
    const token = getAuthToken();
    if (token) {
      const existingAuthIdx = headers.findIndex(h => h.key.toLowerCase() === 'authorization');
      if (existingAuthIdx >= 0) {
        const newHeaders = [...headers];
        newHeaders[existingAuthIdx] = { key: 'Authorization', value: `Bearer ${token}` };
        setHeaders(newHeaders);
      } else {
        setHeaders([...headers, { key: 'Authorization', value: `Bearer ${token}` }]);
      }
    }
  };

  const sendRequest = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const headerObj: Record<string, string> = {};
      headers.forEach(h => {
        if (h.key && h.value) headerObj[h.key] = h.value;
      });

      const fetchOptions: RequestInit = {
        method,
        headers: headerObj,
      };

      if (['POST', 'PUT'].includes(method) && body.trim()) {
        fetchOptions.body = body;
      }

      const res = await fetch(url, fetchOptions);
      const elapsed = Date.now() - startTime;
      const text = await res.text();

      let formattedBody = text;
      try {
        formattedBody = JSON.stringify(JSON.parse(text), null, 2);
      } catch {}

      setResponse({
        status: res.status,
        statusText: res.statusText,
        body: formattedBody,
        time: elapsed,
      });

      setHistory(prev => [
        { method, url, status: res.status, time: elapsed },
        ...prev.slice(0, 9),
      ]);
    } catch (error: any) {
      setResponse({
        status: 0,
        statusText: 'Error',
        body: error.message || 'Request failed',
        time: Date.now() - startTime,
      });
    } finally {
      setLoading(false);
    }
  };

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const removeHeader = (idx: number) => setHeaders(headers.filter((_, i) => i !== idx));
  const updateHeader = (idx: number, field: 'key' | 'value', val: string) => {
    const newHeaders = [...headers];
    newHeaders[idx][field] = val;
    setHeaders(newHeaders);
  };

  const selectEndpoint = (ep: string) => {
    const [m, ...urlParts] = ep.split(' ');
    setMethod(m);
    setUrl(urlParts.join(' '));
    setShowEndpoints(false);
    setEndpointSearch('');
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30';
    if (status >= 400 && status < 500) return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30';
    if (status >= 500) return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30';
    return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/50';
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">API Tester</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Send HTTP requests to test the API endpoints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="card space-y-4">
            <div className="flex gap-2">
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="input-field w-28 font-semibold"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={url}
                  onChange={e => { setUrl(e.target.value); setEndpointSearch(e.target.value); setShowEndpoints(true); }}
                  onFocus={() => setShowEndpoints(true)}
                  onBlur={() => setTimeout(() => setShowEndpoints(false), 200)}
                  className="input-field font-mono text-sm"
                  placeholder="/api/..."
                />
                {showEndpoints && endpointSearch && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredEndpoints.map(ep => (
                      <button
                        key={ep}
                        onMouseDown={() => selectEndpoint(ep)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                      >
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${METHOD_COLORS[ep.split(' ')[0]]}`}>
                          {ep.split(' ')[0]}
                        </span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{ep.split(' ').slice(1).join(' ')}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={sendRequest} disabled={loading} className="btn btn-primary">
                <Send size={16} />
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>

            <div className="flex gap-2 text-xs">
              <button onClick={autoFillToken} className="btn btn-outline btn-sm">
                Auto-fill Auth Token
              </button>
            </div>
          </div>

          <div className="card">
            <div className="flex gap-4 mb-3 border-b border-slate-100 dark:border-slate-700 pb-3">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Headers</span>
              <button onClick={addHeader} className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">+ Add</button>
            </div>
            <div className="space-y-2">
              {headers.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={h.key}
                    onChange={e => updateHeader(i, 'key', e.target.value)}
                    className="input-field text-sm"
                    placeholder="Key"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={e => updateHeader(i, 'value', e.target.value)}
                    className="input-field text-sm"
                    placeholder="Value"
                  />
                  <button onClick={() => removeHeader(i)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {['POST', 'PUT'].includes(method) && (
            <div className="card">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Request Body (JSON)</p>
              <textarea
                ref={bodyRef}
                value={body}
                onChange={e => setBody(e.target.value)}
                className="input-field font-mono text-sm h-40 resize-y"
                placeholder='{"key": "value"}'
              />
            </div>
          )}

          {response && (
            <div className="card">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Response</span>
                <span className={`px-2 py-0.5 rounded-lg text-sm font-bold ${getStatusColor(response.status)}`}>
                  {response.status} {response.statusText}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{response.time}ms</span>
              </div>
              <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-sm overflow-x-auto max-h-96 overflow-y-auto font-mono">
                {response.body}
              </pre>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">History</h3>
              <button onClick={() => setShowHistory(!showHistory)} className="text-xs text-indigo-600 dark:text-indigo-400">
                {showHistory ? 'Hide' : 'Show'}
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">No requests yet</p>
            ) : (
              <div className="space-y-1.5">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => { setMethod(h.method); setUrl(h.url); }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs flex items-center gap-2"
                  >
                    <span className={`font-bold px-1 py-0.5 rounded text-[10px] ${METHOD_COLORS[h.method]}`}>
                      {h.method}
                    </span>
                    <span className="font-mono text-slate-600 dark:text-slate-400 truncate flex-1">{h.url}</span>
                    <span className={h.status >= 200 && h.status < 300 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                      {h.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Quick Reference</h3>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <p><strong>200</strong> — Success</p>
              <p><strong>201</strong> — Created</p>
              <p><strong>400</strong> — Bad Request</p>
              <p><strong>401</strong> — Unauthorized</p>
              <p><strong>403</strong> — Forbidden</p>
              <p><strong>404</strong> — Not Found</p>
              <p><strong>500</strong> — Server Error</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTesterPage;
