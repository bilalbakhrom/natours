const express = require('express');
const fs = require('node:fs');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');

const app = express();
const port = 3000;

// 1) Middlewares

app.use(morgan('dev'));
app.use(express.json());

// 3) Routes

app.use('/api/v1/tours', tourRouter);

// 4) Server

app.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});
