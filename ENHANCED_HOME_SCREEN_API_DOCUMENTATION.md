# Enhanced Home Screen API Documentation 🚀

## Overview
This document describes the enhanced home screen APIs for EchoReads, providing comprehensive data for magazines, articles, and digests in a Readly-like interface. These APIs support featured content, categorized content, user-specific recommendations, and advanced search functionality.

---

## API Endpoints

### 1. Get Home Screen Data
**Endpoint:** `GET /api/v1/user/home`

**Description:** Fetches comprehensive home screen data including featured content, trending items, new releases, and user recommendations.

**URL:** `http://your-domain/api/v1/user/home`

**Method:** `GET`

**Headers:** 
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Response Body
```json
{
  "success": true,
  "message": "Home screen data fetched successfully",
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "avatar": "string (URL)",
      "subscriptionType": "free" | "echopro" | "echoproplus",
      "readingPreferences": ["category1", "category2"]
    },
    "featured": {
      "magazines": [
        {
          "_id": "string",
          "mid": "number",
          "name": "string",
          "image": "string (URL)",
          "file": "string (URL)",
          "type": "free" | "pro",
          "fileType": "string",
          "magzineType": "magzine",
          "isActive": "boolean",
          "category": "string",
          "downloads": "number",
          "description": "string",
          "rating": "number (0-5)",
          "reviews": [...],
          "createdAt": "string (ISO date)"
        }
      ],
      "articles": [...],
      "digests": [...]
    },
    "trending": {
      "magazines": [...],
      "articles": [...],
      "digests": [...]
    },
    "newReleases": {
      "magazines": [...],
      "articles": [...],
      "digests": [...]
    },
    "recommended": {
      "magazines": [...],
      "articles": [...],
      "digests": [...]
    },
    "categories": [
      {
        "id": "string",
        "name": "string",
        "icon": "string",
        "color": "string (hex)",
        "count": "number",
        "featured": "boolean"
      }
    ],
    "stats": {
      "totalMagazines": "number",
      "totalArticles": "number",
      "totalDigests": "number",
      "userReadCount": "number",
      "userFavorites": "number"
    }
  }
}
```

---

### 2. Get Content by Type with Pagination
**Endpoint:** `GET /api/v1/user/content/{type}`

**Description:** Fetches content by type (magazines, articles, or digests) with advanced filtering, sorting, and pagination.

**URL:** `http://your-domain/api/v1/user/content/{type}`

**Method:** `GET`

**Path Parameters:**
- `type`: "magazines" | "articles" | "digests"

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `category`: string (optional)
- `sort`: "newest" | "popular" | "rating" | "downloads" (default: "newest")
- `filter`: "all" | "free" | "pro" (default: "all")

#### Example Request
```bash
GET /api/v1/user/content/magazines?page=1&limit=10&sort=popular&filter=free
```

#### Response Body
```json
{
  "success": true,
  "message": "Content fetched successfully",
  "data": {
    "content": [
      {
        "_id": "string",
        "mid": "number",
        "name": "string",
        "image": "string (URL)",
        "file": "string (URL)",
        "type": "free" | "pro",
        "fileType": "string",
        "magzineType": "magzine" | "article" | "digest",
        "isActive": "boolean",
        "category": "string",
        "downloads": "number",
        "description": "string",
        "rating": "number (0-5)",
        "reviews": [...],
        "createdAt": "string (ISO date)"
      }
    ],
    "pagination": {
      "currentPage": "number",
      "totalPages": "number",
      "totalItems": "number",
      "itemsPerPage": "number",
      "hasNextPage": "boolean",
      "hasPrevPage": "boolean"
    },
    "filters": {
      "categories": [
        {
          "id": "string",
          "name": "string",
          "count": "number"
        }
      ],
      "types": [
        {
          "type": "free" | "pro",
          "count": "number"
        }
      ]
    }
  }
}
```

---

