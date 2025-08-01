# EchoReads Technical Implementation Guide

## 🏗️ System Architecture Implementation

### 1. Database Schema Implementation

#### User Account Schema
```javascript
// models/accountCreate.js
const accountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  uid: { type: Number, unique: true },
  plan: { type: String, enum: ['free', 'echopro', 'echoproplus'], default: 'free' },
  planExpiry: { type: Date },
  userType: { type: String, enum: ['admin', 'user'], default: 'user' }
});
```

#### Payment Schema
```javascript
// models/paymentSchema.js
const paymentSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlanPrice', required: true },
  paymentId: { type: String, required: true, unique: true },
  provider: { type: String, enum: ['stripe', 'paypal', 'razorpay', 'manual'] },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'] },
  paymentMethod: { type: String, enum: ['card', 'bank_transfer', 'wallet', 'upi', 'cash'] }
});
```

#### Magazine Schema
```javascript
// models/magzinesSchema.js
const magazineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  fileSize: { type: Number },
  downloadCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});
```

### 2. Authentication Implementation

#### JWT Token Generation
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { uid: user.uid, userType: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
```

#### Admin Authorization
```javascript
const verifyAdmin = async (req, res, next) => {
  try {
    const { adminUid } = req.body;
    const admin = await Account.findOne({ uid: adminUid, userType: 'admin' });
    
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authorization error' });
  }
};
```

### 3. Payment Processing Implementation

#### Payment Provider Integration
```javascript
// payments/createPayment.js
const processPaymentByProvider = async (payment, provider, paymentMethod) => {
  switch (provider.toLowerCase()) {
    case 'stripe':
      return await processStripePayment(payment, paymentMethod);
    case 'paypal':
      return await processPayPalPayment(payment, paymentMethod);
    case 'razorpay':
      return await processRazorpayPayment(payment, paymentMethod);
    default:
      return { success: false, errorMessage: 'Unsupported provider' };
  }
};

const processStripePayment = async (payment, paymentMethod) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: payment.amount * 100, // Convert to cents
      currency: payment.currency,
      payment_method_types: [paymentMethod],
      metadata: {
        paymentId: payment.paymentId,
        userId: payment.userId.toString()
      }
    });
    
    return {
      success: true,
      transactionId: paymentIntent.id
    };
  } catch (error) {
    return {
      success: false,
      errorMessage: error.message
    };
  }
};
```

#### Webhook Processing
```javascript
// payments/paymentWebhook.js
const verifyStripeSignature = async (webhookData, signature) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    const event = stripe.webhooks.constructEvent(
      webhookData,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return true;
  } catch (error) {
    return false;
  }
};

const handlePaymentSuccess = async (paymentData) => {
  const payment = await Payment.findOne({
    providerTransactionId: paymentData.id
  });
  
  if (!payment) {
    return { success: false, error: 'Payment not found' };
  }
  
  payment.status = 'completed';
  payment.completedAt = new Date();
  await payment.save();
  
  await updateUserPlan(payment.userId, payment.planType, payment.planDuration);
  
  return { success: true, message: 'Payment completed' };
};
```

### 4. File Upload Implementation

#### Magazine Upload
```javascript
// magzinesFiles/createMagzine.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/magazines/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.epub', '.mobi'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

