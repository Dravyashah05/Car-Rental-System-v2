require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('./src/models/Vehicle');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const vehicle = await Vehicle.findById('661a1f001234abcd00000001');
    console.log(vehicle ? 'FOUND' : 'NOT FOUND');
    if (vehicle) console.log(JSON.stringify(vehicle.toObject(), null, 2));
  } catch (err) {
    console.error('ERR', err.message || err);
  } finally {
    await mongoose.disconnect();
  }
})();