### 3. Get Content Categories
**Endpoint:** `GET /api/v1/user/categories`

**Description:** Fetches all available content categories with counts and metadata.

**URL:** `http://your-domain/api/v1/user/categories`

**Method:** `GET`

#### Response Body
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": [
    {
      "id": "string",
      "name": "string",
      "icon": "string",
      "color": "string (hex)",
      "description": "string",
      "count": "number",
      "featured": "boolean",
      "breakdown": {
        "magazines": "number",
        "articles": "number",
        "digests": "number"
      }
    }
  ]
}
```

---

### 4. Search Content
**Endpoint:** `GET /api/v1/user/search`

**Description:** Searches across all content types with advanced filtering and pagination.

**URL:** `http://your-domain/api/v1/user/search`

**Method:** `GET`

**Query Parameters:**
- `q`: string (required) - Search query
- `type`: "all" | "magazines" | "articles" | "digests" (default: "all")
- `category`: string (optional) - Filter by category
- `page`: number (default: 1)
- `limit`: number (default: 20)

#### Example Request
```bash
GET /api/v1/user/search?q=technology&type=magazines&category=technology&page=1&limit=10
```

#### Response Body
```json
{
  "success": true,
  "message": "Search results fetched successfully",
  "data": {
    "results": [
      {
        "_id": "string",
        "mid": "number",
        "name": "string",
        "image": "string (URL)",
        "file": "string (URL)",
        "type": "free" | "pro",
        "fileType": "string",
        "magzineType": "magzine" | "article" | "digest",
        "isActive": "boolean",
        "category": "string",
        "downloads": "number",
        "description": "string",
        "rating": "number (0-5)",
        "reviews": [...],
        "createdAt": "string (ISO date)"
      }
    ],
    "pagination": {
      "currentPage": "number",
      "totalPages": "number",
      "totalItems": "number",
      "itemsPerPage": "number",
      "hasNextPage": "boolean",
      "hasPrevPage": "boolean"
    },
    "searchStats": {
      "query": "string",
      "totalResults": "number",
      "searchTime": "number (ms)"
    }
  }
}
```

---

## Usage Examples

### 1. Get Home Screen Data
```javascript
const axios = require('axios');

const getHomeScreenData = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/v1/user/home', {
            headers: {
                'Authorization': 'Bearer YOUR_JWT_TOKEN'
            }
        });
        
        if (response.data.success) {
            console.log('Featured magazines:', response.data.data.featured.magazines.length);
            console.log('Trending articles:', response.data.data.trending.articles.length);
            console.log('Categories:', response.data.data.categories.length);
        }
        
    } catch (error) {
        console.error('Error:', error.response?.data?.message || error.message);
    }
};
```

### 2. Get Content with Pagination
```javascript
const getContentByType = async (type, page = 1, limit = 10) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/v1/user/content/${type}`, {
            params: { page, limit, sort: 'newest' },
            headers: { 'Authorization': 'Bearer YOUR_JWT_TOKEN' }
        });
        
        if (response.data.success) {
            const { content, pagination } = response.data.data;
            console.log(`Page ${pagination.currentPage} of ${pagination.totalPages}`);
            console.log(`Showing ${content.length} of ${pagination.totalItems} items`);
        }
        
    } catch (error) {
        console.error('Error:', error.response?.data?.message || error.message);
    }
};

// Usage
getContentByType('magazines', 1, 5);
getContentByType('articles', 2, 10);
```

### 3. Search Content
```javascript
const searchContent = async (query, type = 'all', category = null) => {
    try {
        const params = { q: query, type, page: 1, limit: 20 };
        if (category) params.category = category;
        
        const response = await axios.get('http://localhost:3000/api/v1/user/search', {
            params,
            headers: { 'Authorization': 'Bearer YOUR_JWT_TOKEN' }
        });
        
        if (response.data.success) {
            const { results, searchStats } = response.data.data;
            console.log(`Found ${searchStats.totalResults} results for "${query}"`);
            console.log(`Search completed in ${searchStats.searchTime}ms`);
        }
        
    } catch (error) {
        console.error('Error:', error.response?.data?.message || error.message);
    }
};

