# Password Reset with OTP API 🔐

## Overview
**Secure password reset with OTP verification - Simple 2-step process for enhanced security.**

## How It Works

### **Step 1:** Request OTP
### **Step 2:** Reset Password with OTP

## API Endpoints

### **Step 1: Request OTP**

#### **POST** `/api/v1/user/request-password-reset-otp`

**Description:** Request an OTP to be sent to user's email for password reset

**URL:** `http://your-domain/api/v1/user/request-password-reset-otp`

#### Request Body

| Field | Type   | Required | Description          | Example           |
|-------|--------|----------|----------------------|-------------------|
| email | string | Yes      | User's email address | "user@email.com" |

#### Request Example
```json
{
    "email": "user@email.com"
}
```

#### Response

**Success (200 OK)**
```json
{
    "success": true,
    "message": "OTP sent successfully to your email",
    "data": {
        "email": "user@email.com",
        "expiresIn": "10 minutes"
    }
}
```

**Error (400 Bad Request)**
```json
{
    "success": false,
    "message": "Email is required"
}
```

**Error (404 Not Found)**
```json
{
    "success": false,
    "message": "User not found with this email"
}
```

**Error (429 Too Many Requests)**
```json
{
    "success": false,
    "message": "Please wait 45 seconds before requesting another OTP"
}
```

---

### **Step 2: Reset Password with OTP**

#### **POST** `/api/v1/user/reset-password-with-otp`

**Description:** Reset password using the OTP received in email

**URL:** `http://your-domain/api/v1/user/reset-password-with-otp`

#### Request Body

| Field        | Type   | Required | Description           | Example           |
|--------------|--------|----------|-----------------------|-------------------|
| email        | string | Yes      | User's email address  | "user@email.com" |
| otp          | string | Yes      | 6-digit OTP code      | "123456"         |
| newPassword  | string | Yes      | New password          | "newpass123"     |

#### Request Example
```json
{
    "email": "user@email.com",
    "otp": "123456",
    "newPassword": "newpass123"
}
```

#### Response

**Success (200 OK)**
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

**Error (400 Bad Request)**
```json
{
    "success": false,
    "message": "Email, OTP, and new password are required"
}
```

**Error (400 Bad Request - Short Password)**
```json
{
    "success": false,
    "message": "Password must be at least 6 characters long"
}
```

**Error (400 Bad Request - Invalid OTP)**
```json
{
    "success": false,
    "message": "Invalid OTP. Please check and try again"
}
```

**Error (400 Bad Request - Expired OTP)**
```json
{
    "success": false,
    "message": "OTP has expired. Please request a new OTP"
}
```

**Error (404 Not Found)**
```json
{
    "success": false,
    "message": "User not found with this email"
}
```

## Complete Flow Example

### 1. Request OTP
```bash
curl -X POST \
  http://localhost:3000/api/v1/user/request-password-reset-otp \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@email.com"
  }'
```

**Response:**
```json
{
    "success": true,
    "message": "OTP sent successfully to your email",
    "data": {
        "email": "user@email.com",
        "expiresIn": "10 minutes"
    }
}
```

### 2. Check Email for OTP
📧 **Email Subject:** "🔐 Password Reset OTP - EchoReads"

The email contains a beautiful HTML template with:
- User's name
- 6-digit OTP code
- Expiry information
- Security tips

### 3. Reset Password with OTP
```bash
curl -X POST \
  http://localhost:3000/api/v1/user/reset-password-with-otp \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@email.com",
    "otp": "123456",
    "newPassword": "newpassword123"
  }'
```

**Response:**
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

## Code Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const resetPasswordWithOtp = async (email, newPassword) => {
    try {
        // Step 1: Request OTP
        console.log('Requesting OTP...');
        const otpResponse = await axios.post('http://localhost:3000/api/v1/user/request-password-reset-otp', {
            email: email
        });
        
        if (otpResponse.data.success) {
            console.log('✅ OTP sent! Check your email.');
            
            // Step 2: Reset password (you'll need to get OTP from email)
            const otp = '123456'; // Replace with actual OTP from email
            
            const resetResponse = await axios.post('http://localhost:3000/api/v1/user/reset-password-with-otp', {
                email: email,
                otp: otp,
                newPassword: newPassword
            });
            
            if (resetResponse.data.success) {
                console.log('✅ Password reset successful!');
                return resetResponse.data;
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data?.message || error.message);
    }
};

// Usage
resetPasswordWithOtp('user@email.com', 'newpassword123');
```

### Python
```python
import requests

def reset_password_with_otp(email, new_password):
    url_base = "http://localhost:3000/api/v1/user"
    
    try:
        # Step 1: Request OTP
        print("Requesting OTP...")
        otp_response = requests.post(f"{url_base}/request-password-reset-otp", json={
            "email": email
        })
        
        if otp_response.json()['success']:
            print("✅ OTP sent! Check your email.")
            
            # Step 2: Reset password (you'll need to get OTP from email)
            otp = "123456"  # Replace with actual OTP from email
            
            reset_response = requests.post(f"{url_base}/reset-password-with-otp", json={
                "email": email,
                "otp": otp,
                "newPassword": new_password
            })
            
            if reset_response.json()['success']:
                print("✅ Password reset successful!")
                return reset_response.json()
                
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")

# Usage
reset_password_with_otp('user@email.com', 'newpassword123')
```

## Features

✅ **Secure OTP Verification** - 6-digit code sent via email  
✅ **Rate Limiting** - 2-minute cooldown between OTP requests  
✅ **OTP Expiry** - 10-minute validity period  
✅ **Beautiful Email Template** - Professional HTML email with styling  
✅ **Input Validation** - Comprehensive error checking  
✅ **Password Hashing** - Secure bcrypt hashing  
✅ **Clear Error Messages** - User-friendly error responses  
✅ **Simple 2-Step Process** - Easy to implement and use  

## Security Features

- **OTP Generation:** Cryptographically secure random 6-digit codes
- **Rate Limiting:** Prevents OTP spam (2-minute cooldown)
- **OTP Expiry:** 10-minute validity period
- **Password Hashing:** bcrypt with salt rounds
- **Input Validation:** Comprehensive field validation
- **Email Verification:** OTP sent to registered email only

## Email Template Features

- **Professional Design:** Beautiful gradient background
- **Lock Icon:** Visual security indicator
- **Large OTP Display:** Easy-to-read 6-digit code
- **Expiry Information:** Clear validity period
- **Security Tips:** Helpful security reminders
- **Responsive Layout:** Works on all devices

## Testing

Run the comprehensive test suite:

```bash
node test_password_reset_with_otp.js
```

The test file covers:
- ✅ OTP request
- ✅ Password reset with OTP
- ✅ Rate limiting
- ✅ Invalid OTP handling
- ✅ Missing field validation

## Environment Variables Required

Make sure these are set in your `.env` file:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Comparison with Simple API

| Feature | Simple API | OTP API |
|---------|------------|---------|
| Security | Basic | Enhanced |
| Steps | 1 | 2 |
| OTP Verification | No | Yes |
| Rate Limiting | No | Yes |
| Email Confirmation | No | Yes |
| User Experience | Very Simple | Secure & Simple |

## That's It! 🎉

**A secure, user-friendly password reset system with OTP verification that's still easy to use!** 