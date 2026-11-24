// Local development entry point.
const express = require('express');
const path = require('path');
require('dotenv').config();
const app = require('./api');

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`System is running at http://localhost:${PORT}`));
}

module.exports = app;
