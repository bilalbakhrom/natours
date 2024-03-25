const express = require('express');
const fs = require('node:fs');

const app = express();
const port = 3000;

app.use(express.json());

const toursJSON = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: toursJSON.length,
    data: {
      tour,
    },
  });
});

app.get('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1;

  if (id > toursJSON.length) {
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid ID',
    });
  }

  const tour = toursJSON.find((item) => item.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  const newId = toursJSON[toursJSON.length - 1].id + 1;
  const newTour = Object.assign(
    {
      id: newId,
    },
    req.body
  );

  toursJSON.push(newTour);

  fs.promises
    .writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours)
    )
    .then(() => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: 'error',
        message: 'Failed to save the new tour',
      });
    });
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(toursJSON),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
});

app.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});
