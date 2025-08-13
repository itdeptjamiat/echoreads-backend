# Search Magazines by Category API Documentation

## Overview
This API endpoint allows users to search for magazines based on their category. The search is case-insensitive and returns only active magazines.

## Endpoint Details

### **POST** `/api/v1/user/search-magazines-by-category`

**Description:** Search magazines by category

**URL:** `http://your-domain/api/v1/user/search-magazines-by-category`

**Method:** `POST`

**Content-Type:** `application/json`

## Request Body

| Field    | Type   | Required | Description                    | Example        |
|----------|--------|----------|--------------------------------|----------------|
| category | string | Yes      | Category to search for         | "technology"   |

### Request Body Example
```json
{
    "category": "technology"
}
```

## Response Format

### Success Response (200 OK)

```json
{
    "success": true,
    "message": "Magazines found for category: technology",
    "data": [
        {
            "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
            "mid": 123,
            "name": "Tech Weekly",
            "image": "https://example.com/tech-weekly.jpg",
            "file": "https://example.com/tech-weekly.pdf",
            "type": "free",
            "fileType": "pdf",
            "magzineType": "magzine",
            "isActive": true,
            "category": "technology",
            "audioFile": "https://example.com/tech-weekly.mp3",
            "downloads": 150,
            "description": "Latest technology trends and insights",
            "rating": 4.5,
            "reviews": [...],
            "createdAt": "2023-09-05T10:30:00.000Z"
        }
    ],
    "count": 1
}
```

### No Results Response (200 OK)

```json
{
    "success": true,
    "message": "No magazines found for category: unknown",
    "data": [],
    "count": 0
}
```

### Error Response (400 Bad Request)

```json
{
    "success": false,
    "message": "Category is required and must be a string"
}
```

### Error Response (500 Internal Server Error)

```json
{
    "success": false,
    "message": "Internal server error while searching magazines"
}
```

## Features

- **Case-insensitive search:** Searches work regardless of case (e.g., "Technology", "technology", "TECHNOLOGY")
- **Active magazines only:** Returns only magazines where `isActive: true`
- **Partial matching:** Uses regex for flexible category matching
- **Comprehensive data:** Returns full magazine information including ratings, reviews, and metadata
- **Count included:** Response includes total count of found magazines

## Usage Examples

### cURL Example
```bash
curl -X POST \
  http://localhost:3000/api/v1/user/search-magazines-by-category \
  -H 'Content-Type: application/json' \
  -d '{
    "category": "science"
  }'
```

### JavaScript/Node.js Example
```javascript
const axios = require('axios');

const searchMagazines = async (category) => {
    try {
        const response = await axios.post('http://localhost:3000/api/v1/user/search-magazines-by-category', {
            category: category
        });
        
        if (response.data.success) {
            console.log(`Found ${response.data.count} magazines in category: ${category}`);
            return response.data.data;
        }
    } catch (error) {
        console.error('Error:', error.response?.data?.message || error.message);
    }
};

// Usage
searchMagazines('business');
```

### Python Example
```python
import requests

def search_magazines(category):
    url = "http://localhost:3000/api/v1/user/search-magazines-by-category"
    payload = {"category": category}
    
    try:
        response = requests.post(url, json=payload)
        data = response.json()
        
        if data['success']:
            print(f"Found {data['count']} magazines in category: {category}")
            return data['data']
        else:
            print(f"Error: {data['message']}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")

# Usage
search_magazines('health')
```

## Common Categories

Based on the magazine schema, common categories might include:
- `technology`
- `science`
- `business`
- `health`
- `education`
- `entertainment`
- `sports`
- `politics`
- `lifestyle`
- `other` (default category)

## Error Handling

The API includes comprehensive error handling:
- **Validation errors:** Returns 400 for missing or invalid category parameter
- **Database errors:** Returns 500 for internal server errors
- **No results:** Returns 200 with empty data array and appropriate message

## Performance Considerations

- Uses MongoDB's regex search with case-insensitive option
- Filters by `isActive: true` to ensure only relevant results
- Excludes `__v` field to reduce response payload
- Suitable for real-time search operations

## Security

- No authentication required (public endpoint)
- Input validation prevents injection attacks
- Case-insensitive search prevents bypassing through case manipulation

## Testing

Use the provided test file `test_search_magazines_by_category.js` to test the API:

```bash
node test_search_magazines_by_category.js
```

## Dependencies

- **Database:** MongoDB with Mongoose
- **Model:** `magzinesSchema` from `models/magzinesSchema.js`
- **Framework:** Express.js
- **Validation:** Built-in parameter validation 