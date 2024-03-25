const express = require('express');
const fs = require('node:fs');

const app = express();
const port = 3000;

const toursJSON = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours.json`));

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: toursJSON.length,
    data: {
      tours: toursJSON,
    },
  });
});

app.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});
