const db = require('../models/database');
const bcrypt = require('bcryptjs');

console.log('Seeding database...');

// Clear existing data
db.exec(`
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
  { username: 'trainer', email: 'trainer@qalab.com', password: 'trainer123', role: 'TRAINER', full_name: 'Training Manager' },
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
  }
];

const insertRequirement = db.prepare(
  'INSERT INTO requirements (project_id, req_id, title, description, acceptance_criteria) VALUES (?, ?, ?, ?, ?)'
);

requirements.forEach(req => {
  insertRequirement.run(projectId, req.req_id, req.title, req.description, req.acceptance_criteria);
});

console.log('Requirements seeded');

// Seed Products
const products = [
  { name: 'Wireless Bluetooth Headphones', description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.', price: 149.99, category: 'Electronics', stock: 50 },
  { name: 'USB-C Charging Cable', description: 'Fast charging USB-C cable, 6 feet length.', price: 12.99, category: 'Accessories', stock: 200 },
  { name: 'Smartphone Stand', description: 'Adjustable aluminum smartphone stand for desk.', price: 24.99, category: 'Accessories', stock: 100 },
  { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with adjustable DPI.', price: 34.99, category: 'Electronics', stock: 75 },
  { name: 'Laptop Backpack', description: 'Water-resistant laptop backpack with USB charging port.', price: 49.99, category: 'Accessories', stock: 60 },
  { name: 'Portable Power Bank', description: '20000mAh portable power bank with fast charging.', price: 39.99, category: 'Electronics', stock: 120 },
  { name: 'Smart Watch', description: 'Fitness tracking smartwatch with heart rate monitor.', price: 199.99, category: 'Electronics', stock: 40 },
  { name: 'Bluetooth Speaker', description: 'Waterproof portable Bluetooth speaker.', price: 79.99, category: 'Electronics', stock: 80 },
  { name: 'Laptop Cooling Pad', description: 'Quiet cooling pad for laptops with LED lights.', price: 29.99, category: 'Accessories', stock: 90 },
  { name: 'Webcam HD', description: '1080p HD webcam with built-in microphone.', price: 59.99, category: 'Electronics', stock: 65 },
  { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with blue switches.', price: 89.99, category: 'Accessories', stock: 55 },
  { name: 'Monitor Stand', description: 'Adjustable monitor stand with USB hub.', price: 44.99, category: 'Accessories', stock: 70 },
  { name: 'Wireless Charger', description: 'Qi wireless charger for smartphones.', price: 29.99, category: 'Electronics', stock: 150 },
  { name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness.', price: 34.99, category: 'Home', stock: 85 },
  { name: 'Notebook Set', description: 'Premium notebook set with 3 notebooks.', price: 19.99, category: 'Home', stock: 200 },
  { name: 'Smartphone Case', description: 'Shockproof smartphone case with screen protector.', price: 15.99, category: 'Accessories', stock: 300 },
  { name: 'Wireless Earbuds', description: 'True wireless earbuds with touch controls.', price: 69.99, category: 'Electronics', stock: 100 },
  { name: 'Laptop Sleeve', description: 'Padded laptop sleeve for 15-inch laptops.', price: 24.99, category: 'Accessories', stock: 120 },
  { name: 'Power Strip', description: 'Surge protector power strip with USB ports.', price: 22.99, category: 'Electronics', stock: 95 },
  { name: 'Cable Organizer', description: 'Desk cable organizer with clips.', price: 9.99, category: 'Accessories', stock: 250 }
];

const insertProduct = db.prepare(
  'INSERT INTO products (name, description, price, category, stock) VALUES (?, ?, ?, ?, ?)'
);

products.forEach(product => {
  insertProduct.run(product.name, product.description, product.price, product.category, product.stock);
});

console.log('Products seeded');

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
  }
];

const insertGroundTruth = db.prepare(
  `INSERT INTO ground_truth_bugs (project_id, bug_id, requirement_id, title, description, expected_behavior, actual_behavior, severity, priority, module, trigger_condition, detection_keywords)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

groundTruthBugs.forEach(bug => {
  insertGroundTruth.run(
    projectId,
    bug.bug_id,
    bug.requirement_id,
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
