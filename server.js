// Local development entry point. Vercel uses api/index.js directly.
const express = require('express');
const path = require('path');
require('dotenv').config();
const app = require('./api');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`System is running at http://localhost:${PORT}`));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
