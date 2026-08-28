# QA Training Lab

A comprehensive web application designed to train software QA interns in the complete software testing lifecycle.

## Overview

The QA Training Lab simulates a realistic manual QA assignment where interns:

1. Read software requirements
2. Create test cases
3. Execute test cases against a deliberately buggy e-commerce application
4. Identify defects
5. Submit structured bug reports
6. View their testing progress and score

The application contains intentional bugs that violate the stated requirements. These bugs are realistic and discoverable through normal manual testing.

## Architecture

```
qa-training-lab/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── public/
├── server/                 # Express backend (Node.js)
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/          # Authentication middleware
│   ├── seed/               # Seed data scripts
│   └── controllers/        # Route handlers
└── tests/                  # Automated tests
```

## Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: SQLite (via better-sqlite3)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Local Setup

### Prerequisites

- Node.js 18+ installed
- npm installed

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd qa-training-lab
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Seed the database:
```bash
npm run seed
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Build & Preview

```bash
npm run build
npm run preview
```

## Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=3001
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## Demo Accounts

| Role     | Username | Password    |
|----------|----------|-------------|
| Trainer  | trainer  | trainer123  |
| Intern   | intern   | intern123   |

## How Intentional Bugs Work

The e-commerce application contains 12 intentional defects that violate the stated requirements. These bugs are:

1. **Hidden from interns** - Ground truth bugs are stored in a separate table only accessible by trainers
2. **Realistic** - Each bug has realistic trigger conditions
3. **Discoverable** - Bugs can be found through normal manual testing
4. **Evaluated** - The system automatically evaluates if interns found the bugs

### Bug Categories

- **Registration**: Password validation, email validation, password confirmation
- **Login**: Authentication bypass
- **Search**: Unrelated product results
- **Cart**: Quantity validation, total calculation errors
- **Checkout**: Missing field validation
- **Authentication**: Session invalidation

## How Evaluation Works

The evaluation system scores interns based on:

| Category | Weight | Description |
|----------|--------|-------------|
| Bug Detection | 30% | Finding intentional defects |
| Requirement Mapping | 15% | Mapping bugs to correct requirements |
| Reproduction Steps | 15% | Writing clear steps to reproduce |
| Expected Result | 10% | Accurately describing expected behavior |
| Actual Result | 10% | Clearly documenting actual behavior |
| Severity Rating | 10% | Correct severity classification |
| Priority Rating | 10% | Correct priority classification |

The evaluation uses deterministic matching based on:
- Requirement ID
- Module/area
- Keywords in bug reports
- Expected vs actual behavior
- Ground truth bug conditions

## How to Add New Training Projects

1. Insert a new project in the `projects` table
2. Add requirements in the `requirements` table
3. Add ground truth bugs in the `ground_truth_bugs` table
4. Add products (if e-commerce) in the `products` table

Example SQL:
```sql
INSERT INTO projects (name, description, difficulty, status)
VALUES ('Mobile App Testing', 'Test the mobile application', 'Intermediate', 'active');

INSERT INTO requirements (project_id, req_id, title, description, acceptance_criteria)
VALUES (2, 'REQ-001', 'User Registration', 'Users can register...', '...');
```

## How to Add Intentional Bugs

1. Identify the requirement the bug violates
2. Create the bug in the e-commerce application code
3. Add a ground truth entry in the `ground_truth_bugs` table

Example:
```sql
INSERT INTO ground_truth_bugs (
  project_id, bug_id, requirement_id, title, description,
  expected_behavior, actual_behavior, severity, priority,
  module, trigger_condition, detection_keywords
) VALUES (
  1, 'GT-013', 1, 'Bug Title', 'Description',
  'Expected behavior', 'Actual behavior', 'High', 'P1',
  'Module name', 'How to trigger', 'keyword1,keyword2'
);
```

## How to Deploy

### Option 1: Railway/Render

1. Push to GitHub
2. Connect to Railway or Render
3. Set environment variables
4. Deploy

### Option 2: VPS

1. Install Node.js on server
2. Clone repository
3. Run `npm run install:all`
4. Run `npm run seed`
5. Build frontend: `npm run build`
6. Start server: `npm start`

### Option 3: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm run install:all
COPY . .
RUN npm run seed
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## Features

### For Interns

- Read requirements with acceptance criteria
- Create and manage test cases
- Execute test cases and record results
- Submit detailed bug reports
- View personal progress and score
- Access e-commerce application for testing

### For Trainers

- View all interns and their progress
- Access ground truth bug repository
- View evaluation scores
- Reset training attempts
- Monitor bug detection rates

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details

### Requirements
- `GET /api/requirements` - List requirements
- `GET /api/requirements/:id` - Get requirement details

### Test Cases
- `GET /api/test-cases` - List test cases
- `POST /api/test-cases` - Create test case
- `PUT /api/test-cases/:id` - Update test case
- `DELETE /api/test-cases/:id` - Delete test case

### Test Executions
- `GET /api/executions` - List executions
- `POST /api/executions` - Create execution

### Bug Reports
- `GET /api/bug-reports` - List bug reports
- `POST /api/bug-reports` - Create bug report
- `PUT /api/bug-reports/:id` - Update bug report
- `DELETE /api/bug-reports/:id` - Delete bug report

### Ground Truth (Trainer Only)
- `GET /api/ground-truth` - List ground truth bugs
- `GET /api/ground-truth/detection-status/:projectId` - Get detection status

### Evaluations
- `GET /api/evaluations/my-score/:projectId` - Get my score
- `GET /api/evaluations/intern/:userId/:projectId` - Get intern evaluation
- `GET /api/evaluations/all-interns/:projectId` - Get all intern scores

### Products (E-commerce)
- `GET /api/products` - List products
- `GET /api/products/categories` - List categories
- `GET /api/products/:id` - Get product details

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:productId` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart

### Checkout
- `POST /api/checkout` - Place order
- `GET /api/checkout/history` - Get order history

## License

MIT
