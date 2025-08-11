# GradePro Troubleshooting Guide

## Common Issues and Solutions

### 1. 'react-scripts' is not recognized

**Problem:** When running `npm start` in the client directory, you get:
```
'react-scripts' is not recognized as an internal or external command
```

**Solutions:**

#### Option A: Use npx
```bash
cd client
npx react-scripts start
```

#### Option B: Reinstall dependencies
```bash
cd client
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
# Or on Windows PowerShell:
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall dependencies
npm install

# Try starting again
npm start
```

#### Option C: Install react-scripts globally
```bash
npm install -g react-scripts
```

#### Option D: Use Yarn instead
```bash
# Install yarn globally
npm install -g yarn

cd client
# Remove npm dependencies
rm -rf node_modules package-lock.json

# Install with yarn
yarn install

# Start with yarn
yarn start
```

### 2. Node.js Version Issues

**Problem:** Compatibility issues with Node.js version

**Solution:**
- Ensure you're using Node.js version 14 or higher
- Check your version: `node --version`
- Update Node.js if needed from [nodejs.org](https://nodejs.org/)

### 3. Port Already in Use

**Problem:** Port 3000 or 5000 is already in use

**Solutions:**

#### For Frontend (Port 3000):
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or start on different port
set PORT=3001 && npm start
```

#### For Backend (Port 5000):
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### 4. Database Connection Issues

**Problem:** MongoDB connection errors

**Solutions:**

#### For Local MongoDB:
1. Ensure MongoDB is installed and running
2. Check if MongoDB service is started
3. Verify connection string in `server/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/gradepro
   ```

#### For MongoDB Atlas:
1. Check your connection string format:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gradepro
   ```
2. Ensure your IP is whitelisted in MongoDB Atlas
3. Verify username and password are correct

### 5. Environment Variables Not Loading

**Problem:** Environment variables not being read

**Solutions:**
1. Ensure `.env` file is in the `server` directory
2. Check file format (no spaces around =):
   ```
   JWT_SECRET=your_secret_here
   MONGODB_URI=your_connection_string
   ```
3. Restart the server after changing `.env`

### 6. CORS Errors

**Problem:** Cross-origin request blocked

**Solutions:**
1. Ensure `CLIENT_URL` in server `.env` matches your frontend URL:
   ```
   CLIENT_URL=http://localhost:3000
   ```
2. Check that the proxy is set in `client/package.json`:
   ```json
   "proxy": "http://localhost:5000"
   ```

### 7. Build Errors

**Problem:** Build fails with various errors

**Solutions:**

#### Clear Cache:
```bash
# Clear npm cache
npm cache clean --force

# Clear React cache
rm -rf node_modules/.cache
```

#### Update Dependencies:
```bash
npm update
```

#### Check for Syntax Errors:
- Review recent code changes
- Check console for specific error messages
- Ensure all imports are correct

### 8. Authentication Issues

**Problem:** Login/logout not working properly

**Solutions:**
1. Clear browser localStorage:
   ```javascript
   // In browser console
   localStorage.clear()
   ```
2. Check JWT_SECRET in server `.env`
3. Verify token expiration settings

### 9. Styling Issues

**Problem:** TailwindCSS styles not applying

**Solutions:**
1. Ensure TailwindCSS is properly installed:
   ```bash
   cd client
   npm install -D tailwindcss postcss autoprefixer
   ```
2. Check `tailwind.config.js` configuration
3. Verify `@tailwind` directives in `src/index.css`

### 10. API Endpoints Not Working

**Problem:** API requests failing

**Solutions:**
1. Check if backend server is running on port 5000
2. Verify API endpoints in browser: `http://localhost:5000/api/health`
3. Check network tab in browser dev tools for error details
4. Ensure proper authentication headers are being sent

## Quick Start Commands

### Start Development Servers:
```bash
# Option 1: Start both servers simultaneously
npm run dev

# Option 2: Start servers separately
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

### Reset Everything:
```bash
# Stop all servers
# Delete node_modules in both directories
rm -rf server/node_modules client/node_modules
rm -rf server/package-lock.json client/package-lock.json

# Reinstall everything
cd server && npm install
cd ../client && npm install

# Start development
npm run dev
```

## Getting Help

If you're still experiencing issues:

1. Check the console output for specific error messages
2. Review the browser's developer tools (F12) for frontend errors
3. Check the server logs for backend errors
4. Ensure all prerequisites are installed correctly
5. Try the "Reset Everything" commands above

## Useful Commands

```bash
# Check versions
node --version
npm --version

# Check running processes
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill processes (Windows)
taskkill /PID <PID> /F

# Clear npm cache
npm cache clean --force

# Update npm
npm install -g npm@latest
```
