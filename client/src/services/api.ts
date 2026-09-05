import { User, Project, Requirement, TestCase, TestExecution, BugReport, GroundTruthBug, Evaluation, Product, Cart, Order, PaginatedProducts, WishlistItem, Review, ReviewStats, TraceabilityMatrix, CoverageData, Coupon, SavedItem, RecentlyViewedItem, ReviewVoteResponse } from '../types';

const API_BASE = '/api';

let authToken: string | null = localStorage.getItem('token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => authToken;

const getEcommerceToken = () => localStorage.getItem('ecommerce_token');

const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const isEcommerceRoute = window.location.pathname.startsWith('/ecommerce');
  const token = isEcommerceRoute ? getEcommerceToken() : authToken;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (response.status === 401 || response.status === 403) {
    if (response.status === 401) {
      const isEcommerceRoute = window.location.pathname.startsWith('/ecommerce') || 
        ['/shop', '/cart', '/checkout'].includes(window.location.pathname);
      
      if (isEcommerceRoute && localStorage.getItem('ecommerce_token')) {
        localStorage.removeItem('ecommerce_token');
        window.location.href = '/ecommerce/login';
        throw new Error('Session expired');
      } else {
        setAuthToken(null);
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }
    const error = await response.json();
    throw new Error(error.error || 'Unauthorized');
  }
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
};

// Auth
export const login = async (username: string, password: string): Promise<{ token: string; user: User }> => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
};

export const register = async (data: { username: string; email: string; password: string; full_name: string }): Promise<{ token: string; user: User }> => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getMe = async (): Promise<{ user: User }> => {
  const response = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
  return handleResponse(response);
};

// Users
export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE}/users`, { headers: getHeaders() });
  return handleResponse(response);
};

export const getInterns = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE}/users/interns`, { headers: getHeaders() });
  return handleResponse(response);
};

// Projects
export const getProjects = async (): Promise<Project[]> => {
  const response = await fetch(`${API_BASE}/projects`, { headers: getHeaders() });
  return handleResponse(response);
};

export const getProject = async (id: number): Promise<Project> => {
  const response = await fetch(`${API_BASE}/projects/${id}`, { headers: getHeaders() });
  return handleResponse(response);
};

// Requirements
export const getRequirements = async (projectId?: number): Promise<Requirement[]> => {
  const url = projectId ? `${API_BASE}/requirements?project_id=${projectId}` : `${API_BASE}/requirements`;
  const response = await fetch(url, { headers: getHeaders() });
  return handleResponse(response);
};

export const getRequirement = async (id: number): Promise<Requirement> => {
  const response = await fetch(`${API_BASE}/requirements/${id}`, { headers: getHeaders() });
  return handleResponse(response);
};

// Test Cases
export const getTestCases = async (projectId?: number, userId?: number): Promise<TestCase[]> => {
  let url = `${API_BASE}/test-cases?`;
  if (projectId) url += `project_id=${projectId}&`;
  if (userId) url += `user_id=${userId}&`;
  const response = await fetch(url, { headers: getHeaders() });
  return handleResponse(response);
};

export const createTestCase = async (testCase: Partial<TestCase>): Promise<TestCase> => {
  const response = await fetch(`${API_BASE}/test-cases`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(testCase),
  });
  return handleResponse(response);
};

export const updateTestCase = async (id: number, testCase: Partial<TestCase>): Promise<TestCase> => {
  const response = await fetch(`${API_BASE}/test-cases/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(testCase),
  });
  return handleResponse(response);
};

export const deleteTestCase = async (id: number): Promise<void> => {
  await fetch(`${API_BASE}/test-cases/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
};

// Test Executions
export const getExecutions = async (projectId?: number, userId?: number): Promise<TestExecution[]> => {
  let url = `${API_BASE}/executions?`;
  if (projectId) url += `project_id=${projectId}&`;
  if (userId) url += `user_id=${userId}&`;
  const response = await fetch(url, { headers: getHeaders() });
  return handleResponse(response);
};

export const createExecution = async (execution: Partial<TestExecution>): Promise<TestExecution> => {
  const response = await fetch(`${API_BASE}/executions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(execution),
  });
  return handleResponse(response);
};

// Bug Reports
export const getBugReports = async (projectId?: number, userId?: number): Promise<BugReport[]> => {
  let url = `${API_BASE}/bug-reports?`;
  if (projectId) url += `project_id=${projectId}&`;
  if (userId) url += `user_id=${userId}&`;
  const response = await fetch(url, { headers: getHeaders() });
  return handleResponse(response);
};

export const createBugReport = async (bugReport: Partial<BugReport>): Promise<BugReport> => {
  const response = await fetch(`${API_BASE}/bug-reports`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(bugReport),
  });
  return handleResponse(response);
};

export const updateBugReport = async (id: number, bugReport: Partial<BugReport>): Promise<BugReport> => {
  const response = await fetch(`${API_BASE}/bug-reports/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(bugReport),
  });
  return handleResponse(response);
};

