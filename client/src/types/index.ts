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
  test_type: 'Functional' | 'UI/UX' | 'Security' | 'Performance';
  status: 'Draft' | 'Ready' | 'Executed';
  created_at?: string;
  updated_at?: string;
  requirement_req_id?: string;
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
