const express = require('express');
const fs = require('node:fs');

const app = express();
const port = 3000;

app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  const id = req.params.id * 1;

  if (id > tours.length) {
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid ID',
    });
  }

  const tour = tours.find((item) => item.id === id);

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  fs.promises
    .writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours)
    )
    .then(() => {
      tours.push(newTour);
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
};

const updateTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;

  if (newId > tours.length) {
    return res.status(500).json({
      status: 'error',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here..>',
    },
  });
};

const deleteTour = (req, res) => {
  const id = req.params.id * 1;
  const index = tours.findIndex((item) => item.id === id);

  if (id == -1) {
    return res.status(500).json({
      status: 'error',
      message: 'Invalid ID',
    });
  }
  console.log(`the tour at ${index}: ${tours[index]}`);
  tours.splice(index, 1);

  fs.promises
    .writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours)
    )
    .then(() => {
      res.status(204).json({
        status: 'success',
        data: null,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: 'error',
        message: 'Failed to save the new tour',
      });
    });
};

app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});
