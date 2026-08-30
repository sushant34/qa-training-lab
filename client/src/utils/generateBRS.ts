import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PAGE_WIDTH = 210;
const MARGIN_LEFT = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT * 2;
const HEADER_COLOR = [79, 70, 229];
const TEXT_COLOR = [30, 30, 30];
const SECONDARY_COLOR = [100, 116, 139];

const requirements = [
  {
    id: 'REQ-001',
    title: 'User Registration',
    priority: 'High',
    category: 'Authentication',
    description: 'Users should be able to register using a valid email address and password.',
    acceptanceCriteria: [
      'Email is required.',
      'Email must be valid format (e.g., user@example.com).',
      'Password is required.',
      'Password must contain at least 8 characters.',
      'Password confirmation must match the entered password.',
    ],
  },
  {
    id: 'REQ-002',
    title: 'User Login',
    priority: 'High',
    category: 'Authentication',
    description: 'Registered users should be able to log in using valid credentials.',
    acceptanceCriteria: [
      'Valid username/email and password should allow login.',
      'Invalid credentials should not allow login.',
      'Appropriate error message should be displayed for invalid credentials.',
    ],
  },
  {
    id: 'REQ-003',
    title: 'Product Search',
    priority: 'Medium',
    category: 'Product Management',
    description: 'Users should be able to search products by product name.',
    acceptanceCriteria: [
      'Search should return matching products.',
      'Search should not return unrelated products.',
      'Search should work regardless of letter casing.',
    ],
  },
  {
    id: 'REQ-004',
    title: 'Add Product to Cart',
    priority: 'High',
    category: 'Shopping Cart',
    description: 'Users should be able to add available products to the shopping cart.',
    acceptanceCriteria: [
      'Product should appear in the cart after clicking Add to Cart.',
      'Cart quantity should increase when the same product is added again.',
      'Cart should display the correct product price.',
    ],
  },
  {
    id: 'REQ-005',
    title: 'Product Quantity',
    priority: 'High',
    category: 'Shopping Cart',
    description: 'Users should be able to change product quantity in the cart.',
    acceptanceCriteria: [
      'Quantity must be at least 1.',
      'Quantity cannot be negative.',
      'Cart total should update when quantity changes.',
    ],
  },
  {
    id: 'REQ-006',
    title: 'Cart Total',
    priority: 'High',
    category: 'Shopping Cart',
    description: 'The cart total must equal the sum of (product price × quantity) for every item in the cart.',
    acceptanceCriteria: [
      'Cart total = Product A price × Product A quantity + Product B price × Product B quantity + ...',
      'Total must update correctly when items are added, removed, or quantities changed.',
      'No rounding errors should occur in the total.',
    ],
  },
  {
    id: 'REQ-007',
    title: 'Checkout',
    priority: 'High',
    category: 'Order Management',
    description: 'Users should be able to checkout by providing required customer information.',
    acceptanceCriteria: [
      'Required fields: Full Name, Email, Phone, Address.',
      'The system must prevent checkout when required fields are missing.',
      'All required field validations must be enforced.',
    ],
  },
  {
    id: 'REQ-008',
    title: 'Logout',
    priority: 'High',
    category: 'Authentication',
    description: 'Users should be able to log out.',
    acceptanceCriteria: [
      'After logout, protected pages should no longer be accessible without logging in again.',
      'The session/token must be invalidated on logout.',
    ],
  },
  {
    id: 'REQ-009',
    title: 'Product Stock Display',
    priority: 'Medium',
    category: 'Product Management',
    description: 'Each product should display its current stock availability.',
    acceptanceCriteria: [
      'Stock count is visible on product cards.',
      'Out-of-stock products should be clearly indicated.',
      'Out-of-stock products should not have an Add to Cart button.',
    ],
  },
  {
    id: 'REQ-010',
    title: 'Order History',
    priority: 'Medium',
    category: 'Order Management',
    description: 'Users should be able to view their past orders.',
    acceptanceCriteria: [
      'Order history shows all previous orders.',
      'Each order displays order ID, date, items, and total.',
      'Orders are sorted by most recent first.',
    ],
  },
  {
    id: 'REQ-011',
    title: 'Stock Validation on Add to Cart',
    priority: 'High',
    category: 'Shopping Cart',
    description: 'The system must validate stock availability before adding products to the cart.',
    acceptanceCriteria: [
      'Cannot add more items than available stock.',
      'Error message displayed when stock is insufficient.',
      'Cart quantity cannot exceed available stock.',
    ],
  },
  {
    id: 'REQ-012',
    title: 'Cart Persistence',
    priority: 'Medium',
    category: 'Shopping Cart',
    description: 'Cart items should persist across sessions for the same user.',
    acceptanceCriteria: [
      'Cart items are saved when user logs out.',
      'Cart items are restored when user logs back in.',
      'Cart items are per-user (not shared).',
    ],
  },
  {
    id: 'REQ-013',
    title: 'Product Category Filter',
    priority: 'Low',
    category: 'Product Management',
    description: 'Users should be able to filter products by category.',
    acceptanceCriteria: [
      'Category dropdown shows all available categories.',
      'Selecting a category filters products to show only that category.',
      '"All Categories" option shows all products.',
    ],
  },
  {
    id: 'REQ-014',
    title: 'Order Confirmation',
    priority: 'Medium',
    category: 'Order Management',
    description: 'After successful checkout, an order confirmation should be displayed.',
    acceptanceCriteria: [
      'Order confirmation shows order ID and total amount.',
      'Cart is cleared after successful order.',
      'User can navigate back to shop from confirmation page.',
    ],
  },
  {
    id: 'REQ-015',
    title: 'Form Input Sanitization',
    priority: 'High',
    category: 'Security',
    description: 'All user inputs must be properly sanitized to prevent injection attacks.',
    acceptanceCriteria: [
      'SQL injection attempts in search are prevented.',
      'XSS attempts in form inputs are prevented.',
      'Special characters in inputs are handled safely.',
    ],
  },
];

