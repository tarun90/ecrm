import express from 'express';
import Meeting from '../models/Meeting.js'; // Ensure correct path

const router = express.Router();

// Add Event API
router.post('/', async (req, res) => {
    try {
        const meeting = new Meeting(req.body);
        console.log(req.body, "req.body");
        let data = await meeting.save();
        console.log(data, "datadata");
        res.status(201).json({ message: 'Event added successfully', meeting });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Event API
router.put('/:EventId', async (req, res) => {
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

// Delete Event API
router.delete('/:EventId', async (req, res) => {
    const { EventId } = req.params;

    try {
        const deletedEvent = await Meeting.deleteOne({ EventId: EventId });

        if (!deletedEvent.deletedCount) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

export default router;