export const deleteBugReport = async (id: number): Promise<void> => {
  await fetch(`${API_BASE}/bug-reports/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
};

// Ground Truth (Trainer only)
export const getGroundTruthBugs = async (projectId?: number): Promise<GroundTruthBug[]> => {
  const url = projectId ? `${API_BASE}/ground-truth?project_id=${projectId}` : `${API_BASE}/ground-truth`;
  const response = await fetch(url, { headers: getHeaders() });
  return handleResponse(response);
};

export const getDetectionStatus = async (projectId: number): Promise<GroundTruthBug[]> => {
  const response = await fetch(`${API_BASE}/ground-truth/detection-status/${projectId}`, { headers: getHeaders() });
  return handleResponse(response);
};

// Evaluations
export const getMyScore = async (projectId: number): Promise<Evaluation> => {
  const response = await fetch(`${API_BASE}/evaluations/my-score/${projectId}`, { headers: getHeaders() });
  return handleResponse(response);
};

export const getInternEvaluation = async (userId: number, projectId: number): Promise<Evaluation> => {
  const response = await fetch(`${API_BASE}/evaluations/intern/${userId}/${projectId}`, { headers: getHeaders() });
  return handleResponse(response);
};

export const getAllInternScores = async (projectId: number): Promise<{ intern: User; evaluation: Evaluation }[]> => {
  const response = await fetch(`${API_BASE}/evaluations/all-interns/${projectId}`, { headers: getHeaders() });
  return handleResponse(response);
};

export const resetTraining = async (userId: number, projectId: number): Promise<void> => {
  await fetch(`${API_BASE}/evaluations/reset/${userId}/${projectId}`, {
    method: 'POST',
    headers: getHeaders(),
  });
};

// Products (E-commerce)
export const getProducts = async (category?: string, search?: string, page?: number, limit?: number, minPrice?: number, maxPrice?: number): Promise<PaginatedProducts> => {
  let url = `${API_BASE}/products?`;
  if (category) url += `category=${category}&`;
  if (search) url += `search=${encodeURIComponent(search)}&`;
  if (page) url += `page=${page}&`;
  if (limit) url += `limit=${limit}&`;
  if (minPrice !== undefined) url += `min_price=${minPrice}&`;
  if (maxPrice !== undefined) url += `max_price=${maxPrice}&`;
  const response = await fetch(url, { headers: getHeaders() });
  return handleResponse(response);
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await fetch(`${API_BASE}/products/${id}`, { headers: getHeaders() });
  return handleResponse(response);
};

export const getCategories = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE}/products/categories`, { headers: getHeaders() });
  return handleResponse(response);
};

// Cart
export const getCart = async (): Promise<Cart> => {
  const response = await fetch(`${API_BASE}/cart`, { headers: getHeaders() });
  return handleResponse(response);
};

