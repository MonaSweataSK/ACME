// src/index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from ACME!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
