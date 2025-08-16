# Feedback API Documentation

## Overview
This API allows users to submit feedback and administrators to manage feedback submissions.

## Endpoints

### 1. Create Feedback (Public)
**POST** `/api/v1/user/feedback`

Submit user feedback with name, email, description, and optional image.

#### Request Body
```json
{
  "name": "John Doe",                    // Required: User's name (min 2 characters)
  "email": "john@example.com",           // Required: Valid email address
  "description": "Great app! Love it!",  // Required: Feedback description (min 10 characters)
  "image": "https://example.com/img.jpg", // Optional: Image URL
  "rating": 5,                           // Optional: Rating from 1-5
  "category": "general_feedback",        // Optional: Category (see valid categories below)
  "userId": 123456                       // Optional: User ID if logged in
}
```

#### Valid Categories
- `bug_report`
- `feature_request`  
- `general_feedback` (default)
- `complaint`
- `suggestion`
- `other`

#### Response (Success - 201)
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "feedbackId": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "description": "Great app! Love it!",
    "image": "https://example.com/img.jpg",
    "rating": 5,
    "category": "general_feedback",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Response (Error - 400)
```json
{
  "success": false,
  "message": "Name is required"
}
```

### 2. Get User Feedback by Email
**GET** `/api/v1/user/feedback/email/:email`

Get all feedback submissions from a specific email address.

#### URL Parameters
- `email`: User's email address

#### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (pending, reviewed, resolved, rejected)

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "User feedback retrieved successfully",
  "data": {
    "feedback": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "description": "Great app!",
        "status": "pending",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 1,
      "hasNextPage": false,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

### 3. Get User Feedback by User ID
**GET** `/api/v1/user/feedback/user/:userId`

Get all feedback submissions from a specific user ID.

#### URL Parameters
- `userId`: User's unique ID

#### Query Parameters
Same as email endpoint above.

#### Response
Same format as email endpoint above.

### 4. Get All Feedback (Admin Only)
**GET** `/api/v1/admin/feedback`

**Requires Admin Authentication**

Get all feedback submissions with filtering and pagination options.

#### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- `category`: Filter by category
- `email`: Search by email (case insensitive)
- `startDate`: Filter by start date (YYYY-MM-DD)
- `endDate`: Filter by end date (YYYY-MM-DD)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order - asc/desc (default: desc)

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "Feedback retrieved successfully",
  "data": {
    "feedback": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "description": "Great app!",
        "image": null,
        "rating": 5,
        "category": "general_feedback",
        "status": "pending",
        "userId": 123456,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 50,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

## Database Schema

The feedback is stored with the following structure:

```javascript
{
  name: String (required),           // User's name
  email: String (required),          // User's email
  description: String (required),    // Feedback description
  image: String (optional),          // Image URL
  userId: Number (optional),         // User ID if logged in
  status: String (default: 'pending'), // pending, reviewed, resolved, rejected
  rating: Number (optional),         // 1-5 rating
  category: String (default: 'general_feedback'), // Feedback category
  isPublic: Boolean (default: false), // Whether to show publicly
  adminResponse: String (optional),   // Admin response
  respondedBy: Number (optional),     // Admin who responded
  respondedAt: Date (optional),       // Response timestamp
  createdAt: Date (auto),            // Creation timestamp
  updatedAt: Date (auto)             // Update timestamp
}
```

## Error Codes

- **400**: Bad Request - Missing required fields or invalid data
- **401**: Unauthorized - Invalid or missing authentication token
- **404**: Not Found - User or feedback not found
- **409**: Conflict - Duplicate feedback from same email (if enabled)
- **500**: Internal Server Error - Server-side error

## Example Usage

### Submit Feedback (cURL)
```bash
curl -X POST http://localhost:3000/api/v1/user/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "description": "The app is working great! Love the new features.",
    "rating": 5,
    "category": "general_feedback"
  }'
```

### Get User Feedback (cURL)
```bash
curl http://localhost:3000/api/v1/user/feedback/email/john@example.com
```

### Get All Feedback as Admin (cURL)
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3000/api/v1/admin/feedback?page=1&limit=20&status=pending
``` 