const nonFunctionalRequirements = [
  {
    category: 'Security',
    requirements: [
      'All user passwords must be securely hashed before storage.',
      'Session tokens must be validated on every protected request.',
      'Input fields must be sanitized to prevent SQL injection and XSS attacks.',
      'API endpoints must enforce role-based access control.',
    ],
  },
  {
    category: 'Performance',
    requirements: [
      'Product search results should be returned within 2 seconds.',
      'Cart operations should complete within 1 second.',
      'The application should support at least 50 concurrent users without degradation.',
    ],
  },
  {
    category: 'Usability',
    requirements: [
      'The application must be responsive and usable on desktop and tablet devices.',
      'Error messages must be clear, specific, and user-friendly.',
      'Required fields must be clearly indicated to the user.',
      'Navigation must be intuitive with consistent layout across pages.',
    ],
  },
  {
    category: 'Compatibility',
    requirements: [
      'The application must work on the latest versions of Chrome, Firefox, and Safari.',
      'The application must be accessible on screens with minimum resolution of 1024×768.',
    ],
  },
  {
    category: 'Data Integrity',
    requirements: [
      'Cart totals must be calculated accurately using the formula: Σ(price × quantity) for all items.',
      'Order records must capture all required fields (name, email, phone, address, total).',
      'Stock levels must be validated before processing add-to-cart requests.',
    ],
  },
];

