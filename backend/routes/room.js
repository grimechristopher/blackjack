const express = require('express');
const router = express.Router();

const roomService = require('../services/room.js');

// Get
router.get('/', async (req, res) => {
    let rooms = await roomService.getRooms();
    res.json(rooms);
})

router.get('/create/', async (req, res) => {
    // Create a room
    let roomId = await roomService.createRoom();
    res.json(roomId);
})

// Delete

module.exports = router;