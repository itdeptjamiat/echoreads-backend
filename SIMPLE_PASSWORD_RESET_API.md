# Simple Password Reset API 🚀

## Overview
**Super simple password reset - just email and new password! No OTP, no tokens, no complex steps.**

## Endpoint

### **POST** `/api/v1/user/simple-password-reset`

**Description:** Reset user password with just email and new password

**URL:** `http://your-domain/api/v1/user/simple-password-reset`

## Request Body

| Field        | Type   | Required | Description           | Example           |
|--------------|--------|----------|-----------------------|-------------------|
| email        | string | Yes      | User's email address  | "user@email.com" |
| newPassword  | string | Yes      | New password          | "newpass123"     |

### Request Example
```json
{
    "email": "user@email.com",
    "newPassword": "newpass123"
}
```

## Response

### Success (200 OK)
```json
{
    "success": true,
    "message": "Password reset successfully! You can now login with your new password.",
    "data": {
        "email": "user@email.com",
        "username": "john_doe"
    }
}
```

### Error (400 Bad Request)
```json
{
    "success": false,
    "message": "Email and new password are required"
}
```

### Error (400 Bad Request - Short Password)
```json
{
    "success": false,
    "message": "Password must be at least 6 characters long"
}
```

### Error (404 Not Found)
```json
{
    "success": false,
    "message": "User not found with this email"
}
```

## How to Use

### 1. cURL
```bash
curl -X POST \
  http://localhost:3000/api/v1/user/simple-password-reset \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@email.com",
    "newPassword": "newpassword123"
  }'
```

### 2. JavaScript/Node.js
```javascript
const axios = require('axios');

const resetPassword = async (email, newPassword) => {
    try {
        const response = await axios.post('http://localhost:3000/api/v1/user/simple-password-reset', {
            email: email,
            newPassword: newPassword
        });
        
        console.log('✅ Password reset successful!');
        return response.data;
        
    } catch (error) {
        console.log('❌ Error:', error.response?.data?.message || error.message);
    }
};

// Usage
resetPassword('user@email.com', 'newpassword123');
```

### 3. Python
```python
import requests

def reset_password(email, new_password):
    url = "http://localhost:3000/api/v1/user/simple-password-reset"
    payload = {
        "email": email,
        "newPassword": new_password
    }
    
    try:
        response = requests.post(url, json=payload)
        data = response.json()
        
        if data['success']:
            print("✅ Password reset successful!")
            return data
        else:
            print(f"❌ Error: {data['message']}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")

# Usage
reset_password('user@email.com', 'newpassword123')
```

## Features

✅ **Super Simple** - Just 2 fields: email + new password  
✅ **No OTP** - No need to wait for codes  
✅ **No Tokens** - No complex token management  
✅ **Fast** - Password changed immediately  
✅ **Secure** - Password is hashed with bcrypt  
✅ **User-friendly** - Clear error messages  

## Password Requirements

- **Minimum length:** 6 characters
- **No complex rules** - Just be reasonable!

## What Happens

1. User sends email + new password
2. System finds user by email
3. New password is hashed
4. Password is updated in database
5. User gets success message
6. User can login with new password immediately

## Testing

Run the test file to see it in action:

```bash
node test_simple_password_reset.js
```

## Comparison with Complex System

| Feature | Complex System | Simple System |
|---------|----------------|---------------|
| Steps | 3+ steps | 1 step |
| Time | 5-10 minutes | 1 second |
| OTP | Required | Not needed |
| Tokens | Required | Not needed |
| Email verification | Required | Not needed |
| User experience | Confusing | Super easy |

## Security Note

⚠️ **This is a simplified API for development/testing.**  
For production use, consider adding:
- Email verification
- Rate limiting
- Password strength requirements
- Audit logging

## That's It! 🎉

**No more complex password reset flows. Just email + new password = done!** 