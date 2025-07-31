# EchoReads Backend API

A comprehensive backend API for EchoReads, a digital magazine platform with user authentication, subscription plans, and content management. Built with Node.js, Express, and MongoDB.

## Features

### User Management
- **User Signup & Login** with JWT authentication
- **Password Reset** via Email OTP
- **User Profile Management** with data updates
- **Role-based Access Control** (Admin/User)

### Subscription Plans
- **Plan Management** - Create, update, and delete subscription plans
- **Multiple Plan Types** - Free, EchoPro, EchoProPlus
- **Plan Features** - Customizable features, download limits, pricing
- **Discount Management** - Time-based discounts and promotional pricing

### Content Management
- **Magazine Management** - Upload, update, and delete magazines
- **Content Categorization** - Organize magazines by categories
- **Download Tracking** - Monitor magazine downloads
- **Rating & Reviews** - User feedback system

### Admin Features
- **User Management** - View all users, manage accounts, and delete users
- **Content Administration** - Full magazine lifecycle management
- **Plan Administration** - Complete subscription plan control
- **Account Security** - Admin password reset and user deletion
- **Payment Analytics** - Revenue tracking and payment history
- **Download Statistics** - Magazine download analytics

---

## API Endpoints

### Authentication

#### Signup
- **POST** `/api/v1/user/signup`
- **Body:**  
  ```json
  {
    "email": "user@example.com",
    "password": "yourPassword",
    "username": "username",
    "name": "Full Name"
  }
  ```

#### Login
- **POST** `/api/v1/user/login`
- **Body:**  
  ```json
  {
    "email": "user@example.com",
    "password": "yourPassword"
  }
  ```

#### Request Password Reset OTP
- **POST** `/api/v1/user/reset-password-otp`
- **Body:**  
  ```json
  {
    "email": "user@example.com"
  }
  ```

#### Set New Password (using OTP)
- **POST** `/api/v1/user/new-password`
- **Body:**  
  ```json
  {
    "email": "user@example.com",
    "otp": "123456",
    "newPassword": "yourNewPassword"
  }
  ```

### User Profile

#### Update User Data
- **PUT** `/api/v1/user/update-data`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Body:**  
  ```json
  {
    "name": "Updated Name",
    "profilePic": "https://example.com/image.jpg"
  }
  ```

#### Get User Profile
- **GET** `/api/v1/user/profile`
- **Headers:** `Authorization: Bearer <jwt_token>`

### Magazine Management

#### Create Magazine
- **POST** `/api/v1/magazine/create`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Body:**  
  ```json
  {
    "name": "Magazine Name",
    "image": "https://example.com/cover.jpg",
    "file": "https://example.com/magazine.pdf",
    "type": "free",
    "category": "technology",
    "description": "Magazine description"
  }
  ```

#### Get All Magazines
- **GET** `/api/v1/magazine/all`
- **Headers:** `Authorization: Bearer <jwt_token>`

#### Update Magazine
- **PUT** `/api/v1/magazine/update`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Body:**  
  ```json
  {
    "mid": 123,
    "name": "Updated Magazine Name",
    "type": "pro"
  }
  ```

#### Delete Magazine
- **DELETE** `/api/v1/magazine/delete`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Body:**  
  ```json
  {
    "mid": 123,
    "uid": 456
  }
  ```

### Plan Management

#### Get All Plans
- **GET** `/api/v1/plans`
- **Query Parameters:** `?includeInactive=true` (optional)
- **Response:** Returns all active plans with calculated discounts and features

#### Create Plan
- **POST** `/api/v1/plan/create`
- **Headers:** `Authorization: Bearer <admin_jwt_token>`
- **Body:**  
  ```json
  {
    "planType": "echopro",
    "price": 9.99,
    "currency": "USD",
    "duration": 1,
    "features": ["Unlimited downloads", "Premium magazines"],
    "maxDownloads": 0,
    "maxMagazines": 0,
    "description": "Premium plan with unlimited access"
  }
  ```

#### Update Plan
- **PUT** `/api/v1/plan/update`
- **Headers:** `Authorization: Bearer <admin_jwt_token>`
- **Body:**  
  ```json
  {
    "planType": "echopro",
    "price": 12.99,
    "features": ["Unlimited downloads", "Premium magazines", "Priority support"]
  }
  ```

#### Delete Plan
- **DELETE** `/api/v1/plan/delete`
- **Headers:** `Authorization: Bearer <admin_jwt_token>`
- **Body:**  
  ```json
  {
    "planType": "echopro",
    "uid": 123
  }
  ```

### Download Management

