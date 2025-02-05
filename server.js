import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import Meeting from './models/Meeting.js'; // Ensure you add .js in import

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/your_database_name', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Add Event API
app.post('/api/events', async (req, res) => {
    try {
        const meeting = new Meeting(req.body);
        console.log(req.body,"req.body")
        let data = await meeting.save();
        console.log(data,"datadata")
        res.status(201).json({ message: 'Event added successfully', meeting });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE Event API

app.put('/api/events/:EventId', async (req, res) => {
    const { EventId } = req.params;
    const updatedData = req.body;

    try {
        const updatedEvent = await Meeting.findOneAndUpdate(
            { EventId: EventId },
            { $set: updatedData },
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json({ message: 'Event updated successfully', updatedEvent });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// server.js (Backend)
app.delete('/api/events/:EventId', async (req, res) => {
    const { EventId } = req.params;

    try {
        // Find and delete the event by its _id
        const deletedEvent = await Meeting.deleteOne({ EventId: EventId });

        // If no event is found with the provided id, return a 404 error
        if (!deletedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // If event is deleted successfully, return success message
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
});


// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
