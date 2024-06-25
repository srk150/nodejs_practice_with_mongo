const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require('body-parser');

const dotenv = require('dotenv');

const cron = require('node-cron');
const axios = require('axios');


// Load environment variables from .env file
dotenv.config();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB Connection
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});


// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGODB_URI);

// mongoose.connection.on('connected', () => {
//   console.log('Connected to MongoDB');
// });

// mongoose.connection.on('error', (err) => {
//   console.error(`MongoDB connection error: ${err}`);
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('Disconnected from MongoDB');
// });

// process.on('SIGINT', async () => {
//   await mongoose.connection.close();
//   process.exit(0);
// });


//route files path
const userRoutes = require('./routes/userRoutes');
const attendenceRoute = require('./routes/attendenceRoute');
const taskRoutes = require('./routes/taskRoutes');
const clientRoutes = require('./routes/clientRoutes');
const EmpRoutes = require('./routes/employeeRoute');
const vendorRoute = require('./routes/vendorRoute');
const reimbrushRoute = require('./routes/reimbrushRoute');
const assetsRoute = require('./routes/assetsRoute');
const licenseRoute = require('./routes/licenseRoute');

// Set base URL
const baseRoute = '/api';

// Define a route for the base URL
app.get(baseRoute, (req, res) => {
  res.send(`
    <h1 style="text-align:center">Hello, Node Js </h1>
    <img src="./images/node.png" alt="Hello Image" width="100%" height="100%">
  `);

});


// Use the user routes
app.use(`${baseRoute}/user`, userRoutes);
app.use(`${baseRoute}/attendance`, attendenceRoute);
app.use(`${baseRoute}/task`, taskRoutes);
app.use(`${baseRoute}/client`, clientRoutes);
app.use(`${baseRoute}/employee`, EmpRoutes);
app.use(`${baseRoute}/vendor`, vendorRoute);
app.use(`${baseRoute}/reimbrushment`, reimbrushRoute);
app.use(`${baseRoute}/asset`, assetsRoute);
app.use(`${baseRoute}/license`, licenseRoute);



//Cron job for auto logout Attendence
const taskForAutologout = async () => {
  try {
    // Make the API GET request
    const baseUrl23 = process.env.BASE_URL;
    const endpointPath11 = '/api/attendance/autolog';

    const response32 = await axios.get(baseUrl23 + endpointPath11);
    console.log('Attendance for auto logout to run at 11:59:', response32.data);

  } catch (error) {
    console.error('Error making API request:', error);
  }
};

// cron.schedule('* * * * *', taskForAutologout); //every minutes
cron.schedule('59 23 * * *', taskForAutologout); // at 11.59 pm
//end cronjob function for attendence



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});