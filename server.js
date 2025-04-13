import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import chatRouter from './api/chat.js';
import cors from 'cors';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Get dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Configure CORS for all routes
app.use(cors({
  origin: ['http://localhost:3000', 'https://aiethic.org', 'https://www.aiethic.org', 'https://tendsxgaurav.github.io', 'https://aiethic.me', 'https://www.aiethic.me'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/chat', chatRouter);

// Serve the HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat.html'));
});

// Status endpoint to check if the server is running
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AIethic server is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Server environment: ${process.env.NODE_ENV || 'development'}`);
});