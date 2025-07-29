const express = require('express');
const connectDB = require('./dbconnect/databaseConnect');
const path = require('path');
const router = require('./router/routers');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Connect to database
connectDB();

app.use('/',router);


app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
