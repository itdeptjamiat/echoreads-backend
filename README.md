# User Authentication & Admin API

This project provides a simple user authentication system with password reset functionality and an admin endpoint to fetch all users. It is built with Node.js, Express, and MongoDB.

## Features

- **User Signup & Login**
- **Password Reset via Email OTP**
- **Admin-only: Get All Users**
- **JWT-based Authentication**
- **Role-based Access Control**

---

## API Endpoints

### User

#### Signup

- **POST** `/api/v1/user/signup`
- **Body:**  
  ```json
  {
    "email": "user@example.com",
    "password": "yourPassword"
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
- **Result:** Sends a 6-digit OTP to the user's email (valid for 10 minutes).

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

---

### Admin

#### Get All Users

- **GET** `/api/v1/admin/users`
- **Headers:**  
  `Authorization: Bearer <admin_jwt_token>`
- **Result:** Returns a list of all users (excluding passwords and tokens).

---

## Project Structure
