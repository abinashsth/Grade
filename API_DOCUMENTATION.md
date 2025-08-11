# GradePro API Documentation

## Overview
GradePro is a role-based academic performance grading and evaluation system built with the MERN stack. This API provides endpoints for managing users, courses, and grades with proper authentication and authorization.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data (if applicable)
  "pagination": {}, // Pagination info (for list endpoints)
  "errors": [] // Validation errors (if applicable)
}
```

## Authentication Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" // Optional: "admin", "teacher", "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### POST /auth/login
Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### GET /auth/me
Get current user information.

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "assignedCourses": [],
    "lastLogin": "2023-01-01T00:00:00.000Z",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## User Management Endpoints (Admin Only)

### GET /users
Get all users with filtering and pagination.

**Headers:** Authorization required (Admin only)

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `role` (string): Filter by role ("admin", "teacher", "student")
- `search` (string): Search by name or email
- `sort` (string): Sort field (default: "-createdAt")

**Response:**
```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "data": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /users
Create a new user.

**Headers:** Authorization required (Admin only)

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "teacher"
}
```

### PUT /users/:id
Update user information.

**Headers:** Authorization required (Admin only)

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "email": "jane.updated@example.com",
  "role": "teacher",
  "isActive": true
}
```

### DELETE /users/:id
Soft delete a user.

**Headers:** Authorization required (Admin only)

## Course Management Endpoints

### GET /courses
Get courses with role-based filtering.

**Headers:** Authorization required

**Query Parameters:**
- `page`, `limit`, `sort`: Pagination options
- `semester` (string): Filter by semester
- `year` (number): Filter by year
- `search` (string): Search by course name or subject code

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "course_id",
      "name": "Introduction to Computer Science",
      "subjectCode": "CS101",
      "description": "Basic computer science concepts",
      "teacherId": {
        "name": "Dr. Smith",
        "email": "smith@example.com"
      },
      "enrolledStudents": [],
      "credits": 3,
      "semester": "Fall",
      "year": 2023,
      "maxStudents": 50,
      "gradingSchema": "letter",
      "isActive": true
    }
  ]
}
```

### POST /courses
Create a new course.

**Headers:** Authorization required (Admin only)

**Request Body:**
```json
{
  "name": "Advanced Programming",
  "subjectCode": "CS201",
  "description": "Advanced programming concepts",
  "teacherId": "teacher_id",
  "credits": 4,
  "semester": "Spring",
  "year": 2024,
  "maxStudents": 30,
  "gradingSchema": "letter"
}
```

### PUT /courses/:id
Update course information.

**Headers:** Authorization required (Admin only)

### DELETE /courses/:id
Soft delete a course.

**Headers:** Authorization required (Admin only)

### POST /courses/:id/enroll
Enroll a student in a course.

**Headers:** Authorization required (Admin or Student for self-enrollment)

**Request Body:**
```json
{
  "studentId": "student_id" // Optional for admin, ignored for students
}
```

## Grade Management Endpoints

### GET /grades
Get grades with role-based filtering.

**Headers:** Authorization required

**Query Parameters:**
- `page`, `limit`, `sort`: Pagination options
- `courseId` (string): Filter by course
- `studentId` (string): Filter by student (admin/teacher only)
- `assignmentType` (string): Filter by assignment type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "grade_id",
      "studentId": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "courseId": {
        "name": "CS101",
        "subjectCode": "CS101"
      },
      "gradedBy": {
        "name": "Dr. Smith"
      },
      "assignmentName": "Midterm Exam",
      "assignmentType": "exam",
      "maxPoints": 100,
      "earnedPoints": 85,
      "weight": 1,
      "remarks": "Good work",
      "feedback": "Well done overall",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /grades
Create a new grade.

**Headers:** Authorization required (Teacher or Admin)

**Request Body:**
```json
{
  "studentId": "student_id",
  "courseId": "course_id",
  "assignmentName": "Final Project",
  "assignmentType": "project",
  "maxPoints": 100,
  "earnedPoints": 92,
  "weight": 2,
  "remarks": "Excellent work",
  "feedback": "Outstanding project with creative solutions",
  "dueDate": "2023-12-15T23:59:59.000Z"
}
```

### PUT /grades/:id
Update a grade.

**Headers:** Authorization required (Teacher who created the grade or Admin)

### DELETE /grades/:id
Delete a grade.

**Headers:** Authorization required (Teacher who created the grade or Admin)

### GET /grades/average/:studentId/:courseId
Get course average for a student.

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": {
    "studentId": "student_id",
    "courseId": "course_id",
    "average": 87.5,
    "letterGrade": "B+"
  }
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting
API requests are limited to 100 requests per 15-minute window per IP address.

## Data Validation
All endpoints include comprehensive input validation with detailed error messages for invalid data.
