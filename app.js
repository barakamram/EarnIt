const express = require('express');
// const cors = require('cors');
const app = express();
const userRouter = require('./Routers/userRauter');



app.use(express.json());
app.use('/api', userRouter);

module.exports = app