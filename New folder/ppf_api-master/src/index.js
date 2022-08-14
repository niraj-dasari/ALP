require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;

mongoose.connect("mongodb+srv://nirajd:nirajd@cluster0.tzl3stz.mongodb.net/?retryWrites=true&w=majority");
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})
const app = express();
app.use(cors())
app.use(express.json());

const routes = require('./api/routes/v1');

app.use('/', routes)

app.listen(3000, () => {
    console.log(`Server Started at ${3000}`)
})