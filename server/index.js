const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/Auth.Routes');

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

const laporanRoutes = require('./routes/Laporan.Routes');
const userRoutes = require('./routes/User.Routes');
const eksternalRoutes = require('./routes/Eksternal.Routes');

app.use('/api/auth', authRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/eksternal', eksternalRoutes);

const path = require('path'); // Ensure path is imported
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, path) => {
        // Optionally only set for specific types, or simply generic 'inline' so browser handles it natively
        res.setHeader('Content-Disposition', 'inline');
    }
}));

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
    if (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
    console.log(`Server running on port ${PORT}`);
});
