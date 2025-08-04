# EchoReads API Flow Diagram

## 🔄 Complete API Request/Response Flow

### 1. User Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant D as Database
    participant A as Auth Middleware

    C->>S: POST /api/v1/user/signup
    S->>D: Check if user exists
    D-->>S: User not found
    S->>D: Create new user
    D-->>S: User created
    S-->>C: {success: true, message: "User created"}

    C->>S: POST /api/v1/user/login
    S->>D: Validate credentials
    D-->>S: User found
    S->>S: Generate JWT token
    S->>D: Store JWT in user record
    S-->>C: {success: true, token: "jwt_token"}

    C->>S: GET /api/v1/user/profile/:uid
    C->>A: Include JWT in header
    A->>S: Verify JWT token
    S->>D: Get user profile
    D-->>S: User data
    S-->>C: {success: true, user: {...}}
```

### 2. Magazine Access Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant D as Database
    participant A as Auth Middleware

    C->>S: GET /api/v1/user/magzines
    C->>A: Include JWT token
    A->>S: Verify authentication
    S->>D: Get all magazines
    D-->>S: Magazine list
    S-->>C: {success: true, magazines: [...]}

    C->>S: POST /api/v1/download/magazine
    C->>A: Include JWT token
    A->>S: Verify authentication
    S->>D: Check user plan and limits
    D-->>S: User plan info
    S->>S: Validate download permission
    S->>D: Record download
    D-->>S: Download recorded
    S-->>C: {success: true, downloadUrl: "..."}
```

### 3. Payment Processing Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant D as Database
    participant P as Payment Provider
    participant W as Webhook

    C->>S: POST /api/v1/payment/create
    S->>D: Validate user and plan
    D-->>S: User and plan data
    S->>S: Calculate payment amount
    S->>D: Create payment record
    D-->>S: Payment created
    S->>P: Process payment
    P-->>S: Payment result
    alt Payment Success
        S->>D: Update payment status
        S->>D: Update user plan
        S-->>C: {success: true, payment: {...}}
    else Payment Failed
        S->>D: Update payment status
        S-->>C: {success: false, error: "..."}
    end

    P->>W: Send webhook
    W->>S: POST /api/v1/payment/webhook/:provider
    S->>S: Verify webhook signature
    S->>D: Update payment status
    S->>D: Update user plan
    S-->>W: 200 OK
```

### 4. Admin Management Flow

```mermaid
sequenceDiagram
    participant A as Admin Client
    participant S as Server
    participant D as Database
    participant M as Auth Middleware

    A->>S: GET /api/v1/admin/users
    A->>M: Include admin JWT
    M->>S: Verify admin role
    S->>D: Get all users
    D-->>S: User list
    S-->>A: {success: true, users: [...]}

    A->>S: POST /api/v1/admin/create-magzine
    A->>M: Include admin JWT
    M->>S: Verify admin role
    S->>S: Process file upload
    S->>D: Save magazine data
    D-->>S: Magazine created
    S-->>A: {success: true, magazine: {...}}

    A->>S: POST /api/v1/admin/payment/refund
    A->>M: Include admin JWT
    M->>S: Verify admin role
    S->>D: Get payment details
    D-->>S: Payment data
    S->>S: Process refund
    S->>D: Update payment status
    S-->>A: {success: true, refund: {...}}
```

### 5. Password Reset Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant D as Database
    participant E as Email Service

    C->>S: POST /api/v1/user/request-password-reset
    Note over C,S: {email: "user@example.com"}
    S->>D: Find user by email
    D-->>S: User found
    S->>S: Generate OTP
    S->>D: Save OTP and expiry
    S->>E: Send OTP email
    E-->>S: Email sent
    S-->>C: {success: true, message: "OTP sent"}

    C->>S: POST /api/v1/user/verify-otp
    Note over C,S: {email: "user@example.com", otp: "123456"}
    S->>D: Verify OTP
    D-->>S: OTP valid
    S->>S: Generate reset token
    S->>D: Save reset token
    S-->>C: {success: true, resetToken: "abc123"}

    C->>S: POST /api/v1/user/set-new-password-after-otp
    Note over C,S: {email: "user@example.com", otp: "123456", newPassword: "newPass123!", confirmPassword: "newPass123!"}
    S->>D: Verify OTP again
    D-->>S: OTP valid
    S->>S: Hash new password
    S->>D: Update password, clear OTP fields
    S->>E: Send confirmation email
    E-->>S: Email sent
    S-->>C: {success: true, message: "Password changed"}

    C->>S: POST /api/v1/user/reset-password
    Note over C,S: {resetToken: "abc123", newPassword: "newPass123!", confirmPassword: "newPass123!"}
    S->>D: Verify reset token
    D-->>S: Token valid
    S->>S: Hash new password
    S->>D: Update password, clear reset fields
    S->>E: Send confirmation email
    E-->>S: Email sent
    S-->>C: {success: true, message: "Password reset"}

    C->>S: POST /api/v1/user/resend-otp
    Note over C,S: {email: "user@example.com"}
    S->>D: Check cooldown period
    D-->>S: Can resend
    S->>S: Generate new OTP
    S->>D: Update OTP and expiry
    S->>E: Send new OTP email
    E-->>S: Email sent
    S-->>C: {success: true, message: "New OTP sent"}
```

