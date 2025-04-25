require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();


app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Task Schema and Model
const taskSchema = new mongoose.Schema({
    task: String,
    time: String, // HH:MM format
    date: Date,   // Due date
});

const Task = mongoose.model('Task', taskSchema);

// Function to Send Email Notifications
const sendNotification = async (task) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, 
        subject: 'Task Reminder',
        text: `Reminder: Your task "${task}" is due now!`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email notification sent!');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// API Endpoint to Add Tasks
app.post('/add-task', async (req, res) => {
    try {
        const { task, time, date } = req.body;
        const newTask = new Task({ task, time, date });
        await newTask.save();
        res.status(201).json({ message: 'Task added successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add task' });
    }
});

// Cron Job to Check and Send Notifications
cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const tasks = await Task.find({ time: currentTime, date: { $lte: now } });
    tasks.forEach(task => {
        console.log(`Time to complete your task: ${task.task}`);
        sendNotification(task.task);
    });
});

// Start the Server
app.listen(process.env.PORT1, () => {
    console.log(`Server running on http://localhost:${process.env.PORT1}`);
});
