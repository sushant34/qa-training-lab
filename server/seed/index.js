const db = require('../models/database');
const bcrypt = require('bcryptjs');

console.log('Seeding database...');

// Clear existing data
db.exec(`
  DELETE FROM reviews;
  DELETE FROM wishlist_items;
  DELETE FROM order_items;
  DELETE FROM orders;
  DELETE FROM cart_items;
  DELETE FROM evaluations;
  DELETE FROM ground_truth_bugs;
  DELETE FROM bug_reports;
  DELETE FROM test_executions;
  DELETE FROM test_cases;
  DELETE FROM requirements;
  DELETE FROM products;
  DELETE FROM projects;
  DELETE FROM users;
`);

// Seed Users
const users = [
  { username: 'trainer', email: 'trainer@qalab.com', password: 'April@2025', role: 'TRAINER', full_name: 'Training Manager' },
  { username: 'intern', email: 'intern@qalab.com', password: 'intern123', role: 'INTERN', full_name: 'QA Intern' },
];

const insertUser = db.prepare(
  'INSERT INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, ?, ?)'
);

users.forEach(user => {
  const hashedPassword = bcrypt.hashSync(user.password, 10);
  insertUser.run(user.username, user.email, hashedPassword, user.role, user.full_name);
});

console.log('Users seeded');

// Seed Project
const projectResult = db.prepare(
  'INSERT INTO projects (name, description, difficulty, status) VALUES (?, ?, ?, ?)'
).run(
  'E-Commerce Testing Challenge',
  'Test the online shopping application against the provided requirements. Create appropriate test cases, execute them, identify defects and submit high-quality bug reports.',
  'Beginner',
  'active'
);
const projectId = projectResult.lastInsertRowid;

console.log('Project seeded');

