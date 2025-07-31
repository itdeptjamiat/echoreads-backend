# EchoReads Backend - Complete Project Structure

## 📁 Root Directory Structure

```
echoReadsBacken/
├── 📁 accounts/                    # User Authentication & Account Management
├── 📁 admin/                       # Admin-Only Operations
├── 📁 magzinesFiles/              # Magazine Content Management
├── 📁 planPrices/                 # Subscription Plan Management
├── 📁 userProfile/                # User Profile Operations
├── 📁 middleware/                  # Authentication & Authorization
├── 📁 models/                      # Database Schemas
├── 📁 router/                      # API Route Definitions
├── 📁 dbconnect/                   # Database Connection
├── 📁 payments/                    # Payment Processing
├── 📄 server.js                    # Main Server Entry Point
├── 📄 package.json                 # Project Dependencies
├── 📄 package-lock.json           # Dependency Lock File
├── 📄 README.md                    # Project Documentation
├── 📄 .gitignore                   # Git Ignore Rules
└── 📁 node_modules/               # Installed Dependencies
```

---

## 🔐 Authentication & Account Management (`/accounts/`)

### Purpose: Handle user registration, login, and password management

```
accounts/
├── 📄 signup.js                   # User registration endpoint
├── 📄 login.js                    # User login endpoint
├── 📄 resetPasswordOtp.js         # Password reset OTP generation
├── 📄 newPassword.js              # Set new password with OTP
└── 📄 updateData.js               # Update user account data
```

### Key Features:
- **JWT-based authentication**
- **Email OTP verification**
- **Password hashing with bcrypt**
- **Account data updates**

---

## 👨‍💼 Admin Operations (`/admin/`)

### Purpose: Admin-only functionality for platform management

```
admin/
├── 📄 getAlluser.js               # Get all registered users
├── 📄 adminResetPassword.js       # Admin password reset for users
├── 📄 deleteUser.js               # Delete user accounts
├── 📄 updateMagzin.js             # Update magazine details
├── 📄 deleteMagzin.js             # Delete magazines
├── 📄 updatePlan.js               # Update subscription plans
└── 📄 deletePlan.js               # Delete subscription plans
```

### Key Features:
- **Role-based access control**
- **User management**
- **Content administration**
- **Plan management**
- **Payment analytics**
- **Download statistics**

---

## 📚 Magazine Management (`/magzinesFiles/`)

### Purpose: Handle magazine content lifecycle

```
magzinesFiles/
├── 📄 createMagzine.js            # Create new magazines
└── 📄 getAllmagzin.js             # Retrieve all magazines
```

### Key Features:
- **Auto-generated magazine IDs**
- **Content categorization**
- **Download tracking**
- **Rating and review system**

---

## 📥 Download Management (`/downloads/`)

### Purpose: Handle magazine downloads with access control

```
downloads/
├── 📄 downloadMagazine.js         # Download with plan validation
├── 📄 getDownloadHistory.js       # User download history
└── 📄 getDownloadStats.js         # Admin download analytics
```

### Key Features:
- **Plan-based access control**
- **Download tracking and analytics**
- **User download history**
- **Admin download statistics**
- **Subscription expiry validation**

---

## 💳 Subscription Plans (`/planPrices/`)

### Purpose: Manage subscription plans and pricing

```
planPrices/
├── 📄 createPlan.js               # Create new subscription plans
└── 📄 getAllPlans.js              # Get all available plans
```

### Key Features:
- **Multiple plan types (Free, EchoPro, EchoProPlus)**
- **Dynamic pricing with discounts**
- **Feature management**
- **Plan lifecycle control**

---

## 👤 User Profile (`/userProfile/`)

### Purpose: Handle user profile operations

```
userProfile/
└── 📄 userProfile.js              # Get user profile data
```

### Key Features:
- **Profile data retrieval**
- **User information management**

---

## 🔒 Middleware (`/middleware/`)

### Purpose: Authentication and authorization middleware

```
middleware/
└── 📄 auth.js                     # JWT authentication middleware
```

### Key Features:
- **Token verification**
- **Role-based authorization**
- **Request validation**

---

## 🗄️ Database Models (`/models/`)

### Purpose: Define database schemas and data structures

```
models/
├── 📄 accountCreate.js            # User account schema
├── 📄 magzinesSchema.js           # Magazine content schema
└── 📄 planPriceSchema.js          # Subscription plan schema
```

### Schema Features:

#### Account Schema:
- User authentication data
- Profile information
- Plan subscription tracking
- JWT token management

#### Magazine Schema:
- Content metadata
- Download tracking
- Rating and reviews
- Category classification

#### PlanPrice Schema:
- Subscription plan definitions
- Pricing and features
- Discount management
- Plan lifecycle

---

## 🛣️ API Routes (`/router/`)

### Purpose: Define API endpoints and routing

```
router/
└── 📄 routers.js                  # Main router configuration
```

### API Endpoints:

#### Authentication Routes:
- `POST /api/v1/user/signup` - User registration
- `POST /api/v1/user/login` - User login
- `POST /api/v1/user/reset-password-otp` - Password reset OTP
- `POST /api/v1/user/new-password` - Set new password

#### User Profile Routes:
- `GET /api/v1/user/profile/:uid` - Get user profile
- `PUT /api/v1/user/update-data` - Update user data

#### Magazine Routes:
- `GET /api/v1/user/magzines` - Get all magazines
- `POST /api/v1/admin/create-magzine` - Create magazine
- `PUT /api/v1/admin/update-magzine` - Update magazine
- `DELETE /api/v1/admin/delete-magzine` - Delete magazine

#### Plan Management Routes:
- `GET /api/v1/plans` - Get all plans (public)
- `POST /api/v1/admin/plan/create` - Create plan (admin)
- `PUT /api/v1/admin/plan/update` - Update plan (admin)
- `DELETE /api/v1/admin/plan/delete` - Delete plan (admin)

#### Download Management Routes:
- `POST /api/v1/download/magazine` - Download magazine (with access control)
- `GET /api/v1/download/history/:uid` - Get user download history
- `POST /api/v1/admin/download-stats` - Get download statistics (admin)

#### Payment Management Routes:
- `POST /api/v1/admin/payment-history` - Get payment history (admin)
- `POST /api/v1/admin/revenue-analytics` - Get revenue analytics (admin)

#### Admin Routes:
- `GET /api/v1/admin/users` - Get all users
- `DELETE /api/v1/admin/delete-user` - Delete user (admin)
- `POST /api/v1/admin/reset-password` - Admin password reset

---

## 🔌 Database Connection (`/dbconnect/`)

### Purpose: Handle database connectivity

```
dbconnect/
└── 📄 databaseConnect.js          # MongoDB connection setup
```

### Features:
- **MongoDB connection management**
- **Connection error handling**
- **Environment-based configuration**

---

## 💰 Payment Processing (`/payments/`)

### Purpose: Payment history, revenue tracking, and analytics

```
payments/
├── 📄 paymentHistory.js      # Payment history and user list
└── 📄 revenueAnalytics.js    # Detailed revenue analytics
```

### Key Features:
- **Payment History** - Track all user payments and revenue
- **Revenue Analytics** - Monthly trends and growth metrics
- **User List** - Complete list of paying customers
- **Plan Performance** - Revenue by plan type analysis
- **Business Insights** - Growth trends and recommendations

---

## 📦 Dependencies (`package.json`)

### Core Dependencies:
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **nodemailer**: Email services
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **compression**: Response compression
- **express-rate-limit**: Rate limiting
- **multer**: File upload handling
- **cloudinary**: Cloud image storage
- **firebase-admin**: Firebase integration
- **socket.io**: Real-time communication

### Development Dependencies:
- **nodemon**: Development server with auto-restart

---

## 🚀 Server Configuration (`server.js`)

### Purpose: Main application entry point

### Features:
- **Express server setup**
- **Middleware configuration**
- **Route integration**
- **Error handling**
- **Security configurations**

---

## 🔧 Environment Configuration

### Required Environment Variables:
```env
MONGODB_URI=mongodb://localhost:27017/echoreads
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

---

## 📊 Database Collections

### MongoDB Collections:
1. **accounts** - User account data
2. **magzines** - Magazine content and metadata
3. **planprices** - Subscription plan definitions

---

## 🔐 Security Features

### Implemented Security Measures:
- **JWT Authentication**
- **Password Hashing**
- **Role-based Authorization**
- **Input Validation**
- **Rate Limiting**
- **Security Headers (Helmet)**
- **CORS Configuration**

---

## 🧪 API Testing

### Test Endpoints:
- **Authentication**: Test user registration and login
- **Authorization**: Verify admin-only endpoints
- **Content Management**: Test magazine CRUD operations
- **Plan Management**: Test subscription plan operations

---

## 📈 Scalability Considerations

### Architecture Benefits:
- **Modular Structure**: Easy to maintain and extend
- **Separation of Concerns**: Clear responsibility division
- **Middleware Pattern**: Reusable authentication
- **Schema Validation**: Data integrity
- **Error Handling**: Comprehensive error management

---

## 🚀 Deployment

### Production Considerations:
- **Environment Variables**: Secure configuration
- **Database Optimization**: Indexed queries
- **Security Headers**: Helmet configuration
- **Rate Limiting**: API protection
- **Compression**: Response optimization

---

## 📝 Development Workflow

### Development Process:
1. **Feature Development**: Add new functionality
2. **Schema Updates**: Modify database models
3. **Route Integration**: Add API endpoints
4. **Testing**: Verify functionality
5. **Documentation**: Update README and structure

---

## 🔄 Version Control

### Git Structure:
- **Main Branch**: Production-ready code
- **Feature Branches**: New functionality development
- **Hotfix Branches**: Critical bug fixes

---

This comprehensive structure provides a solid foundation for the EchoReads digital magazine platform with clear separation of concerns, security measures, and scalability considerations. 