#### Download Magazine
- **POST** `/api/v1/download/magazine`
- **Body:**  
  ```json
  {
    "mid": 123,
    "uid": 456
  }
  ```
- **Access Control:** Based on user plan (free/pro users)
- **Response:** Download link and magazine details

#### Get Download History
- **GET** `/api/v1/download/history/:uid`
- **Response:** User's accessible magazines and plan limits

#### Get Download Statistics (Admin)
- **POST** `/api/v1/admin/download-stats`
- **Headers:** `Authorization: Bearer <admin_jwt_token>`
- **Body:**  
  ```json
  {
    "adminUid": 123
  }
  ```
- **Response:** Comprehensive download analytics

### Admin

#### Get All Users
- **GET** `/api/v1/admin/users`
- **Headers:** `Authorization: Bearer <admin_jwt_token>`

#### Admin Reset Password
- **POST** `/api/v1/admin/reset-password`
- **Headers:** `Authorization: Bearer <admin_jwt_token>`
- **Body:**  
  ```json
  {
    "uid": 123,
    "newPassword": "newPassword123"
  }
  ```

#### Delete User (Admin Only)
- **DELETE** `/api/v1/admin/delete-user`
- **Headers:** `Authorization: Bearer <admin_jwt_token>`
- **Body:**  
  ```json
  {
    "targetUid": 123,
    "adminUid": 456
  }
  ```
- **Security:** Prevents admin self-deletion and admin-to-admin deletion

#### Payment History (Admin Only)
- **POST** `/api/v1/admin/payment-history`
- **Headers:** `Authorization: Bearer <admin_jwt_token>`
- **Body:**  
  ```json
  {
    "adminUid": 123
  }
  ```
- **Response:** Total revenue, user list, and subscription statistics

#### Revenue Analytics (Admin Only)
- **POST** `/api/v1/admin/revenue-analytics`
- **Headers:** `Authorization: Bearer <admin_jwt_token>`
- **Body:**  
  ```json
  {
    "adminUid": 123,
    "period": "all"
  }
  ```
- **Response:** Detailed revenue trends, growth metrics, and business insights

---

## Project Structure

```
echoReadsBacken/
├── accounts/                 # User authentication & account management
│   ├── login.js
│   ├── signup.js
│   ├── resetPasswordOtp.js
│   ├── newPassword.js
│   └── updateData.js
├── admin/                    # Admin-only operations
│   ├── getAlluser.js
│   ├── adminResetPassword.js
│   ├── deleteUser.js
│   ├── updateMagzin.js
│   ├── deleteMagzin.js
│   ├── updatePlan.js
│   └── deletePlan.js
├── magzinesFiles/           # Magazine content management
│   ├── createMagzine.js
│   └── getAllmagzin.js
├── planPrices/              # Subscription plan management
│   ├── createPlan.js
│   └── getAllPlans.js
├── downloads/               # Download management
│   ├── downloadMagazine.js
│   ├── getDownloadHistory.js
│   └── getDownloadStats.js
├── userProfile/             # User profile operations
│   └── userProfile.js
├── payments/                # Payment processing
│   ├── paymentHistory.js
│   └── revenueAnalytics.js
├── middleware/              # Authentication middleware
│   └── auth.js
├── models/                  # Database schemas
│   ├── accountCreate.js
│   ├── magzinesSchema.js
│   └── planPriceSchema.js
├── dbconnect/               # Database connection
│   └── databaseConnect.js
├── router/                  # Route definitions
│   └── routers.js
├── server.js                # Main server file
├── package.json
└── README.md
```

## Database Schemas

### Account Schema
- User authentication and profile data
- Plan subscription tracking
- JWT token management
- Password reset functionality

### Magazine Schema
- Magazine metadata and content links
- Download tracking and ratings
- Category and type classification
- Review system

### PlanPrice Schema
- Subscription plan definitions
- Pricing and feature management
- Discount and promotional pricing
- Plan lifecycle management

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd echoReadsBacken
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Set up MongoDB connection string
   - Configure JWT secret
   - Set up email service credentials

4. **Start the server**
   ```bash
   npm start
   ```

## Security Features

- **JWT Authentication** for secure API access
- **Role-based Authorization** for admin operations
- **Password Hashing** for secure credential storage
- **OTP Verification** for password reset process
- **Input Validation** for all API endpoints

## Error Handling

The API includes comprehensive error handling with:
- **HTTP Status Codes** for different error types
- **Detailed Error Messages** for debugging
- **Validation Errors** for input validation
- **Authentication Errors** for unauthorized access

---

## License

This project is licensed under the MIT License.