export const addToCart = async (productId: number, quantity?: number): Promise<Cart> => {
  const response = await fetch(`${API_BASE}/cart/add`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  return handleResponse(response);
};

export const updateCartItem = async (productId: number, quantity: number): Promise<Cart> => {
  const response = await fetch(`${API_BASE}/cart/update`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  return handleResponse(response);
};

export const removeFromCart = async (productId: number): Promise<Cart> => {
  const response = await fetch(`${API_BASE}/cart/remove/${productId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const clearCart = async (): Promise<void> => {
  await fetch(`${API_BASE}/cart/clear`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
};

// Checkout
export const checkout = async (data: { full_name: string; email: string; phone?: string; address: string }): Promise<{ order: Order; items: any[] }> => {
  const response = await fetch(`${API_BASE}/checkout`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getOrderHistory = async (): Promise<Order[]> => {
  const response = await fetch(`${API_BASE}/checkout/history`, { headers: getHeaders() });
  return handleResponse(response);
};

// Wishlist
export const getWishlist = async (): Promise<WishlistItem[]> => {
  const response = await fetch(`${API_BASE}/wishlist`, { headers: getHeaders() });
  return handleResponse(response);
};

export const addToWishlist = async (productId: number): Promise<void> => {
  await fetch(`${API_BASE}/wishlist/add`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ product_id: productId }),
  });
};

export const removeFromWishlist = async (productId: number): Promise<void> => {
  await fetch(`${API_BASE}/wishlist/remove/${productId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
};

export const checkWishlist = async (productId: number): Promise<{ isWishlisted: boolean }> => {
  const response = await fetch(`${API_BASE}/wishlist/check/${productId}`, { headers: getHeaders() });
  return handleResponse(response);
};

// Reviews
export const getProductReviews = async (productId: number): Promise<{ reviews: Review[]; stats: ReviewStats }> => {
  const response = await fetch(`${API_BASE}/reviews/${productId}`, { headers: getHeaders() });
  return handleResponse(response);
};

export const createProductReview = async (productId: number, data: { rating: number; title?: string; comment?: string }): Promise<Review> => {
  const response = await fetch(`${API_BASE}/reviews/${productId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Related Products
export const getRelatedProducts = async (productId: number): Promise<Product[]> => {
  const response = await fetch(`${API_BASE}/products/${productId}/related`, { headers: getHeaders() });
  return handleResponse(response);
};

// Profile
export const updateProfile = async (data: { full_name?: string; email?: string; current_password?: string; new_password?: string }): Promise<{ user: User }> => {
  const response = await fetch(`${API_BASE}/ecommerce/auth/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Traceability Matrix
export const getTraceability = async (projectId: number): Promise<TraceabilityMatrix> => {
  const response = await fetch(`${API_BASE}/traceability/${projectId}`, { headers: getHeaders() });
  return handleResponse(response);
};

// Coverage Dashboard
export const getCoverage = async (projectId: number): Promise<CoverageData> => {
  const response = await fetch(`${API_BASE}/coverage/${projectId}`, { headers: getHeaders() });
  return handleResponse(response);
};

// Coupons
export const validateCoupon = async (code: string): Promise<Coupon> => {
  const response = await fetch(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ code }),
  });
  return handleResponse(response);
};

// Recently Viewed
export const getRecentlyViewed = async (): Promise<RecentlyViewedItem[]> => {
  const response = await fetch(`${API_BASE}/products/recently-viewed`, { headers: getHeaders() });
  return handleResponse(response);
};

// Saved Items
export const getSavedItems = async (): Promise<SavedItem[]> => {
  const response = await fetch(`${API_BASE}/saved`, { headers: getHeaders() });
  return handleResponse(response);
};

export const addToSaved = async (productId: number): Promise<SavedItem[]> => {
  const response = await fetch(`${API_BASE}/saved/add`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ product_id: productId }),
  });
  return handleResponse(response);
};

export const removeFromSaved = async (productId: number): Promise<SavedItem[]> => {
  const response = await fetch(`${API_BASE}/saved/remove/${productId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const moveToCart = async (productId: number): Promise<{ message: string; savedItems: SavedItem[] }> => {
  const response = await fetch(`${API_BASE}/saved/move-to-cart/${productId}`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// Review Votes
export const voteReview = async (reviewId: number, isHelpful: 1 | -1): Promise<ReviewVoteResponse> => {
  const response = await fetch(`${API_BASE}/reviews/${reviewId}/vote`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ is_helpful: isHelpful }),
  });
  return handleResponse(response);
};

// Order Status Update (Trainer only)
export const updateOrderStatus = async (orderId: number, status: string): Promise<Order> => {
  const response = await fetch(`${API_BASE}/checkout/${orderId}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
};

// Cancel Order
export const cancelOrder = async (orderId: number): Promise<Order> => {
  const response = await fetch(`${API_BASE}/checkout/${orderId}/cancel`, {
    method: 'PUT',
    headers: getHeaders(),
  });
  return handleResponse(response);
};
