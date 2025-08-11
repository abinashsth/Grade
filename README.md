# GradePro: Role-Based Academic Performance Grading and Evaluation System

## 📚 Overview
GradePro is a comprehensive MERN stack application designed for academic institutions to manage grades, courses, and user roles efficiently. The system implements secure role-based access control for Admins, Teachers, and Students.

## 🔐 User Roles

### Admin
- Manage all users (CRUD operations for Teachers and Students)
- Assign teachers to specific courses
- Create, update, delete course and subject information
- View system-wide reports and grade analytics
- Control evaluation schemas and grading rubrics

### Teacher
- View assigned students and courses
- Create and manage grade entries
- Update student grades
- Generate performance reports per course
- Provide feedback on assignments

### Student
- Register and login to view personal dashboard
- View assigned courses and grades
- Download grade reports
- View teacher feedback

## 🛠️ Tech Stack

### Frontend
- React.js with React Router
- Axios for API requests
- Context API for state management
- TailwindCSS for styling

### Backend
- Node.js with Express.js
- JWT for authentication
- bcrypt for password security
- Role-based middleware for access control

### Database
- MongoDB Atlas
- Mongoose ODM for schema validation

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd GradePro
```

2. Install dependencies for both client and server
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Or use the convenience script from root
cd ..
npm run install-all
```

3. Set up environment variables
```bash
# Create .env file in server directory
cd server
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/gradepro
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gradepro

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

4. Start the development servers

**Option 1: Start both servers simultaneously**
```bash
# From the root directory
npm run dev
```

**Option 2: Start servers separately**
```bash
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend server
cd client
npm start
```

5. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## 📁 Project Structure
```
GradePro/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── config/
│   └── server.js
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Courses
- `GET /api/courses` - Get courses (role-based)
- `POST /api/courses` - Create course (Admin only)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course (Admin only)

### Grades
- `GET /api/grades` - Get grades (role-based)
- `POST /api/grades` - Create grade (Teacher only)
- `PUT /api/grades/:id` - Update grade (Teacher only)
- `DELETE /api/grades/:id` - Delete grade (Teacher only)

## 🧪 Features

### Core Features
- JWT-based authentication with role-based access control
- Responsive dashboard for each user role
- Complete CRUD operations for all entities
- Grade management with validation
- Course assignment system

### Bonus Features
- Email notifications for grade updates
- Export grades to PDF/CSV
- Search, filter, and sort functionality
- Analytics and reporting dashboard

## 🧪 Testing

### Running Tests
```bash
# Run server tests
cd server
npm test

# Run client tests
cd client
npm test
```

### Test Coverage
The application includes comprehensive tests for:
- Authentication and authorization
- API endpoints
- Database models
- Frontend components

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git:
```bash
git push heroku main
```

### Frontend Deployment (Netlify/Vercel)
1. Build the client application:
```bash
cd client
npm run build
```
2. Deploy the `build` folder to your hosting service

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CLIENT_URL=your_production_frontend_url
```

## 📚 Usage Guide

### Default Admin Account
After setting up the database, create an admin account:
1. Register a new user through the frontend
2. Manually update the user's role to 'admin' in the database
3. Or use the API to create an admin user

### User Roles and Permissions

**Admin:**
- Full system access
- Manage all users (create, read, update, delete)
- Manage all courses
- View all grades and analytics
- System configuration

**Teacher:**
- View assigned courses and enrolled students
- Create, update, and delete grades for their courses
- Generate reports for their classes
- Provide feedback to students

**Student:**
- View enrolled courses
- View personal grades and feedback
- Download grade reports
- Track academic progress

### Common Workflows

**For Admins:**
1. Create teacher and student accounts
2. Create courses and assign teachers
3. Enroll students in courses
4. Monitor system-wide performance

**For Teachers:**
1. View assigned courses
2. Enter grades for assignments, quizzes, and exams
3. Provide feedback to students
4. Generate class performance reports

**For Students:**
1. View enrolled courses
2. Check grades and feedback
3. Track academic progress
4. Download transcripts

## 🔧 Configuration

### Database Setup
The application uses MongoDB with the following collections:
- `users` - User accounts and profiles
- `courses` - Course information and enrollment
- `grades` - Grade records and feedback

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS protection

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error:**
- Verify MongoDB is running (local) or connection string is correct (Atlas)
- Check network connectivity
- Ensure database user has proper permissions

**Authentication Issues:**
- Verify JWT_SECRET is set in environment variables
- Check token expiration settings
- Clear browser localStorage if needed

**CORS Errors:**
- Verify CLIENT_URL is set correctly in server environment
- Check that frontend and backend URLs match

**Build Errors:**
- Clear node_modules and reinstall dependencies
- Check Node.js version compatibility
- Verify all environment variables are set

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments
- Built with the MERN stack (MongoDB, Express.js, React, Node.js)
- Styled with TailwindCSS
- Authentication with JWT
- Icons and UI inspiration from various open-source projects
