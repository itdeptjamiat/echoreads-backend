# User Profile API Documentation

This document describes the user profile management APIs in the EchoReads backend.

## Overview

The user profile system allows users to view and update their profile information including name, email, username, and profile picture.

## APIs

### 1. Get User Profile

**Endpoint:** `GET /api/v1/user/profile/:uid`

**Description:** Retrieve user profile information by UID.

**Parameters:**
- `uid` (path parameter): User ID (number)

**Example:** `GET /api/v1/user/profile/123`

**Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "uid": 123,
    "profilePic": "https://example.com/profile.jpg",
    "userType": "user",
    "plan": "free",
    "planExpiry": "2024-12-31T23:59:59.999Z",
    "planStart": "2024-01-01T00:00:00.000Z",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Invalid UID format
- `404`: User not found
- `500`: Server error

### 2. Update User Profile

**Endpoint:** `PUT /api/v1/user/profile/:uid`

**Description:** Update user profile information by UID.

**Parameters:**
- `uid` (path parameter): User ID (number)

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "username": "johnsmith",
  "profilePic": "https://example.com/new-profile.jpg"
}
```

**Field Validation:**
- `name`: Must be a non-empty string
- `email`: Must be a valid email address (unique)
- `username`: Must be at least 3 characters long (unique)
- `profilePic`: Must be a valid URL

**Notes:**
- All fields are optional - only provided fields will be updated
- Email and username must be unique across all users
- Profile picture URL is validated for proper format

**Response:**
```json
{
  "success": true,
  "message": "User profile updated successfully.",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johnsmith",
      "name": "John Smith",
      "email": "johnsmith@example.com",
      "uid": 123,
      "profilePic": "https://example.com/new-profile.jpg",
      "userType": "user",
      "plan": "free",
      "planExpiry": "2024-12-31T23:59:59.999Z",
      "planStart": "2024-01-01T00:00:00.000Z",
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**

**Validation Errors (400):**
```json
{
  "success": false,
  "message": "Name must be a non-empty string."
}
```

**Duplicate Field Error (409):**
```json
{
  "success": false,
  "message": "Email is already taken by another user."
}
```

**User Not Found (404):**
```json
{
  "success": false,
  "message": "User not found."
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Server error, please try again later."
}
```

## Usage Examples

### Example 1: Update User Name Only

**Request:**
```bash
curl -X PUT http://localhost:3000/api/v1/user/profile/123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User profile updated successfully.",
  "data": {
    "user": {
      "username": "john_doe",
      "name": "John Smith",
      "email": "john@example.com",
      "uid": 123,
      "profilePic": "https://example.com/profile.jpg"
    }
  }
}
```

### Example 2: Update Multiple Fields

**Request:**
```bash
curl -X PUT http://localhost:3000/api/v1/user/profile/123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "username": "johnsmith",
    "profilePic": "https://example.com/new-profile.jpg"
  }'
```

### Example 3: Update Profile Picture Only

**Request:**
```bash
curl -X PUT http://localhost:3000/api/v1/user/profile/123 \
  -H "Content-Type: application/json" \
  -d '{
    "profilePic": "https://example.com/new-avatar.jpg"
  }'
```

## Field Descriptions

### User Profile Fields

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `uid` | Number | Yes | Unique user identifier | Must be a number |
| `username` | String | Yes | Unique username | Min 3 characters, unique |
| `name` | String | No | User's full name | Non-empty string |
| `email` | String | Yes | User's email address | Valid email format, unique |
| `profilePic` | String | No | Profile picture URL | Valid URL format |
| `userType` | String | No | User role | Enum: 'admin', 'user', 'super_admin' |
| `plan` | String | No | Subscription plan | Enum: 'free', 'echopro', 'echoproplus' |
| `planExpiry` | Date | No | Plan expiration date | Valid date |
| `planStart` | Date | No | Plan start date | Valid date |
| `isVerified` | Boolean | No | Email verification status | Boolean |
| `createdAt` | Date | No | Account creation date | Auto-generated |

## Security Considerations

1. **Authentication**: Consider implementing authentication middleware to ensure users can only update their own profiles
2. **Authorization**: Implement role-based access control for admin operations
3. **Input Validation**: All inputs are validated and sanitized
4. **Rate Limiting**: Consider implementing rate limiting to prevent abuse
5. **Data Privacy**: Sensitive fields (password, jwtToken) are excluded from responses

## Best Practices

1. **Validation**: Always validate input data before processing
2. **Error Handling**: Provide clear and helpful error messages
3. **Consistency**: Use consistent response formats across all APIs
4. **Documentation**: Keep API documentation up to date
5. **Testing**: Test all validation scenarios and error cases
6. **Security**: Implement proper authentication and authorization
7. **Performance**: Use efficient database queries and indexing

## Error Handling

The API follows consistent error handling patterns:

- **400 Bad Request**: Invalid input data or validation errors
- **401 Unauthorized**: Authentication required
- **404 Not Found**: User not found
- **409 Conflict**: Duplicate field values (email, username)
- **500 Internal Server Error**: Server-side errors

All error responses include:
- `success`: false
- `message`: Human-readable error description
- `errors`: Array of validation errors (when applicable) 