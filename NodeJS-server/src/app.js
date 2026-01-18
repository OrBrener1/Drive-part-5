const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./db');


// ===============================
// CORS configuration
// ===============================
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------------------------
// Body parsers with increased size limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// ---------------------------

//app.use('/api/users', require('./routes/users'));
//app.use('/api/tokens', require('./routes/tokens'));
app.use('/api/users', require('./mongoRoutes/users'));
app.use('/api/tokens', require('./mongoRoutes/tokens'));
app.use('/api/files', require('./mongoRoutes/files'));
app.use('/api/folders', require('./mongoRoutes/folders'));
app.use('/api/search', require('./mongoRoutes/search'));

module.exports = app;

const PORT = 5000;
connectDB();
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
