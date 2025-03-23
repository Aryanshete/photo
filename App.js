const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_jwt_secret';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection with Retry Logic
const connectWithRetry = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/photostudio', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');
        await createDefaultUsers();
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.log('Retrying in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
};

// Create default users with proper password hashing
async function createDefaultUsers() {
    try {
        // Check for existing users
        const adminExists = await User.findOne({ email: 'admin@example.com' });
        const userExists = await User.findOne({ email: 'user@example.com' });

        if (!adminExists) {
            await User.create({
                name: 'Admin',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin'
            });
            console.log('Admin user created');
        }

        if (!userExists) {
            await User.create({
                name: 'Default User',
                email: 'user@example.com',
                password: 'user123',
                role: 'user'
            });
            console.log('Default user created');
        }
    } catch (error) {
        console.error('Error creating default users:', error);
    }
}

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Please authenticate' });
    }
};

// User login route with proper password comparison
app.post('/api/admin/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});


// Protected route example
app.get('/api/protected', auth, (req, res) => {
    res.json({ success: true, message: 'Protected data', user: req.user });
});

// Start server after MongoDB connection
connectWithRetry();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