const createMagazine = async (req, res) => {
  try {
    upload.single('magazine')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      
      const { title, description } = req.body;
      const file = req.file;
      
      const magazine = new Magazine({
        title,
        description,
        fileUrl: `/uploads/magazines/${file.filename}`,
        fileSize: file.size
      });
      
      await magazine.save();
      
      res.status(201).json({
        success: true,
        message: 'Magazine uploaded successfully',
        magazine
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};
```

### 5. Download Management Implementation

#### Download Tracking
```javascript
// downloads/downloadMagazine.js
const downloadMagazine = async (req, res) => {
  try {
    const { userId, magazineId } = req.body;
    
    // Check user plan and download limits
    const user = await Account.findOne({ uid: userId });
    const userDownloads = await Download.countDocuments({
      userId,
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    
    const plan = await PlanPrice.findOne({ planType: user.plan });
    const maxDownloads = plan.maxDownloads || 0;
    
    if (maxDownloads > 0 && userDownloads >= maxDownloads) {
      return res.status(403).json({
        success: false,
        message: 'Download limit exceeded for your plan'
      });
    }
    
    // Record download
    const download = new Download({
      userId,
      magazineId,
      downloadDate: new Date()
    });
    
    await download.save();
    
    // Update magazine download count
    await Magazine.findByIdAndUpdate(magazineId, {
      $inc: { downloadCount: 1 }
    });
    
    res.status(200).json({
      success: true,
      message: 'Download initiated',
      download: {
        downloadId: download._id,
        magazineId,
        downloadUrl: `/api/v1/download/file/${magazineId}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Download failed' });
  }
};
```

### 6. Auto Plan Management Implementation

#### Expiry Check Scheduler
```javascript
// autoPlanManagement/dailyScheduler.js
const cron = require('node-cron');
const Account = require('../models/accountCreate');

const scheduleExpiryChecks = () => {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('Running daily expiry check...');
      
      const expiredUsers = await Account.find({
        plan: { $in: ['echopro', 'echoproplus'] },
        planExpiry: { $lt: new Date() }
      });
      
      for (const user of expiredUsers) {
        // Reset to free plan
        await Account.updateOne(
          { uid: user.uid },
          {
            plan: 'free',
            planStart: null,
            planExpiry: null
          }
        );
        
        // Send expiry notification (implement notification service)
        console.log(`User ${user.uid} plan expired`);
      }
      
      console.log(`Processed ${expiredUsers.length} expired users`);
    } catch (error) {
      console.error('Expiry check error:', error);
    }
  });
};

module.exports = { scheduleExpiryChecks };
```

### 7. Analytics Implementation

#### Revenue Analytics
```javascript
// payments/revenueAnalytics.js
const getRevenueAnalytics = async (req, res) => {
  try {
    const { adminUid, startDate, endDate } = req.body;
    
    // Verify admin
    const admin = await Account.findOne({ uid: adminUid, userType: 'admin' });
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get payment analytics
    const paymentStats = await Payment.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get plan breakdown
    const planStats = await Payment.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: '$planType',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate totals
    const totalRevenue = paymentStats.reduce((sum, stat) => sum + stat.revenue, 0);
    const totalPayments = paymentStats.reduce((sum, stat) => sum + stat.count, 0);
    
    res.status(200).json({
      success: true,
      analytics: {
        totalRevenue,
        totalPayments,
        averageRevenue: totalPayments > 0 ? totalRevenue / totalPayments : 0,
        dailyStats: paymentStats,
        planBreakdown: planStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Analytics error' });
  }
};
```

### 8. Error Handling Implementation

#### Global Error Handler
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }
  
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value',
      error: 'This value already exists'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = errorHandler;
```

### 9. Security Implementation

#### Rate Limiting
```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    message: 'Too many login attempts, try again later'
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, try again later'
  }
});

module.exports = { authLimiter, apiLimiter };
```

#### Input Validation
```javascript
// middleware/validation.js
const { body, validationResult } = require('express-validator');

const validateSignup = [
  body('username').isLength({ min: 5 }).withMessage('Username must be at least 5 characters'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = { validateSignup };
```

### 10. Performance Optimization

#### Database Indexing
```javascript
// Database indexes for performance
// Add to your schema files or create separate index files

// Account indexes
db.accounts.createIndex({ "email": 1 });
db.accounts.createIndex({ "uid": 1 });
db.accounts.createIndex({ "plan": 1, "planExpiry": 1 });

// Payment indexes
db.payments.createIndex({ "userId": 1, "createdAt": -1 });
db.payments.createIndex({ "status": 1 });
db.payments.createIndex({ "paymentId": 1 });

// Magazine indexes
db.magazines.createIndex({ "isActive": 1 });
db.magazines.createIndex({ "downloadCount": -1 });
```

#### Caching Implementation
```javascript
// middleware/cache.js
const redis = require('redis');
const client = redis.createClient();

const cache = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      res.originalJson = res.json;
      res.json = (body) => {
        client.setex(key, duration, JSON.stringify(body));
        res.originalJson(body);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

module.exports = { cache };
```

This technical implementation guide provides detailed code examples for implementing each component of your EchoReads backend system, ensuring scalability, security, and performance. 