# Magazine Rating API Documentation

This document describes the complete rating system for magazines in the EchoReads backend.

## Overview

The rating system allows users to rate magazines on a scale of 1-5 stars and provide optional text reviews. The system includes user-facing APIs for rating magazines and admin APIs for moderation and analytics.

## User APIs

### 1. Rate a Magazine

**Endpoint:** `POST /api/v1/user/rate-magazine`

**Description:** Rate a magazine with a 1-5 star rating and optional review text.

**Request Body:**
```json
{
  "mid": 123,
  "rating": 4,
  "review": "Great content, highly recommended!",
  "userId": 456
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rating added successfully.",
  "data": {
    "magazineId": 123,
    "userRating": 4,
    "averageRating": 4.2,
    "totalReviews": 15,
    "userReview": "Great content, highly recommended!"
  }
}
```

**Notes:**
- Rating must be a whole number between 1-5
- If user has already rated this magazine, it will update their existing rating
- The magazine's average rating is automatically recalculated

### 2. Get Magazine Ratings

**Endpoint:** `GET /api/v1/user/magazine-ratings/:mid`

**Description:** Get all ratings and reviews for a specific magazine with pagination and sorting.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Reviews per page (default: 10)
- `sort` (optional): Sort order - "newest", "oldest", "rating" (default: "newest")
- `userId` (optional): User ID to get their specific rating

**Example:** `GET /api/v1/user/magazine-ratings/123?page=1&limit=5&sort=newest&userId=456`

**Response:**
```json
{
  "success": true,
  "data": {
    "magazineId": 123,
    "magazineName": "Tech Monthly",
    "averageRating": 4.2,
    "totalReviews": 15,
    "ratingStats": {
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 8,
      "5": 4
    },
    "userRating": {
      "rating": 4,
      "review": "Great content!",
      "time": "2024-01-15T10:30:00Z"
    },
    "reviews": [
      {
        "userId": 456,
        "rating": 4,
        "review": "Great content!",
        "time": "2024-01-15T10:30:00Z",
        "username": "john_doe",
        "userProfilePic": "https://example.com/profile.jpg"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 3. Delete User Rating

**Endpoint:** `DELETE /api/v1/user/delete-rating`

**Description:** Remove user's rating for a specific magazine.

**Request Body:**
```json
{
  "mid": 123,
  "userId": 456
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rating deleted successfully.",
  "data": {
    "magazineId": 123,
    "averageRating": 4.1,
    "totalReviews": 14
  }
}
```

### 4. Get Top Rated Magazines

**Endpoint:** `GET /api/v1/user/top-rated-magazines`

**Description:** Get a list of top-rated magazines with filtering and sorting options.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Magazines per page (default: 10)
- `minRating` (optional): Minimum rating filter (default: 0)
- `category` (optional): Filter by category
- `type` (optional): Filter by type ("free" or "pro")
- `sort` (optional): Sort order - "rating", "downloads", "newest", "oldest" (default: "rating")

**Example:** `GET /api/v1/user/top-rated-magazines?minRating=4&category=tech&sort=rating&page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "magazines": [
      {
        "mid": 123,
        "name": "Tech Monthly",
        "image": "https://example.com/image.jpg",
        "type": "free",
        "category": "tech",
        "rating": 4.5,
        "downloads": 1250,
        "description": "Latest tech trends and insights",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalMagazines": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "minRating": 4,
      "category": "tech",
      "type": "all",
      "sort": "rating"
    },
    "statistics": {
      "averageRating": 3.8,
      "totalMagazines": 150,
      "magazinesWithRatings": 120
    }
  }
}
```

## Admin APIs

### 1. Delete Review (Admin)

**Endpoint:** `DELETE /api/v1/admin/delete-review`

**Description:** Admin can delete any user's review for moderation purposes.

**Request Body:**
```json
{
  "mid": 123,
  "userId": 456
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review deleted successfully.",
  "data": {
    "magazineId": 123,
    "userId": 456,
    "averageRating": 4.1,
    "totalReviews": 14
  }
}
```

### 2. Get Rating Analytics

**Endpoint:** `GET /api/v1/admin/rating-analytics`

**Description:** Get comprehensive analytics about ratings across all magazines.

**Query Parameters:**
- `startDate` (optional): Start date for filtering (YYYY-MM-DD)
- `endDate` (optional): End date for filtering (YYYY-MM-DD)
- `category` (optional): Filter by category

**Example:** `GET /api/v1/admin/rating-analytics?startDate=2024-01-01&endDate=2024-01-31&category=tech`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMagazines": 50,
    "totalReviews": 250,
    "averageRating": 3.8,
    "ratingDistribution": {
      "1": 5,
      "2": 15,
      "3": 50,
      "4": 120,
      "5": 60
    },
    "categoryStats": {
      "tech": {
        "count": 20,
        "averageRating": 4.2,
        "totalReviews": 100
      },
      "business": {
        "count": 15,
        "averageRating": 3.5,
        "totalReviews": 75
      }
    },
    "recentActivity": [
      {
        "magazineId": 123,
        "magazineName": "Tech Monthly",
        "userId": 456,
        "rating": 4,
        "review": "Great content!",
        "time": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 3. Get All Reviews (Admin)

**Endpoint:** `GET /api/v1/admin/all-reviews`

**Description:** Get all reviews across all magazines for moderation purposes.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Reviews per page (default: 20)
- `rating` (optional): Filter by specific rating
- `magazineId` (optional): Filter by specific magazine

**Example:** `GET /api/v1/admin/all-reviews?page=1&limit=10&rating=1&magazineId=123`

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "magazineId": 123,
        "magazineName": "Tech Monthly",
        "category": "tech",
        "userId": 456,
        "rating": 1,
        "review": "Poor content quality",
        "time": "2024-01-15T10:30:00Z",
        "username": "john_doe",
        "userEmail": "john@example.com",
        "userType": "user"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 25,
      "totalReviews": 250,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "rating": 1,
      "magazineId": 123
    }
  }
}
```

## Error Responses

All APIs return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (authentication required)
- `404`: Not Found (magazine/user not found)
- `500`: Internal Server Error

## Authentication

- User APIs require user authentication (via `userId` in request body or auth middleware)
- Admin APIs require admin authentication (via `verifyAdmin` middleware)

## Rate Limiting

Consider implementing rate limiting to prevent spam:
- Limit rating submissions per user per magazine
- Limit total ratings per user per day
- Implement cooldown periods between rating updates

## Data Model

The rating system uses the existing magazine schema with enhanced review structure:

```javascript
reviews: [
  {
    userId: Number,      // Required
    rating: Number,      // Required, 1-5
    review: String,      // Optional
    time: Date          // Auto-generated
  }
]
```

## Best Practices

1. **Validation**: Always validate rating values (1-5) and required fields
2. **Authentication**: Ensure proper user authentication for all rating operations
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Moderation**: Use admin APIs to moderate inappropriate content
5. **Analytics**: Regularly review rating analytics to understand user preferences
6. **Performance**: Consider pagination for large datasets
7. **Security**: Validate user permissions before allowing rating operations 