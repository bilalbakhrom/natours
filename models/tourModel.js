// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The tour name must be specified'],
  },
  rating: {
    type: Number,
    default: 0.0,
  },
  price: {
    type: Number,
    required: [true, 'The tour price must be specified'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