// Seed Requirements
const requirements = [
  {
    project_id: 1,
    req_id: 'REQ-001',
    title: 'User Registration',
    description: 'Users should be able to register using a valid email address and password.',
    acceptance_criteria: 'Email is required.\nEmail must be valid.\nPassword is required.\nPassword must contain at least 8 characters.\nPassword confirmation must match.'
  },
  {
    project_id: 1,
    req_id: 'REQ-002',
    title: 'User Login',
    description: 'Registered users should be able to log in using valid credentials.',
    acceptance_criteria: 'Valid username/email and password should allow login.\nInvalid credentials should not allow login.\nAppropriate error message should be displayed for invalid credentials.'
  },
  {
    project_id: 1,
    req_id: 'REQ-003',
    title: 'Product Search',
    description: 'Users should be able to search products by product name.',
    acceptance_criteria: 'Search should return matching products.\nSearch should not return unrelated products.\nSearch should work regardless of letter casing.'
  },
  {
    project_id: 1,
    req_id: 'REQ-004',
    title: 'Add Product to Cart',
    description: 'Users should be able to add available products to the shopping cart.',
    acceptance_criteria: 'Product should appear in the cart after clicking Add to Cart.\nCart quantity should increase when the same product is added again.\nCart should display the correct product price.'
  },
  {
    project_id: 1,
    req_id: 'REQ-005',
    title: 'Product Quantity',
    description: 'Users should be able to change product quantity in the cart.',
    acceptance_criteria: 'Quantity must be at least 1.\nQuantity cannot be negative.\nCart total should update when quantity changes.'
  },
  {
    project_id: 1,
    req_id: 'REQ-006',
    title: 'Cart Total',
    description: 'The cart total must equal: product price × quantity for every item, summed across all cart items.',
    acceptance_criteria: 'Product A = $10, Quantity = 2\nProduct B = $20, Quantity = 1\nTotal = $40'
  },
  {
    project_id: 1,
    req_id: 'REQ-007',
    title: 'Checkout',
    description: 'Users should be able to checkout by providing required customer information.',
    acceptance_criteria: 'Required fields: Full Name, Email, Phone, Address\nThe system must prevent checkout when required fields are missing.'
  },
  {
    project_id: 1,
    req_id: 'REQ-008',
    title: 'Logout',
    description: 'Users should be able to log out.',
    acceptance_criteria: 'After logout, protected pages should no longer be accessible without logging in again.'
  },
  {
    project_id: 1,
    req_id: 'REQ-009',
    title: 'Product Stock Display',
    description: 'Each product should display its current stock availability.',
    acceptance_criteria: 'Stock count is visible on product cards.\nOut-of-stock products should be clearly indicated.\nOut-of-stock products should not have an Add to Cart button.'
  },
  {
    project_id: 1,
    req_id: 'REQ-010',
    title: 'Order History',
    description: 'Users should be able to view their past orders.',
    acceptance_criteria: 'Order history shows all previous orders.\nEach order displays order ID, date, items, and total.\nOrders are sorted by most recent first.'
  },
  {
    project_id: 1,
    req_id: 'REQ-011',
    title: 'Stock Validation on Add to Cart',
    description: 'The system must validate stock availability before adding products to the cart.',
    acceptance_criteria: 'Cannot add more items than available stock.\nError message displayed when stock is insufficient.\nCart quantity cannot exceed available stock.'
  },
  {
    project_id: 1,
    req_id: 'REQ-012',
    title: 'Cart Persistence',
    description: 'Cart items should persist across sessions for the same user.',
    acceptance_criteria: 'Cart items are saved when user logs out.\nCart items are restored when user logs back in.\nCart items are per-user (not shared).'
  },
  {
    project_id: 1,
    req_id: 'REQ-013',
    title: 'Product Category Filter',
    description: 'Users should be able to filter products by category.',
    acceptance_criteria: 'Category dropdown shows all available categories.\nSelecting a category filters products to show only that category.\n"All Categories" option shows all products.'
  },
  {
    project_id: 1,
    req_id: 'REQ-014',
    title: 'Order Confirmation',
    description: 'After successful checkout, an order confirmation should be displayed.',
    acceptance_criteria: 'Order confirmation shows order ID and total amount.\nCart is cleared after successful order.\nUser can navigate back to shop from confirmation page.'
  },
  {
    project_id: 1,
    req_id: 'REQ-015',
    title: 'Form Input Sanitization',
    description: 'All user inputs must be properly sanitized to prevent injection attacks.',
    acceptance_criteria: 'SQL injection attempts in search are prevented.\nXSS attempts in form inputs are prevented.\nSpecial characters in inputs are handled safely.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC001',
    title: 'View Product Details',
    description: 'Users should be able to view detailed product information by clicking on a product.',
    acceptance_criteria: 'Clicking a product card navigates to the product details page.\nDetails page displays full product name, description, price, image, and stock.\nA back navigation or breadcrumb returns to the shop.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC002',
    title: 'Add to Cart from Details Page',
    description: 'Users should be able to add a product to the cart from the product details page with quantity selection.',
    acceptance_criteria: 'Quantity selector allows choosing 1 to available stock.\nAdd to Cart button adds the selected quantity.\nToast notification confirms the action.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC003',
    title: 'Add and Remove from Wishlist',
    description: 'Users should be able to add and remove products from a wishlist.',
    acceptance_criteria: 'Heart icon toggles wishlist status.\nWishlist page shows all saved products.\nRemoving from wishlist updates the UI immediately.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC004',
    title: 'View Wishlist',
    description: 'Users should be able to view their wishlist from the sidebar navigation.',
    acceptance_criteria: 'Wishlist page displays all saved products with images and prices.\nEmpty wishlist shows appropriate message.\nProducts can be added to cart from the wishlist.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC005',
    title: 'View Order History with Items',
    description: 'Users should be able to view past orders with individual item details.',
    acceptance_criteria: 'Order history shows order ID, date, total, and status.\nEach order can be expanded to show line items.\nOrders are sorted by most recent first.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC006',
    title: 'Submit Product Review',
    description: 'Users should be able to submit a star rating and text review for products.',
    acceptance_criteria: 'Rating must be between 1 and 5 stars.\nReview title and comment are optional.\nUser can only review a product once.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC007',
    title: 'View Product Reviews',
    description: 'Users should be able to view reviews and average rating on the product details page.',
    acceptance_criteria: 'Reviews display author name, rating, date, and text.\nAverage rating and total review count are shown.\nReviews are sorted by newest first.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC008',
    title: 'Edit User Profile',
    description: 'Users should be able to view and edit their profile information.',
    acceptance_criteria: 'User can update full name and email.\nEmail must be valid format.\nPassword change requires current password.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC009',
    title: 'Search Pagination',
    description: 'Product search results should be paginated with max 10 items per page.',
    acceptance_criteria: 'Pagination controls show page numbers and next/prev buttons.\nPage resets when search or filter changes.\nTotal pages are displayed.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC010',
    title: 'Stock Validation on Cart',
    description: 'The system must validate stock availability before allowing add to cart.',
    acceptance_criteria: 'Cannot add more items than available stock.\nQuantity selector max is limited to stock.\nOut-of-stock products show disabled Add to Cart.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC011',
    title: 'View Related Products',
    description: 'Product details page should show related products from the same category.',
    acceptance_criteria: 'Related products section shows up to 4 items.\nRelated products are from the same category.\nCurrent product is excluded from related list.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC012',
    title: 'Filter by Price Range',
    description: 'Users should be able to filter products by minimum and maximum price.',
    acceptance_criteria: 'Price filter inputs accept numeric values.\nProducts outside the range are excluded.\nFilter works with category and search filters.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC013',
    title: 'Profile Password Edit',
    description: 'Users should be able to change their password from the profile page.',
    acceptance_criteria: 'Current password is required to set new password.\nNew password must be at least 8 characters.\nSuccess message is shown after password change.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC014',
    title: 'Wishlist Persists Across Sessions',
    description: 'Wishlist items should persist when user logs out and back in.',
    acceptance_criteria: 'Wishlist items are saved per user in the database.\nWishlist is restored on login.\nWishlist items are not shared between users.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC015',
    title: 'Apply Coupon at Checkout',
    description: 'Users should be able to apply discount coupons during checkout.',
    acceptance_criteria: 'Coupon code input is available at checkout.\nValid coupons apply the correct discount.\nExpired or invalid coupons show appropriate errors.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC016',
    title: 'Order Status Tracking',
    description: 'Users should be able to track their order status visually.',
    acceptance_criteria: 'Order status shows a progress bar with steps.\nStatus progresses: Pending → Confirmed → Shipped → Delivered.\nUsers can cancel pending orders.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC017',
    title: 'Recently Viewed Products',
    description: 'Users should see recently viewed products on the shop page.',
    acceptance_criteria: 'Recently viewed products are tracked per user.\nShop page shows a "Recently Viewed" section.\nMax 8 recently viewed products are shown.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC018',
    title: 'Review Helpful Votes',
    description: 'Users should be able to vote on whether reviews are helpful.',
    acceptance_criteria: 'Thumbs up/down buttons appear on each review.\nVote count is displayed.\nUsers cannot vote on their own reviews.'
  },
  {
    project_id: 1,
    req_id: 'REQ-EC019',
    title: 'Save for Later',
    description: 'Users should be able to save cart items for later purchase.',
    acceptance_criteria: 'Save for Later button appears on cart items.\nSaved items are shown in a separate section.\nItems can be moved back to cart.'
  }
];

const insertRequirement = db.prepare(
  'INSERT INTO requirements (project_id, req_id, title, description, acceptance_criteria) VALUES (?, ?, ?, ?, ?)'
);

requirements.forEach(req => {
  insertRequirement.run(projectId, req.req_id, req.title, req.description, req.acceptance_criteria);
});

console.log('Requirements seeded');

// Look up requirement IDs by req_id for bug references
const requirementIdMap = {};
db.prepare('SELECT id, req_id FROM requirements WHERE project_id = ?').all(projectId).forEach(r => {
  requirementIdMap[r.req_id] = r.id;
});

// Map old numeric requirement_id to req_id string for lookup
const bugReqIdToReqId = {
  1: 'REQ-001', 2: 'REQ-002', 3: 'REQ-003', 4: 'REQ-004', 5: 'REQ-005',
  6: 'REQ-006', 7: 'REQ-007', 8: 'REQ-008', 9: 'REQ-009', 10: 'REQ-010',
  11: 'REQ-011', 12: 'REQ-012', 13: 'REQ-013', 14: 'REQ-014', 15: 'REQ-015',
};

