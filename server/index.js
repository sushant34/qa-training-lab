const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const db = require('./models/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const requirementRoutes = require('./routes/requirements');
const testCaseRoutes = require('./routes/testCases');
const executionRoutes = require('./routes/executions');
const bugReportRoutes = require('./routes/bugReports');
const groundTruthRoutes = require('./routes/groundTruth');
const evaluationRoutes = require('./routes/evaluations');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const ecommerceAuthRoutes = require('./routes/ecommerceAuth');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/test-cases', testCaseRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/bug-reports', bugReportRoutes);
app.use('/api/ground-truth', groundTruthRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/ecommerce/auth', ecommerceAuthRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from React build (production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

  // SPA catch-all route — serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Demo accounts:');
  console.log('  Trainer: trainer / April@2025');
  console.log('  Intern: intern / intern123');
});
