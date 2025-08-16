# Feedback API with Image Upload Documentation

## Overview
This API allows users to submit feedback with optional image uploads. Images are automatically uploaded to Cloudflare R2 storage and the public URL is stored in the database.

## Endpoints

### 1. Create Feedback (Text Only)
**POST** `/api/v1/user/bug-report`

Submit feedback without image upload.

#### Content-Type
`application/json`

#### Request Body
```json
{
  "name": "John Doe",                    // Required: User's name (min 2 characters)
  "email": "john@example.com",           // Required: Valid email address
  "description": "Great app! Love it!",  // Required: Feedback description (min 10 characters)
  "rating": 5,                           // Optional: Rating from 1-5
  "category": "general_feedback",        // Optional: Category (see valid categories below)
  "userId": 123456                       // Optional: User ID if logged in
}
```

### 2. Create Feedback with Image Upload
**POST** `/api/v1/user/bug-report-with-image`

Submit feedback with optional image upload. Image is automatically uploaded to R2 storage.

#### Content-Type
`multipart/form-data`

#### Form Fields
- `name` (required): User's name (min 2 characters)
- `email` (required): Valid email address  
- `description` (required): Feedback description (min 10 characters)
- `image` (optional): Image file (jpeg, jpg, png, gif, webp, max 5MB)
- `rating` (optional): Rating from 1-5
- `category` (optional): Category (see valid categories below)
- `userId` (optional): User ID if logged in

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
    "description": "Great app! Found a bug in the login screen.",
    "image": "https://pub-b8050509235e4bcca261901d10608e30.r2.dev/feedback-images/1642234567890-uuid.jpg",
    "rating": 4,
    "category": "bug_report",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Response (Error - 400)
```json
{
  "success": false,
  "message": "Image size must be less than 5MB"
}
```

### 3. Get User Feedback by User ID
**GET** `/api/v1/user/bug-report/user/:userId`

Get all feedback submissions from a specific user ID.

#### URL Parameters
- `userId`: User's unique ID

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
        "image": "https://pub-b8050509235e4bcca261901d10608e30.r2.dev/feedback-images/1642234567890-uuid.jpg",
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

### 4. Get All Feedback (Admin Only)
**GET** `/api/v1/admin/bug-report`

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

## Image Upload Details

### Supported Image Formats
- JPEG (.jpeg, .jpg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Image Restrictions
- Maximum file size: 5MB
- Images are automatically uploaded to Cloudflare R2 storage
- Public URLs are generated and stored in database
- Original filenames are preserved with UUID for uniqueness

### Storage Path Structure
```
feedback-images/
├── timestamp-uuid.jpg
├── timestamp-uuid.png
└── ...
```

### Public URL Format
```
https://pub-b8050509235e4bcca261901d10608e30.r2.dev/feedback-images/{timestamp}-{uuid}.{extension}
```

## Example Usage

### Submit Feedback with Image (cURL)
```bash
curl -X POST http://localhost:3000/api/v1/user/bug-report-with-image \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "description=Found a bug in the app. Screenshot attached." \
  -F "rating=3" \
  -F "category=bug_report" \
  -F "image=@/path/to/screenshot.jpg"
```

### Submit Feedback without Image (cURL)
```bash
curl -X POST http://localhost:3000/api/v1/user/bug-report \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "description": "The app is working great! Love the new features.",
    "rating": 5,
    "category": "general_feedback"
  }'
```

### JavaScript/Fetch Example with Image
```javascript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('description', 'Bug report with screenshot');
formData.append('category', 'bug_report');
formData.append('rating', '3');
formData.append('image', fileInput.files[0]); // File from input element

fetch('/api/v1/user/bug-report-with-image', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## Error Codes

- **400**: Bad Request - Missing required fields, invalid data, or file size exceeded
- **401**: Unauthorized - Invalid or missing authentication token  
- **404**: Not Found - User not found
- **500**: Internal Server Error - Server-side error or image upload failure

## Database Schema

The feedback is stored with the following structure:

```javascript
{
  name: String (required),           // User's name
  email: String (required),          // User's email
  description: String (required),    // Feedback description
  image: String (optional),          // Public R2 URL of uploaded image
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

## Notes

- If image upload fails, the feedback submission will be rejected
- Images are permanently stored in R2 storage
- Both endpoints support the same validation rules for text fields
- Use the appropriate endpoint based on whether you need image upload functionality
- The `image` field will be `null` for text-only submissions 