function addCoverPage(doc: jsPDF) {
  const pageHeight = 297;
  const centerX = PAGE_WIDTH / 2;

  // Top accent bar
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, PAGE_WIDTH, 8, 'F');

  // App name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text('QA Training Lab', centerX, 40, { align: 'center' });

  // Title
  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Business Requirements', centerX, 70, { align: 'center' });
  doc.text('Specification', centerX, 82, { align: 'center' });

  // Subtitle
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(79, 70, 229);
  doc.text('E-Commerce Testing Challenge', centerX, 100, { align: 'center' });

  // Horizontal line
  doc.setDrawColor(200, 200, 220);
  doc.setLineWidth(0.5);
  doc.line(60, 115, 150, 115);

  // Document info table
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  const infoY = 135;
  const labels = ['Document Title:', 'Project:', 'Version:', 'Date:', 'Status:'];
  const values = ['Business Requirements Specification', 'E-Commerce Testing Challenge', '1.0', 'August 2025', 'Active'];
  labels.forEach((label, i) => {
    const y = infoY + i * 12;
    doc.setFont('helvetica', 'bold');
    doc.text(label, 60, y);
    doc.setFont('helvetica', 'normal');
    doc.text(values[i], 100, y);
  });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Confidential — For Training Purposes Only', centerX, pageHeight - 30, { align: 'center' });

  doc.addPage();
}

function addDocumentControl(doc: jsPDF) {
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_COLOR);
  doc.text('Document Control', MARGIN_LEFT, 25);

  doc.setFillColor(79, 70, 229);
  doc.rect(MARGIN_LEFT, 28, 40, 1, 'F');

  doc.addPage();
}

function addTableOfContents(doc: jsPDF) {
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_COLOR);
  doc.text('Table of Contents', MARGIN_LEFT, 25);
  doc.setFillColor(79, 70, 229);
  doc.rect(MARGIN_LEFT, 28, 40, 1, 'F');

  const tocItems = [
    '1. Purpose and Scope',
    '2. Definitions and Abbreviations',
    '3. Functional Requirements',
    '    3.1 User Registration',
    '    3.2 User Login',
    '    3.3 Product Search',
    '    3.4 Product Management',
    '    3.5 Shopping Cart',
    '    3.6 Order Management',
    '    3.7 Security',
    '4. Non-Functional Requirements',
    '5. User Roles',
    '6. Requirements Summary Table',
  ];

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_COLOR);
  tocItems.forEach((item, i) => {
    const y = 45 + i * 10;
    if (item.startsWith('    ')) {
      doc.setFontSize(10);
      doc.text(item, MARGIN_LEFT + 8, y);
    } else {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(item, MARGIN_LEFT, y);
      doc.setFont('helvetica', 'normal');
    }
  });

  doc.addPage();
}

function addSectionHeader(doc: jsPDF, title: string, y: number) {
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_COLOR);
  doc.text(title, MARGIN_LEFT, y);
  doc.setFillColor(79, 70, 229);
  doc.rect(MARGIN_LEFT, y + 2, 40, 1, 'F');
  return y + 14;
}

function addSubSectionHeader(doc: jsPDF, title: string, y: number) {
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text(title, MARGIN_LEFT, y);
  return y + 8;
}

function addParagraph(doc: jsPDF, text: string, y: number) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_COLOR);
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
  doc.text(lines, MARGIN_LEFT, y);
  return y + lines.length * 5 + 4;
}

function addBulletList(doc: jsPDF, items: string[], y: number) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_COLOR);
  items.forEach(item => {
    const lines = doc.splitTextToSize(item, CONTENT_WIDTH - 10);
    doc.text('•', MARGIN_LEFT + 4, y);
    doc.text(lines, MARGIN_LEFT + 10, y);
    y += lines.length * 5 + 3;
  });
  return y + 4;
}

function addPurposeAndScope(doc: jsPDF) {
  let y = 25;

  y = addSectionHeader(doc, '1. Purpose and Scope', y);

  y = addParagraph(doc, 'Purpose', y);
  y = addParagraph(doc, 'This Business Requirements Specification (BRS) document describes the functional and non-functional requirements of the E-Commerce Testing Challenge application. It serves as the primary reference document for QA interns to understand the application\'s expected behavior and create comprehensive test cases.', y);

  y = addParagraph(doc, 'Scope', y);
  y = addParagraph(doc, 'This document covers the core modules of an e-commerce web application, including:', y);

  const scopeItems = [
    'User account management (registration, login, logout)',
    'Product browsing, searching, and filtering',
    'Shopping cart management',
    'Order placement and checkout',
    'Stock and inventory management',
    'User session and security',
  ];
  y = addBulletList(doc, scopeItems, y);

  y = addParagraph(doc, 'Intended Audience', y);
  y = addParagraph(doc, 'This document is intended for QA interns participating in the testing training program. Interns should read each requirement carefully, then create test cases that cover positive, negative, and boundary scenarios for each acceptance criterion.', y);

  doc.addPage();
}

