const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const profileRouter = require('./routes/profile');
const resumeRouter = require('./routes/resume');
const careersRouter = require('./routes/careers');
const chatRouter = require('./routes/chat');

app.use('/api/profile', profileRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/careers', careersRouter);
app.use('/api/chat', chatRouter);

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
