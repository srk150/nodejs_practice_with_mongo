const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

const bodyParser = require('body-parser');

const dotenv = require('dotenv');
// Load environment variables from .env file
dotenv.config();

app.use(express.static('public'));
app.use(bodyParser.json());

// MongoDB Connection

const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://localhost:27017/nodeApi';


mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false, // Set to false to use native findOneAndUpdate() instead of findAndModify()
  useCreateIndex: true,    // Set to true to use the createIndex() function instead of ensureIndex()
});



const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});


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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