function addDefinitions(doc: jsPDF) {
  let y = 25;

  y = addSectionHeader(doc, '2. Definitions and Abbreviations', y);

  const definitions = [
    ['BRS', 'Business Requirements Specification'],
    ['REQ', 'Requirement — a specific, testable behavior of the application'],
    ['TC', 'Test Case — a set of steps to verify a requirement'],
    ['P0–P3', 'Priority levels: P0 (Critical) to P3 (Low)'],
    ['SUT', 'System Under Test'],
    ['API', 'Application Programming Interface'],
    ['JWT', 'JSON Web Token — used for authentication'],
    ['XSS', 'Cross-Site Scripting — a security vulnerability'],
    ['SQL Injection', 'A security attack manipulating database queries'],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Term', 'Definition']],
    body: definitions,
    theme: 'grid',
    headStyles: { fillColor: HEADER_COLOR, fontStyle: 'bold', fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: MARGIN_LEFT, right: MARGIN_LEFT },
    columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: CONTENT_WIDTH - 35 } },
  });

  doc.addPage();
}

function addFunctionalRequirements(doc: jsPDF) {
  let y = 25;
  y = addSectionHeader(doc, '3. Functional Requirements', y);
  y = addParagraph(doc, 'This section details each functional requirement of the e-commerce application. For each requirement, the acceptance criteria define the specific behaviors that must be verified through testing.', y);
  y += 4;

  // Group requirements by category
  const grouped: Record<string, typeof requirements> = {};
  requirements.forEach(req => {
    if (!grouped[req.category]) grouped[req.category] = [];
    grouped[req.category].push(req);
  });

  let sectionNum = 1;
  for (const [category, reqs] of Object.entries(grouped)) {
    // Check if we need a new page (leave at least 60mm for content)
    if (y > 230) {
      doc.addPage();
      y = 25;
    }

    y = addSubSectionHeader(doc, `3.${sectionNum} ${category}`, y);
    y += 2;

    for (const req of reqs) {
      // Check if we need a new page
      if (y > 220) {
        doc.addPage();
        y = 25;
      }

      // Requirement ID and title
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(`${req.id}: ${req.title}`, MARGIN_LEFT, y);
      y += 6;

      // Priority badge
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      const badgeWidth = req.priority.length * 3 + 10;
      let badgeColor: [number, number, number];
      switch (req.priority) {
        case 'High': badgeColor = [239, 68, 68]; break;
        case 'Medium': badgeColor = [245, 158, 11]; break;
        case 'Low': badgeColor = [59, 130, 246]; break;
        default: badgeColor = [100, 116, 139];
      }
      doc.setFillColor(...badgeColor);
      doc.roundedRect(MARGIN_LEFT, y - 4, badgeWidth, 6, 1.5, 1.5, 'F');
      doc.text(req.priority, MARGIN_LEFT + 5, y);
      y += 10;

      // Description
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEXT_COLOR);
      doc.text('Description:', MARGIN_LEFT, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(req.description, CONTENT_WIDTH);
      doc.text(descLines, MARGIN_LEFT + 2, y);
      y += descLines.length * 5 + 4;

      // Acceptance Criteria
      doc.setFont('helvetica', 'bold');
      doc.text('Acceptance Criteria:', MARGIN_LEFT, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      req.acceptanceCriteria.forEach((criteria, i) => {
        const cLines = doc.splitTextToSize(`${i + 1}. ${criteria}`, CONTENT_WIDTH - 8);
        doc.text(cLines, MARGIN_LEFT + 6, y);
        y += cLines.length * 5 + 2;
      });

      y += 6;
    }

    sectionNum++;
  }

  doc.addPage();
}

function addNonFunctionalRequirements(doc: jsPDF) {
  let y = 25;
  y = addSectionHeader(doc, '4. Non-Functional Requirements', y);
  y += 4;

  for (const group of nonFunctionalRequirements) {
    if (y > 220) {
      doc.addPage();
      y = 25;
    }

    y = addSubSectionHeader(doc, group.category, y);
    y += 2;

    group.requirements.forEach(req => {
      if (y > 270) {
        doc.addPage();
        y = 25;
      }
      const lines = doc.splitTextToSize(`• ${req}`, CONTENT_WIDTH - 6);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT_COLOR);
      doc.text(lines, MARGIN_LEFT + 6, y);
      y += lines.length * 5 + 3;
    });
    y += 6;
  }

  doc.addPage();
}

