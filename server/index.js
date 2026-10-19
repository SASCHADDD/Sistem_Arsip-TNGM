const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
require('./config/jwt');

const app = express();
const authRoutes = require('./routes/Auth.Routes');

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

const laporanRoutes = require('./routes/Laporan.Routes');
const userRoutes = require('./routes/User.Routes');
const eksternalRoutes = require('./routes/Eksternal.Routes');
const filesRoutes = require('./authorization/Files.Routes');

app.use('/api/auth', authRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/eksternal', eksternalRoutes);
app.use('/api/files', filesRoutes);

const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads');
const profileDir = path.join(uploadsDir, 'profile');
app.use('/uploads/profile', express.static(profileDir, {
    setHeaders: (res) => res.setHeader('Content-Disposition', 'inline')
}));

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
    if (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
    console.log(`Server running on port ${PORT}`);
});