### 6. Plan Management Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant D as Database

    C->>S: GET /api/v1/plans
    S->>D: Get active plans
    D-->>S: Plan list
    S-->>C: {success: true, plans: [...]}

    C->>S: POST /api/v1/admin/plan/create
    S->>D: Validate plan data
    S->>D: Create new plan
    D-->>S: Plan created
    S-->>C: {success: true, plan: {...}}

    C->>S: PUT /api/v1/admin/plan/update
    S->>D: Update plan
    D-->>S: Plan updated
    S-->>C: {success: true, plan: {...}}
```

## 📊 Detailed Request/Response Examples

### User Registration
```http
POST /api/v1/user/signup
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "uid": 12345,
    "username": "john_doe",
    "email": "john@example.com",
    "plan": "free",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### User Login
```http
POST /api/v1/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uid": 12345,
    "username": "john_doe",
    "email": "john@example.com",
    "plan": "free",
    "planExpiry": null
  }
}
```

### Create Payment
```http
POST /api/v1/payment/create
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "userId": 12345,
  "planId": "507f1f77bcf86cd799439011",
  "paymentMethod": "card",
  "provider": "stripe",
  "amount": 29.99,
  "currency": "USD",
  "billingDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "address": {
      "line1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "US"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "payment": {
    "paymentId": "PAY_1704067200000_abc123def",
    "amount": 29.99,
    "status": "completed",
    "planType": "echopro",
    "planDuration": 1
  }
}
```

### Get User Payments
```http
GET /api/v1/payment/user/12345?page=1&limit=10
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": 12345,
    "username": "john_doe",
    "email": "john@example.com",
    "currentPlan": "echopro",
    "planExpiry": "2024-02-01T00:00:00Z"
  },
  "payments": [
    {
      "paymentId": "PAY_1704067200000_abc123def",
      "amount": 29.99,
      "currency": "USD",
      "status": "completed",
      "paymentMethod": "card",
      "provider": "stripe",
      "planType": "echopro",
      "createdAt": "2024-01-01T00:00:00Z",
      "completedAt": "2024-01-01T00:00:01Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalPayments": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "statistics": {
    "totalSpent": 29.99,
    "paymentStats": {
      "completed": {
        "count": 1,
        "totalAmount": 29.99
      }
    }
  }
}
```

### Download Magazine
```http
POST /api/v1/download/magazine
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "userId": 12345,
  "magazineId": "507f1f77bcf86cd799439012"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Download initiated",
  "download": {
    "downloadId": "DL_1704067200000_xyz789",
    "magazineId": "507f1f77bcf86cd799439012",
    "downloadUrl": "https://cdn.echoreads.com/magazines/issue_123.pdf",
    "expiresAt": "2024-01-01T01:00:00Z"
  }
}
```

### Admin Payment History
```http
POST /api/v1/admin/payment-history
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "adminUid": 1
}
```

**Response:**
```json
{
  "success": true,
  "revenueStats": {
    "totalRevenue": 299.90,
    "monthlyRevenue": 29.99,
    "yearlyRevenue": 29.99,
    "averageRevenuePerUser": 29.99
  },
  "subscriptionStats": {
    "totalPaidUsers": 10,
    "activeSubscriptions": 8,
    "expiredSubscriptions": 2,
    "planBreakdown": {
      "echopro": {
        "count": 6,
        "revenue": 179.94
      },
      "echoproplus": {
        "count": 4,
        "revenue": 119.96
      }
    }
  },
  "userList": [
    {
      "uid": 12345,
      "username": "john_doe",
      "email": "john@example.com",
      "plan": "echopro",
      "planPrice": 29.99,
      "planStart": "2024-01-01T00:00:00Z",
      "planExpiry": "2024-02-01T00:00:00Z",
      "isActive": true,
      "revenue": 29.99
    }
  ]
}
```

## 🔄 Error Handling Flow

### Validation Error
```http
POST /api/v1/user/signup
Content-Type: application/json

{
  "username": "john",
  "email": "invalid-email"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "username",
      "message": "Username must be at least 5 characters"
    }
  ]
}
```

### Authentication Error
```http
GET /api/v1/user/profile/12345
```

**Response:**
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "No token provided"
}
```

### Authorization Error
```http
GET /api/v1/admin/users
Authorization: Bearer <user_jwt_token>
```

**Response:**
```json
{
  "success": false,
  "message": "Admin access required",
  "error": "Insufficient permissions"
}
```

### Resource Not Found
```http
GET /api/v1/user/profile/99999
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": false,
  "message": "User not found",
  "error": "No user found with uid: 99999"
}
```

## 📈 Performance Optimization Flow

### Database Query Optimization
```
1. Use indexes on frequently queried fields
2. Implement pagination for large datasets
3. Use aggregation pipelines for analytics
4. Cache frequently accessed data
5. Optimize database connections
```

### API Response Optimization
```
1. Compress responses using gzip
2. Implement response caching
3. Use pagination for large lists
4. Optimize JSON serialization
5. Implement rate limiting
```

This comprehensive API flow diagram shows the exact request/response patterns for all major features in your EchoReads backend system. 