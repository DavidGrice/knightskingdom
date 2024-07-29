import userData from './data/userData.json';
const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

app.post('/updateUserData', (req, res) => {
  const updatedData = req.body;

  fs.writeFile(userData, JSON.stringify(updatedData, null, 2), (err) => {
    if (err) {
      return res.status(500).send('Error writing file');
    }
    res.send('File updated successfully');
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});