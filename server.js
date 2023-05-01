
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

mongoose.connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true
})
.then(() => console.log("DB Connected"))
.catch((err) => console.log("MongoDB Connection Failed", err));

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`App running on port ${port}`)
})




