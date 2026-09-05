export interface User {
  id: number;
  username: string;
  email: string;
  role: 'INTERN' | 'TRAINER';
  full_name: string;
  created_at?: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: string;
  created_at?: string;
}

export interface Requirement {
  id: number;
  project_id: number;
  req_id: string;
  title: string;
  description: string;
  acceptance_criteria: string;
  created_at?: string;
}

export interface TestCase {
  id: number;
  user_id: number;
  project_id: number;
  requirement_id: number | null;
  tc_id: string;
  title: string;
  preconditions: string | null;
  test_data: string | null;
  steps: string;
  expected_result: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  test_type: 'Functional' | 'UI/UX' | 'Security' | 'Performance' | 'API';
  status: 'Draft' | 'Ready' | 'Executed';
  created_at?: string;
  updated_at?: string;
  requirement_req_id?: string;
  api_method?: string;
  api_endpoint?: string;
  api_headers?: string;
  api_body?: string;
  expected_status_code?: number;
}

export interface TestExecution {
  id: number;
  user_id: number;
  test_case_id: number;
  status: 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT_EXECUTED';
  actual_result: string | null;
  comments: string | null;
  screenshot: string | null;
  executed_at: string;
  tc_id?: string;
  test_case_title?: string;
  requirement_id?: number;
}

export interface BugReport {
  id: number;
  user_id: number;
  project_id: number;
  requirement_id: number | null;
  test_case_id: number | null;
  bug_id: string;
  title: string;
  environment: string | null;
  steps_to_reproduce: string;
  expected_result: string;
  actual_result: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  screenshot: string | null;
  additional_notes: string | null;
  status: 'Open' | 'Under Review' | 'Resolved' | 'Rejected';
  created_at?: string;
  requirement_req_id?: string;
  test_case_tc_id?: string;
}

export interface GroundTruthBug {
  id: number;
  project_id: number;
  bug_id: string;
  requirement_id: number;
  title: string;
  description: string;
  expected_behavior: string;
  actual_behavior: string;
  severity: string;
  priority: string;
  module: string;
  trigger_condition: string;
  detection_keywords: string;
  detection_status?: 'Detected' | 'Not Detected';
  requirement_req_id?: string;
}

export interface Evaluation {
  bug_detection_score: number;
  requirement_mapping_score: number;
  reproduction_steps_score: number;
  expected_result_score: number;
  actual_result_score: number;
  severity_score: number;
  priority_score: number;
  test_case_quality_score: number;
  test_execution_score: number;
  overall_score: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  stock: number;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface Order {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  address: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  image_url: string | null;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  created_at: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  stock: number;
}

export interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  author_name: string;
  helpful_count?: number;
  user_vote?: number | null;
}

export interface ReviewStats {
  count: number;
  average: number;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TraceabilityItem {
  id: number;
  req_id: string;
  title: string;
  has_test_cases: boolean;
  test_case_count: number;
  has_bugs: boolean;
  bug_count: number;
  status: 'covered' | 'partial' | 'gaps';
}

export interface TraceabilityMatrix {
  requirements: TraceabilityItem[];
  summary: {
    total_requirements: number;
    with_test_cases: number;
    with_bugs: number;
    fully_covered: number;
    coverage_percentage: number;
  };
}

export interface CoverageData {
  summary: {
    total_requirements: number;
    with_test_cases: number;
    without_test_cases: number;
    with_bugs: number;
    total_test_cases: number;
    total_bug_reports: number;
    coverage_percentage: number;
  };
  uncovered_requirements: { req_id: string; title: string; description: string }[];
  module_stats: Record<string, { total: number; with_tc: number; with_bugs: number }>;
}

export interface Coupon {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
}

export interface SavedItem {
  id: number;
  product_id: number;
  created_at: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  stock: number;
}

export interface RecentlyViewedItem {
  product_id: number;
  viewed_at: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  stock: number;
}

export interface ReviewVoteResponse {
  helpful_count: number;
  user_vote: number | null;
}
