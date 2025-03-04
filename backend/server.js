const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/jobs', require('./src/routes/jobRoutes'));

// Custom error handler for mongoose validation errors
const handleValidationError = (err, res) => {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors
    });
};

// Custom error handler for mongoose duplicate key errors
const handleDuplicateKeyError = (err, res) => {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
        success: false,
        error: 'Duplicate Field',
        details: `${field} already exists`
    });
};

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return handleValidationError(err, res);
    }

    // Mongoose duplicate key error
    if (err.code && err.code === 11000) {
        return handleDuplicateKeyError(err, res);
    }

    // JWT authentication error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }

    // JWT token expired error
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token expired'
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Something went wrong!'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