// Seed Products
const products = [
  { name: 'Wireless Bluetooth Headphones', description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.', price: 149.99, category: 'Electronics', stock: 50, image_url: 'https://placehold.co/400x400/7c3aed/ffffff?text=Headphones' },
  { name: 'USB-C Charging Cable', description: 'Fast charging USB-C cable, 6 feet length.', price: 12.99, category: 'Accessories', stock: 200, image_url: 'https://placehold.co/400x400/2563eb/ffffff?text=USB-C+Cable' },
  { name: 'Smartphone Stand', description: 'Adjustable aluminum smartphone stand for desk.', price: 24.99, category: 'Accessories', stock: 100, image_url: 'https://placehold.co/400x400/2563eb/ffffff?text=Phone+Stand' },
  { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with adjustable DPI.', price: 34.99, category: 'Electronics', stock: 75, image_url: 'https://placehold.co/400x400/7c3aed/ffffff?text=Wireless+Mouse' },
  { name: 'Laptop Backpack', description: 'Water-resistant laptop backpack with USB charging port.', price: 49.99, category: 'Accessories', stock: 60, image_url: 'https://placehold.co/400x400/2563eb/ffffff?text=Backpack' },
  { name: 'Portable Power Bank', description: '20000mAh portable power bank with fast charging.', price: 39.99, category: 'Electronics', stock: 120, image_url: 'https://placehold.co/400x400/7c3aed/ffffff?text=Power+Bank' },
  { name: 'Smart Watch', description: 'Fitness tracking smartwatch with heart rate monitor.', price: 199.99, category: 'Electronics', stock: 40, image_url: 'https://placehold.co/400x400/7c3aed/ffffff?text=Smart+Watch' },
  { name: 'Bluetooth Speaker', description: 'Waterproof portable Bluetooth speaker.', price: 79.99, category: 'Electronics', stock: 80, image_url: 'https://placehold.co/400x400/7c3aed/ffffff?text=Speaker' },
  { name: 'Laptop Cooling Pad', description: 'Quiet cooling pad for laptops with LED lights.', price: 29.99, category: 'Accessories', stock: 90, image_url: 'https://placehold.co/400x400/2563eb/ffffff?text=Cooling+Pad' },
  { name: 'Webcam HD', description: '1080p HD webcam with built-in microphone.', price: 59.99, category: 'Electronics', stock: 65, image_url: 'https://placehold.co/400x400/7c3aed/ffffff?text=Webcam' },
  { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with blue switches.', price: 89.99, category: 'Accessories', stock: 55, image_url: 'https://placehold.co/400x400/2563eb/ffffff?text=Keyboard' },
  { name: 'Monitor Stand', description: 'Adjustable monitor stand with USB hub.', price: 44.99, category: 'Accessories', stock: 70, image_url: 'https://placehold.co/400x400/2563eb/ffffff?text=Monitor+Stand' },
  { name: 'Wireless Charger', description: 'Qi wireless charger for smartphones.', price: 29.99, category: 'Electronics', stock: 150, image_url: 'https://placehold.co/400x400/7c3aed/ffffff?text=Charger' },
  { name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness.', price: 34.99, category: 'Home', stock: 85, image_url: 'https://placehold.co/400x400/059669/ffffff?text=Desk+Lamp' },
  { name: 'Notebook Set', description: 'Premium notebook set with 3 notebooks.', price: 19.99, category: 'Home', stock: 200, image_url: 'https://placehold.co/400x400/059669/ffffff?text=Notebooks' },
  { name: 'Smartphone Case', description: 'Shockproof smartphone case with screen protector.', price: 15.99, category: 'Accessories', stock: 300, image_url: 'https://placehold.co/400x400/2563eb/ffffff?text=Phone+Case' },
  { name: 'Wireless Earbuds', description: 'True wireless earbuds with touch controls.', price: 69.99, category: 'Electronics', stock: 100, image_url: 'https://placehold.co/400x400/7c3aed/ffffff?text=Earbuds' },
  { name: 'Laptop Sleeve', description: 'Padded laptop sleeve for 15-inch laptops.', price: 24.99, category: 'Accessories', stock: 120, image_url: 'https://placehold.co/400x400/2563eb/ffffff?text=Laptop+Sleeve' },
  { name: 'Power Strip', description: 'Surge protector power strip with USB ports.', price: 22.99, category: 'Electronics', stock: 95, image_url: 'https://placehold.co/400x400/7c3aed/ffffff?text=Power+Strip' },
  { name: 'Cable Organizer', description: 'Desk cable organizer with clips.', price: 9.99, category: 'Accessories', stock: 250, image_url: 'https://placehold.co/400x400/2563eb/ffffff?text=Cable+Organizer' }
];

const insertProduct = db.prepare(
  'INSERT INTO products (name, description, price, category, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)'
);

products.forEach(product => {
  insertProduct.run(product.name, product.description, product.price, product.category, product.stock, product.image_url);
});

console.log('Products seeded');

// Seed Coupons
const coupons = [
  { code: 'SAVE10', discount_type: 'percentage', discount_value: 10, min_order_amount: 25, max_uses: 100, expires_at: '2026-12-31', is_active: 1 },
  { code: 'FLAT5', discount_type: 'fixed', discount_value: 5, min_order_amount: 20, max_uses: 50, expires_at: '2026-12-31', is_active: 1 },
  { code: 'EXPIRED', discount_type: 'percentage', discount_value: 20, min_order_amount: 0, max_uses: 100, expires_at: '2025-01-01', is_active: 1 },
  { code: 'USEDUP', discount_type: 'percentage', discount_value: 15, min_order_amount: 0, max_uses: 1, used_count: 1, expires_at: '2026-12-31', is_active: 1 },
];

const insertCoupon = db.prepare(
  'INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, used_count, expires_at, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);

coupons.forEach(coupon => {
  insertCoupon.run(coupon.code, coupon.discount_type, coupon.discount_value, coupon.min_order_amount, coupon.max_uses, coupon.used_count, coupon.expires_at, coupon.is_active);
});

console.log('Coupons seeded');

// Seed Ground Truth Bugs
const groundTruthBugs = [
  {
    project_id: 1,
    bug_id: 'GT-001',
    requirement_id: 1,
    title: 'Registration accepts passwords shorter than 8 characters',
    description: 'The registration form accepts passwords with less than 8 characters, violating REQ-001.',
    expected_behavior: 'Password must contain at least 8 characters. Registration should reject passwords shorter than 8 characters.',
    actual_behavior: 'Registration accepts passwords of any length, including 1-7 characters.',
    severity: 'High',
    priority: 'P1',
    module: 'Registration',
    trigger_condition: 'Enter a password with less than 8 characters during registration.',
    detection_keywords: 'password,length,8 characters,registration,short password'
  },
  {
    project_id: 1,
    bug_id: 'GT-002',
    requirement_id: 1,
    title: 'Registration accepts invalid email formats',
    description: 'The registration form accepts invalid email formats like "test" or "test@".',
    expected_behavior: 'Email must be valid format (e.g., user@example.com). Registration should reject invalid email formats.',
    actual_behavior: 'Registration accepts any text as email, including invalid formats.',
    severity: 'High',
    priority: 'P1',
    module: 'Registration',
    trigger_condition: 'Enter an invalid email format during registration.',
    detection_keywords: 'email,valid,invalid,format,registration'
  },
  {
    project_id: 1,
    bug_id: 'GT-003',
    requirement_id: 2,
    title: 'Login accepts incorrect password',
    description: 'The login form accepts incorrect passwords for valid accounts.',
    expected_behavior: 'Invalid credentials should not allow login. Appropriate error message should be displayed.',
    actual_behavior: 'Login succeeds even with incorrect password.',
    severity: 'Critical',
    priority: 'P0',
    module: 'Login',
    trigger_condition: 'Enter valid username with incorrect password.',
    detection_keywords: 'login,password,incorrect,wrong,authentication'
  },
  {
    project_id: 1,
    bug_id: 'GT-004',
    requirement_id: 3,
    title: 'Search returns unrelated products for some search terms',
    description: 'Product search returns unrelated products when searching for certain terms.',
    expected_behavior: 'Search should return matching products and not return unrelated products.',
    actual_behavior: 'Search returns products that do not match the search term.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Product Search',
    trigger_condition: 'Search for specific product names and observe unrelated results.',
    detection_keywords: 'search,unrelated,products,filter,results'
  },
  {
    project_id: 1,
    bug_id: 'GT-005',
    requirement_id: 5,
    title: 'Cart allows quantity 0',
    description: 'The shopping cart allows setting product quantity to 0.',
    expected_behavior: 'Quantity must be at least 1. Setting quantity to 0 should remove the item.',
    actual_behavior: 'Cart allows setting quantity to 0, resulting in incorrect calculations.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Shopping Cart',
    trigger_condition: 'Set product quantity to 0 in the cart.',
    detection_keywords: 'cart,quantity,0,minimum,zero'
  },
  {
    project_id: 1,
    bug_id: 'GT-006',
    requirement_id: 5,
    title: 'Cart allows negative quantity',
    description: 'The shopping cart allows setting product quantity to negative values.',
    expected_behavior: 'Quantity cannot be negative.',
    actual_behavior: 'Cart accepts negative quantity values.',
    severity: 'High',
    priority: 'P1',
    module: 'Shopping Cart',
    trigger_condition: 'Set product quantity to a negative number.',
    detection_keywords: 'cart,quantity,negative,minus'
  },
  {
    project_id: 1,
    bug_id: 'GT-007',
    requirement_id: 6,
    title: 'Cart total is incorrectly calculated for selected products',
    description: 'The cart total calculation is incorrect for certain products (IDs 3, 7, 12).',
    expected_behavior: 'Cart total must equal product price × quantity for every item, summed across all cart items.',
    actual_behavior: 'Cart adds an extra $1 to the total for products with IDs 3, 7, and 12.',
    severity: 'High',
    priority: 'P1',
    module: 'Shopping Cart',
    trigger_condition: 'Add specific products (IDs 3, 7, or 12) to cart and check total.',
    detection_keywords: 'cart,total,calculation,price,amount,incorrect'
  },
  {
    project_id: 1,
    bug_id: 'GT-008',
    requirement_id: 7,
    title: 'Checkout allows submission without phone number',
    description: 'The checkout form does not require phone number to be filled.',
    expected_behavior: 'Phone is a required field. System must prevent checkout when phone is missing.',
    actual_behavior: 'Checkout proceeds without phone number being entered.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Checkout',
    trigger_condition: 'Submit checkout form without entering phone number.',
    detection_keywords: 'checkout,phone,required,field,missing,validation'
  },
  {
    project_id: 1,
    bug_id: 'GT-009',
    requirement_id: 8,
    title: 'Logout does not completely invalidate the session',
    description: 'After logout, the session is not fully invalidated.',
    expected_behavior: 'After logout, protected pages should no longer be accessible without logging in again.',
    actual_behavior: 'Session remains partially active after logout.',
    severity: 'Critical',
    priority: 'P0',
    module: 'Authentication',
    trigger_condition: 'Log out and try to access protected pages.',
    detection_keywords: 'logout,session,invalid,token,access,protected'
  },
  {
    project_id: 1,
    bug_id: 'GT-010',
    requirement_id: 6,
    title: 'Cart quantity does not correctly update the displayed total',
    description: 'When updating cart quantity, the displayed total does not update correctly.',
    expected_behavior: 'Cart total should update when quantity changes.',
    actual_behavior: 'Displayed total is stale or incorrect after quantity change.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Shopping Cart',
    trigger_condition: 'Change product quantity and observe the cart total display.',
    detection_keywords: 'cart,total,update,quantity,display,refresh'
  },
  {
    project_id: 1,
    bug_id: 'GT-011',
    requirement_id: 4,
    title: 'Add to cart button does not update existing cart quantity',
    description: 'When adding the same product again, cart shows duplicate entries instead of increasing quantity.',
    expected_behavior: 'Cart quantity should increase when the same product is added again.',
    actual_behavior: 'Cart shows duplicate entries instead of increasing quantity.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Shopping Cart',
    trigger_condition: 'Add the same product to cart twice.',
    detection_keywords: 'cart,add,duplicate,quantity,increase,same product'
  },
  {
    project_id: 1,
    bug_id: 'GT-012',
    requirement_id: 1,
    title: 'Registration does not validate password confirmation',
    description: 'Registration does not check if password confirmation matches password.',
    expected_behavior: 'Password confirmation must match.',
    actual_behavior: 'Registration accepts different password and confirmation.',
    severity: 'High',
    priority: 'P1',
    module: 'Registration',
    trigger_condition: 'Enter different values in password and confirm password fields.',
    detection_keywords: 'registration,confirm,password,mismatch,validation'
  },
  {
    project_id: 1,
    bug_id: 'GT-013',
    requirement_id: 11,
    title: 'No stock validation when adding to cart',
    description: 'The system does not check product stock before adding items to cart.',
    expected_behavior: 'System should prevent adding items exceeding available stock.',
    actual_behavior: 'Users can add unlimited quantities regardless of stock level.',
    severity: 'High',
    priority: 'P1',
    module: 'Shopping Cart',
    trigger_condition: 'Add a product to cart with quantity exceeding available stock.',
    detection_keywords: 'stock,limit,quantity,inventory,add to cart,overflow'
  },
  {
    project_id: 1,
    bug_id: 'GT-014',
    requirement_id: 10,
    title: 'Order history does not show individual order items',
    description: 'Order history page only shows order totals but not the individual items in each order.',
    expected_behavior: 'Each order should display its items with names, quantities, and prices.',
    actual_behavior: 'Order history only shows order ID, date, and total without item details.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Order History',
    trigger_condition: 'View order history and click on a completed order.',
    detection_keywords: 'order,history,items,details,missing,display'
  },
  {
    project_id: 1,
    bug_id: 'GT-015',
    requirement_id: 9,
    title: 'Out-of-stock products still show Add to Cart button',
    description: 'Products with zero stock still display the Add to Cart button.',
    expected_behavior: 'Out-of-stock products should show "Out of Stock" instead of Add to Cart.',
    actual_behavior: 'Add to Cart button is visible even when product stock is 0.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Product Display',
    trigger_condition: 'View a product with stock = 0 in the product listing.',
    detection_keywords: 'stock,out of,button,display,availability'
  },
  {
    project_id: 1,
    bug_id: 'GT-016',
    requirement_id: 6,
    title: 'Cart total not cleared after successful checkout',
    description: 'After placing an order, the cart total is not properly cleared on the frontend.',
    expected_behavior: 'Cart should be empty after successful checkout.',
    actual_behavior: 'Cart still shows previous total after order is placed.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Checkout',
    trigger_condition: 'Complete a checkout and navigate back to cart.',
    detection_keywords: 'cart,clear,checkout,total,persist,after order'
  },
  {
    project_id: 1,
    bug_id: 'GT-017',
    requirement_id: 7,
    title: 'Checkout does not validate email format',
    description: 'Checkout form accepts invalid email formats without any validation.',
    expected_behavior: 'Email should be validated for correct format (e.g., user@example.com).',
    actual_behavior: 'Checkout accepts any text as email including "abc" or "test@".',
    severity: 'High',
    priority: 'P1',
    module: 'Checkout',
    trigger_condition: 'Submit checkout form with invalid email format.',
    detection_keywords: 'checkout,email,validation,format,invalid'
  },
  {
    project_id: 1,
    bug_id: 'GT-018',
    requirement_id: 5,
    title: 'Cart allows adding quantity exceeding stock via direct API',
    description: 'The cart API does not validate quantity against available stock.',
    expected_behavior: 'API should reject requests where cart quantity exceeds product stock.',
    actual_behavior: 'API accepts any quantity value regardless of product stock level.',
    severity: 'High',
    priority: 'P1',
    module: 'Shopping Cart',
    trigger_condition: 'Send POST /api/cart/add with quantity greater than product stock.',
    detection_keywords: 'api,stock,quantity,limit,validation,bypass'
  },
  {
    project_id: 1,
    bug_id: 'GT-019',
    requirement_id: 15,
    title: 'Search input is vulnerable to SQL injection',
    description: 'The product search does not properly sanitize input, allowing SQL injection attempts.',
    expected_behavior: 'All user inputs should be sanitized to prevent injection attacks.',
    actual_behavior: 'Special SQL characters in search input can cause unexpected behavior.',
    severity: 'Critical',
    priority: 'P0',
    module: 'Product Search',
    trigger_condition: 'Enter SQL injection payload in search field (e.g., " OR 1=1 --).',
    detection_keywords: 'sql,injection,search,security, sanitize, input'
  },
  {
    project_id: 1,
    bug_id: 'GT-020',
    requirement_id: 13,
    title: 'Category filter does not reset when search is cleared',
    description: 'When clearing the search input, the category filter selection is also reset.',
    expected_behavior: 'Clearing search should only clear search, preserving category filter.',
    actual_behavior: 'Category filter resets to "All Categories" when search is cleared.',
    severity: 'Low',
    priority: 'P3',
    module: 'Product Search',
    trigger_condition: 'Select a category, then type and clear a search term.',
    detection_keywords: 'filter,category,search,reset,clear,interaction'
  },
  {
    project_id: 1,
    bug_id: 'GT-021',
    requirement_id: 9,
    title: 'Product category label shows incorrect category',
    description: 'The Laptop Backpack (product ID 5) displays "Electronics" as its category label instead of "Accessories".',
    expected_behavior: 'Product category label must match the actual product category stored in the database.',
    actual_behavior: 'The Laptop Backpack shows "Electronics" category label instead of "Accessories".',
    severity: 'Medium',
    priority: 'P2',
    module: 'Product Display',
    trigger_condition: 'Browse products and check the category label of the Laptop Backpack.',
    detection_keywords: 'product,category,label,incorrect,wrong,mismatch,backpack'
  },
  {
    project_id: 1,
    bug_id: 'GT-022',
    requirement_id: 9,
    title: 'Product description shows incorrect information',
    description: 'The Bluetooth Speaker (product ID 8) shows the wrong product description text.',
    expected_behavior: 'Each product must display its own correct description.',
    actual_behavior: 'The Bluetooth Speaker displays an incorrect or unrelated description.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Product Display',
    trigger_condition: 'Browse products and read the description of the Bluetooth Speaker.',
    detection_keywords: 'product,description,wrong,incorrect,mismatch,speaker'
  },
  {
    project_id: 1,
    bug_id: 'GT-023',
    requirement_id: 4,
    title: 'Add to Cart button is missing on one product',
    description: 'The Webcam HD (product ID 10) does not display an Add to Cart button even though it is in stock.',
    expected_behavior: 'All in-stock products must display an Add to Cart button.',
    actual_behavior: 'The Webcam HD product card has no Add to Cart button visible.',
    severity: 'High',
    priority: 'P1',
    module: 'Product Display',
    trigger_condition: 'Browse products and locate the Webcam HD product card.',
    detection_keywords: 'product,button,add to cart,missing,hidden,webcam'
  },
  {
    project_id: 1,
    bug_id: 'GT-024',
    requirement_id: 9,
    title: 'Product price displays as zero',
    description: 'The Notebook Set (product ID 15) displays a price of $0.00 instead of the correct price $19.99.',
    expected_behavior: 'Product price must display the correct price from the database.',
    actual_behavior: 'The Notebook Set shows $0.00 instead of $19.99.',
    severity: 'High',
    priority: 'P1',
    module: 'Product Display',
    trigger_condition: 'Browse products and check the price of the Notebook Set.',
    detection_keywords: 'product,price,zero,incorrect,0.00,notebook'
  },
  {
    project_id: 1,
    bug_id: 'GT-025',
    requirement_id: 9,
    title: 'Product image shows wrong product',
    description: 'The Wireless Mouse (product ID 4) displays the image for headphones instead of a mouse image.',
    expected_behavior: 'Each product must display its own correct product image.',
    actual_behavior: 'The Wireless Mouse product card shows an image of headphones.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Product Display',
    trigger_condition: 'Browse products and check the image of the Wireless Mouse.',
    detection_keywords: 'product,image,wrong,incorrect,mismatch,mouse,headphones'
  },
  {
    project_id: 1,
    bug_id: 'GT-026',
    requirement_id: null,
    req_id_ref: 'REQ-EC001',
    title: 'Product details page crashes for non-existent product ID',
    description: 'Navigating to a product details page with an invalid ID causes a crash instead of showing an error.',
    expected_behavior: 'Page should show "Product not found" message or redirect to shop.',
    actual_behavior: 'Page crashes with an unhandled error when product ID does not exist.',
    severity: 'High',
    priority: 'P1',
    module: 'Product Details',
    trigger_condition: 'Navigate to /ecommerce/products/99999.',
    detection_keywords: 'details,crash,not found,invalid id,error'
  },
  {
    project_id: 1,
    bug_id: 'GT-027',
    requirement_id: null,
    req_id_ref: 'REQ-EC001',
    title: 'Product price displays as NaN on details page',
    description: 'Product details page shows NaN for price when the product has a null or undefined price.',
    expected_behavior: 'Price should display correctly or show "Price not available".',
    actual_behavior: 'Price shows NaN instead of the actual price value.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Product Details',
    trigger_condition: 'View product details for a product with missing price data.',
    detection_keywords: 'price,nan,display,undefined,details'
  },
  {
    project_id: 1,
    bug_id: 'GT-028',
    requirement_id: null,
    req_id_ref: 'REQ-EC003',
    title: 'Wishlist badge count shows incorrect number',
    description: 'The wishlist count indicator shows wrong number of items.',
    expected_behavior: 'Badge should show the exact count of items in the wishlist.',
    actual_behavior: 'Badge count is off by one or shows stale data.',
    severity: 'Low',
    priority: 'P3',
    module: 'Wishlist',
    trigger_condition: 'Add or remove items from wishlist and observe badge count.',
    detection_keywords: 'wishlist,badge,count,incorrect,wrong number'
  },
  {
    project_id: 1,
    bug_id: 'GT-029',
    requirement_id: null,
    req_id_ref: 'REQ-EC005',
    title: 'Order history displays raw ISO date string',
    description: 'Order dates are shown in raw ISO format (e.g., 2026-08-31T12:00:00.000Z) instead of user-friendly format.',
    expected_behavior: 'Dates should be formatted as readable strings (e.g., Aug 31, 2026).',
    actual_behavior: 'Raw ISO 8601 timestamp strings are displayed.',
    severity: 'Low',
    priority: 'P3',
    module: 'Order History',
    trigger_condition: 'View order history page.',
    detection_keywords: 'order,date,iso,format,timestamp,display'
  },
  {
    project_id: 1,
    bug_id: 'GT-030',
    requirement_id: null,
    req_id_ref: 'REQ-EC006',
    title: 'Review form allows submission with 0 stars',
    description: 'The review form can be submitted without selecting a star rating.',
    expected_behavior: 'Rating must be between 1 and 5. Form should reject 0-star submission.',
    actual_behavior: 'Review form accepts and submits 0-star ratings.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Product Reviews',
    trigger_condition: 'Submit a review without selecting any star rating.',
    detection_keywords: 'review,rating,0,stars,validation,submit'
  },
  {
    project_id: 1,
    bug_id: 'GT-031',
    requirement_id: null,
    req_id_ref: 'REQ-EC002',
    title: 'Quantity selector allows adding more than available stock',
    description: 'Product details page quantity selector does not cap at available stock.',
    expected_behavior: 'Quantity selector maximum should be limited to product stock.',
    actual_behavior: 'User can set quantity higher than available stock.',
    severity: 'High',
    priority: 'P1',
    module: 'Product Details',
    trigger_condition: 'Set quantity on product details page to a value higher than stock.',
    detection_keywords: 'quantity,stock,limit,max,overflow,details'
  },
  {
    project_id: 1,
    bug_id: 'GT-032',
    requirement_id: null,
    req_id_ref: 'REQ-EC001',
    title: 'Broken product image not handled with fallback',
    description: 'Product details page does not show a fallback when the image URL is broken.',
    expected_behavior: 'Broken image should show a placeholder or emoji fallback.',
    actual_behavior: 'Broken image icon is displayed instead of a graceful fallback.',
    severity: 'Low',
    priority: 'P3',
    module: 'Product Details',
    trigger_condition: 'View product details for a product with an invalid image URL.',
    detection_keywords: 'image,broken,fallback,placeholder,display'
  },
  {
    project_id: 1,
    bug_id: 'GT-033',
    requirement_id: null,
    req_id_ref: 'REQ-EC007',
    title: 'Reviews remain visible after user logs out',
    description: 'Product reviews submitted by a user remain visible in the UI after the user logs out.',
    expected_behavior: 'Reviews should be properly associated with the user and persist independently.',
    actual_behavior: 'Review display state is not cleared on logout.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Product Reviews',
    trigger_condition: 'Submit a review, then log out and view the product page.',
    detection_keywords: 'review,logout,persist,session,cache'
  },
  {
    project_id: 1,
    bug_id: 'GT-034',
    requirement_id: null,
    req_id_ref: 'REQ-EC009',
    title: 'Page number not reset when search term changes',
    description: 'When user is on page 2+ and changes the search term, the page number does not reset to 1.',
    expected_behavior: 'Pagination should reset to page 1 when search or filter changes.',
    actual_behavior: 'Page stays on the current number after search change, potentially showing no results.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Search/Pagination',
    trigger_condition: 'Navigate to page 2, then change the search term.',
    detection_keywords: 'pagination,search,reset,page,filter'
  },
  {
    project_id: 1,
    bug_id: 'GT-035',
    requirement_id: null,
    req_id_ref: 'REQ-EC012',
    title: 'Price filter with min > max returns all products',
    description: 'Setting minimum price higher than maximum price returns all products instead of empty or error.',
    expected_behavior: 'Should return empty results or show validation error.',
    actual_behavior: 'Returns all products as if no filter was applied.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Search/Filter',
    trigger_condition: 'Set min price to 100 and max price to 10.',
    detection_keywords: 'price,filter,min,max,range,validation'
  },
  {
    project_id: 1,
    bug_id: 'GT-036',
    requirement_id: null,
    req_id_ref: 'REQ-EC011',
    title: 'Related products include the current product',
    description: 'The related products section on the details page includes the product currently being viewed.',
    expected_behavior: 'Current product should be excluded from related products list.',
    actual_behavior: 'Current product appears in its own related products section.',
    severity: 'Low',
    priority: 'P3',
    module: 'Product Details',
    trigger_condition: 'View product details and check the related products section.',
    detection_keywords: 'related,products,self,current,exclude,duplicate'
  },
  {
    project_id: 1,
    bug_id: 'GT-037',
    requirement_id: null,
    req_id_ref: 'REQ-EC013',
    title: 'Profile update accepts invalid email format',
    description: 'The profile update endpoint does not validate email format, allowing invalid emails.',
    expected_behavior: 'Email should be validated for correct format before updating.',
    actual_behavior: 'Profile update accepts any string as email.',
    severity: 'High',
    priority: 'P1',
    module: 'User Profile',
    trigger_condition: 'Update profile with an invalid email like "notanemail".',
    detection_keywords: 'profile,email,validation,format,update'
  },
  {
    project_id: 1,
    bug_id: 'GT-040',
    requirement_id: null,
    req_id_ref: 'REQ-EC010',
    title: 'Product stock not decremented after order placement',
    description: 'When an order is placed, the product stock quantity is not reduced. Multiple users can purchase the same last unit of a product.',
    expected_behavior: 'Product stock should be decremented by the ordered quantity when an order is placed.',
    actual_behavior: 'Stock remains unchanged after order placement, allowing overselling of products.',
    severity: 'High',
    priority: 'P1',
    module: 'Checkout',
    trigger_condition: 'Add a product with stock=1 to cart, place the order, then check the product stock in the database.',
    detection_keywords: 'stock,decrement,order,inventory,oversell,quantity'
  },
  {
    project_id: 1,
    bug_id: 'GT-041',
    requirement_id: null,
    req_id_ref: 'REQ-EC010',
    title: 'Cart validators exist but are never applied',
    description: 'The server defines cartAddRules and cartUpdateRules validators in validators/cart.js but they are never imported or used in the cart routes.',
    expected_behavior: 'Cart add and update endpoints should validate product_id is a positive integer and quantity is an integer.',
    actual_behavior: 'Cart endpoints accept any values for product_id and quantity without validation.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Shopping Cart',
    trigger_condition: 'Send a POST to /api/cart/add with product_id=-1 or quantity="abc".',
    detection_keywords: 'cart,validator,validation,product_id,quantity,middleware'
  },
  {
    project_id: 1,
    bug_id: 'GT-042',
    requirement_id: null,
    req_id_ref: 'REQ-EC006',
    title: 'Empty cart checkout redirects to wrong path',
    description: 'When the cart is empty during checkout, the page navigates to /cart instead of /ecommerce/cart.',
    expected_behavior: 'Should redirect to /ecommerce/cart when cart is empty.',
    actual_behavior: 'Redirects to /cart which results in a 404 or incorrect page.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Checkout',
    trigger_condition: 'Navigate to /ecommerce/checkout with an empty cart.',
    detection_keywords: 'checkout,redirect,cart,empty,navigation,path'
  },
  {
    project_id: 1,
    bug_id: 'GT-043',
    requirement_id: null,
    req_id_ref: 'REQ-EC007',
    title: 'No duplicate review prevention on frontend',
    description: 'The frontend does not check if a user has already reviewed a product. Submitting a duplicate review shows a 409 error toast instead of gracefully handling it.',
    expected_behavior: 'Frontend should check for existing reviews and hide/disable the review form or show a message.',
    actual_behavior: 'Review form is always shown, and duplicate submission results in a cryptic 409 error.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Product Reviews',
    trigger_condition: 'Submit a review for a product, then try to submit another review for the same product.',
    detection_keywords: 'review,duplicate,409,conflict,already reviewed'
  },
  {
    project_id: 1,
    bug_id: 'GT-044',
    requirement_id: null,
    req_id_ref: 'REQ-EC015',
    title: 'Coupon code validation is case-sensitive',
    description: 'The coupon validation requires exact case match. Entering "save10" instead of "SAVE10" rejects the coupon.',
    expected_behavior: 'Coupon codes should be case-insensitive. "save10", "Save10", and "SAVE10" should all be accepted.',
    actual_behavior: 'Coupon validation is case-sensitive, requiring exact case match.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Coupons',
    trigger_condition: 'Enter coupon code "save10" (lowercase) instead of "SAVE10" at checkout.',
    detection_keywords: 'coupon,case,sensitive,lowercase,uppercase,validation'
  },
  {
    project_id: 1,
    bug_id: 'GT-045',
    requirement_id: null,
    req_id_ref: 'REQ-EC015',
    title: 'Expired coupon is still accepted',
    description: 'Coupons with an expires_at date in the past are still accepted and applied to orders.',
    expected_behavior: 'Expired coupons should be rejected with an appropriate error message.',
    actual_behavior: 'Expired coupons are accepted and the discount is applied.',
    severity: 'High',
    priority: 'P1',
    module: 'Coupons',
    trigger_condition: 'Apply coupon code "EXPIRED" which has an expires_at date of 2025-01-01.',
    detection_keywords: 'coupon,expired,expiry,date,expiration,validity'
  },
  {
    project_id: 1,
    bug_id: 'GT-046',
    requirement_id: null,
    req_id_ref: 'REQ-EC015',
    title: 'Coupon max_uses limit is not enforced',
    description: 'Coupons with a max_uses limit can be used beyond their limit. The used_count is not checked.',
    expected_behavior: 'Coupon should be rejected when used_count >= max_uses.',
    actual_behavior: 'Coupon is accepted even after exceeding max_uses limit.',
    severity: 'High',
    priority: 'P1',
    module: 'Coupons',
    trigger_condition: 'Apply coupon code "USEDUP" which has max_uses=1 and used_count=1.',
    detection_keywords: 'coupon,max,uses,limit,used_count,exceeded'
  },
  {
    project_id: 1,
    bug_id: 'GT-047',
    requirement_id: null,
    req_id_ref: 'REQ-EC016',
    title: 'Order status can skip intermediate steps',
    description: 'Order status can be updated from Pending directly to Delivered, skipping Confirmed and Shipped.',
    expected_behavior: 'Status updates should follow the sequence: Pending → Confirmed → Shipped → Delivered.',
    actual_behavior: 'Any status can be set regardless of current status, allowing skipped steps.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Order Tracking',
    trigger_condition: 'Update an order from Pending directly to Delivered via API.',
    detection_keywords: 'order,status,skip,step,transition,sequence'
  },
  {
    project_id: 1,
    bug_id: 'GT-048',
    requirement_id: null,
    req_id_ref: 'REQ-EC016',
    title: 'Order status can be changed backwards',
    description: 'Order status can be changed from a later state to an earlier one (e.g., Delivered to Pending).',
    expected_behavior: 'Status should only move forward in the sequence, never backwards.',
    actual_behavior: 'Status can be set to any valid state regardless of current status.',
    severity: 'High',
    priority: 'P1',
    module: 'Order Tracking',
    trigger_condition: 'Update a Delivered order back to Pending status.',
    detection_keywords: 'order,status,backward,reverse,revert,downgrade'
  },
  {
    project_id: 1,
    bug_id: 'GT-049',
    requirement_id: null,
    req_id_ref: 'REQ-EC017',
    title: 'Recently viewed products not cleared on logout',
    description: 'Recently viewed products persist in the database after user logout and are visible on next login.',
    expected_behavior: 'Recently viewed products should be cleared or isolated per session.',
    actual_behavior: 'Recently viewed products from previous sessions remain visible.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Recently Viewed',
    trigger_condition: 'View products, logout, login again - old viewed products still appear.',
    detection_keywords: 'recently,viewed,logout,persist,session,clear'
  },
  {
    project_id: 1,
    bug_id: 'GT-050',
    requirement_id: null,
    req_id_ref: 'REQ-EC017',
    title: 'Recently viewed allows duplicate entries',
    description: 'Viewing the same product multiple times creates duplicate entries in the recently viewed list.',
    expected_behavior: 'Each product should appear only once in recently viewed, with the most recent view timestamp.',
    actual_behavior: 'Duplicate entries appear for products viewed multiple times.',
    severity: 'Low',
    priority: 'P3',
    module: 'Recently Viewed',
    trigger_condition: 'View the same product 3 times, then check recently viewed list.',
    detection_keywords: 'recently,viewed,duplicate,multiple,entries'
  },
  {
    project_id: 1,
    bug_id: 'GT-051',
    requirement_id: null,
    req_id_ref: 'REQ-EC018',
    title: 'Users can vote on their own reviews',
    description: 'Users can submit helpful votes on their own reviews, which should be prevented.',
    expected_behavior: 'Users should not be able to vote on their own reviews.',
    actual_behavior: 'Self-voting is allowed and affects the helpful count.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Review Votes',
    trigger_condition: 'Submit a review, then click helpful vote on your own review.',
    detection_keywords: 'review,vote,own,self,voting,prevent'
  },
  {
    project_id: 1,
    bug_id: 'GT-052',
    requirement_id: null,
    req_id_ref: 'REQ-EC018',
    title: 'Review helpful vote count displays incorrectly',
    description: 'The helpful vote count on reviews shows an incorrect number after voting.',
    expected_behavior: 'Vote count should accurately reflect the number of helpful votes.',
    actual_behavior: 'Vote count is off by one or shows wrong total after voting.',
    severity: 'Medium',
    priority: 'P2',
    module: 'Review Votes',
    trigger_condition: 'Vote helpful on a review and observe the displayed count.',
    detection_keywords: 'review,vote,count,helpful,incorrect,wrong'
  },
  {
    project_id: 1,
    bug_id: 'GT-053',
    requirement_id: null,
    req_id_ref: 'REQ-EC019',
    title: 'Move to cart does not remove item from saved list',
    description: 'When moving a saved item to cart, it remains in the saved items list instead of being removed.',
    expected_behavior: 'Moving an item to cart should remove it from the saved list.',
    actual_behavior: 'Item appears in both cart and saved list after move operation.',
    severity: 'High',
    priority: 'P1',
    module: 'Save for Later',
    trigger_condition: 'Save an item, then move it to cart, check saved list.',
    detection_keywords: 'saved,move,cart,remove,duplicate,still present'
  },
  {
    project_id: 1,
    bug_id: 'GT-054',
    requirement_id: null,
    req_id_ref: 'REQ-EC019',
    title: 'Saved items has no limit per user',
    description: 'Users can save unlimited items to their saved list with no maximum limit.',
    expected_behavior: 'Saved items should have a reasonable limit (e.g., 20 items per user).',
    actual_behavior: 'No limit is enforced, allowing unlimited saved items.',
    severity: 'Low',
    priority: 'P3',
    module: 'Save for Later',
    trigger_condition: 'Attempt to save 100+ items to the saved list.',
    detection_keywords: 'saved,limit,maximum,unlimited,items'
  }
];

const insertGroundTruth = db.prepare(
  `INSERT INTO ground_truth_bugs (project_id, bug_id, requirement_id, title, description, expected_behavior, actual_behavior, severity, priority, module, trigger_condition, detection_keywords)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

groundTruthBugs.forEach(bug => {
  const reqIdStr = bug.req_id_ref || bugReqIdToReqId[bug.requirement_id];
  const resolvedReqId = reqIdStr ? requirementIdMap[reqIdStr] : null;
  insertGroundTruth.run(
    projectId,
    bug.bug_id,
    resolvedReqId,
    bug.title,
    bug.description,
    bug.expected_behavior,
    bug.actual_behavior,
    bug.severity,
    bug.priority,
    bug.module,
    bug.trigger_condition,
    bug.detection_keywords
  );
});

console.log('Ground truth bugs seeded');
console.log('Database seeded successfully!');