function addUserRoles(doc: jsPDF) {
  let y = 25;
  y = addSectionHeader(doc, '5. User Roles', y);
  y += 4;

  y = addParagraph(doc, 'The application supports two user roles. Each role has different access levels and capabilities within the system.', y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Role', 'Description', 'Access Level']],
    body: [
      ['Intern (Shopper)', 'Trains in QA testing by creating test cases, executing them, and submitting bug reports. Uses the e-commerce app to find defects.', 'Read/Write — own data only'],
      ['Trainer', 'Monitors intern progress, evaluates test case quality, reviews bug reports, and views ground truth bug detection status.', 'Read — all data, plus evaluation tools'],
    ],
    theme: 'grid',
    headStyles: { fillColor: HEADER_COLOR, fontStyle: 'bold', fontSize: 10 },
    bodyStyles: { fontSize: 10, cellPadding: 6 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: MARGIN_LEFT, right: MARGIN_LEFT },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 85 },
      2: { cellWidth: CONTENT_WIDTH - 125 },
    },
  });

  doc.addPage();
}

function addRequirementsSummaryTable(doc: jsPDF) {
  let y = 25;
  y = addSectionHeader(doc, '6. Requirements Summary Table', y);
  y += 4;

  y = addParagraph(doc, 'The following table provides a summary of all functional requirements for quick reference.', y);
  y += 4;

  const tableData = requirements.map(req => [
    req.id,
    req.title,
    req.category,
    req.priority,
    req.acceptanceCriteria.length.toString(),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['ID', 'Title', 'Category', 'Priority', 'Acceptance Criteria #']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: HEADER_COLOR, fontStyle: 'bold', fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: MARGIN_LEFT, right: MARGIN_LEFT },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 50 },
      2: { cellWidth: 38 },
      3: { cellWidth: 22 },
      4: { cellWidth: CONTENT_WIDTH - 132 },
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const priority = data.cell.raw as string;
        let color: [number, number, number] = [100, 116, 139];
        if (priority === 'High') color = [239, 68, 68];
        else if (priority === 'Medium') color = [245, 158, 11];
        else if (priority === 'Low') color = [59, 130, 246];
        doc.setTextColor(...color);
        doc.setFont('helvetica', 'bold');
      }
    },
  });

  // Footer on last page
  const pageHeight = 297;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('End of Document — QA Training Lab', PAGE_WIDTH / 2, pageHeight - 15, { align: 'center' });
}

export function generateBRS(): void {
  const doc = new jsPDF('p', 'mm', 'a4');

  addCoverPage(doc);
  addDocumentControl(doc);
  addTableOfContents(doc);
  addPurposeAndScope(doc);
  addDefinitions(doc);
  addFunctionalRequirements(doc);
  addNonFunctionalRequirements(doc);
  addUserRoles(doc);
  addRequirementsSummaryTable(doc);

  doc.save('E-Commerce_BRS.pdf');
}