// Usage
searchContent('technology', 'magazines', 'technology');
searchContent('business insights', 'articles');
```

### 4. Get Categories
```javascript
const getCategories = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/v1/user/categories', {
            headers: { 'Authorization': 'Bearer YOUR_JWT_TOKEN' }
        });
        
        if (response.data.success) {
            const categories = response.data.data;
            categories.forEach(cat => {
                console.log(`${cat.icon} ${cat.name}: ${cat.count} items`);
                console.log(`  Color: ${cat.color}, Featured: ${cat.featured}`);
            });
        }
        
    } catch (error) {
        console.error('Error:', error.response?.data?.message || error.message);
    }
};
```

---

## cURL Examples

### 1. Home Screen Data
```bash
curl -X GET \
  http://localhost:3000/api/v1/user/home \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json'
```

### 2. Content by Type
```bash
curl -X GET \
  'http://localhost:3000/api/v1/user/content/magazines?page=1&limit=10&sort=popular&filter=free' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json'
```

### 3. Search Content
```bash
curl -X GET \
  'http://localhost:3000/api/v1/user/search?q=technology&type=magazines&page=1&limit=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json'
```

### 4. Get Categories
```bash
curl -X GET \
  http://localhost:3000/api/v1/user/categories \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json'
```

---

## Features

✅ **Comprehensive Home Screen Data** - Featured, trending, new releases, recommendations  
✅ **Advanced Content Filtering** - By type, category, subscription level  
✅ **Smart Sorting** - Newest, popular, rating, downloads  
✅ **Pagination Support** - Configurable page size and navigation  
✅ **Powerful Search** - Full-text search across all content  
✅ **Category Management** - Rich category metadata with icons and colors  
✅ **User Personalization** - Recommendations based on preferences  
✅ **Performance Optimized** - Efficient database queries and response formatting  

---

## Error Handling

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Authentication failed",
  "error": "UNAUTHORIZED",
  "code": 401
}
```

### Validation Error (400)
```json
{
  "success": false,
  "message": "Invalid content type. Must be magazines, articles, or digests",
  "error": "VALIDATION_ERROR",
  "code": 400
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Content not found",
  "error": "NOT_FOUND",
  "code": 404
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error while fetching home screen data",
  "error": "INTERNAL_ERROR",
  "code": 500
}
```

---

## Testing

Run the comprehensive test suite:

```bash
node test_home_screen_apis.js
```

The test file covers:
- ✅ Home screen data fetching
- ✅ Content by type with pagination
- ✅ Category retrieval
- ✅ Search functionality
- ✅ Advanced features (sorting, filtering)
- ✅ Error handling

---

## Implementation Notes

### Authentication
- All endpoints require JWT token in Authorization header
- Format: `Authorization: Bearer <token>`
- Token should be validated on every request

### Performance
- Implemented with efficient MongoDB queries
- Pagination prevents large data transfers
- Sorting and filtering at database level
- Search with regex for flexibility

### Content Types
- **Magazines**: Full publications with multiple pages
- **Articles**: Single pieces of content
- **Digests**: Curated collections of content

### Categories
- Dynamic category generation from content
- Rich metadata including icons and colors
- Featured categories for prominent display
- Count breakdown by content type

---

## Future Enhancements

1. **Advanced Recommendations** - Machine learning-based content suggestions
2. **Reading Progress Tracking** - User reading history and progress
3. **Content Analytics** - View counts, engagement metrics
4. **A/B Testing** - Content presentation optimization
5. **Caching Layer** - Redis-based response caching
6. **Real-time Updates** - WebSocket for live content updates

---

## That's It! 🎉

**Enhanced home screen APIs ready for production use with comprehensive functionality for a Readly-like experience!** 