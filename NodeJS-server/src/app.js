// Express app entry: CORS, body parsing, and Mongo-backed routes.

const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./db');

require('dotenv').config();
// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // requests without origin (mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------------------------
// Body parsers with increased size limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// ---------------------------

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

//check for connection
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});
