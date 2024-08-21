const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Vote = require('../../../../models/votes');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { bot: botID } = req.query;

    try {
        const voteRecord = await Vote.findOne({ botID, 'votes.userID': id });

        if (voteRecord) {
            const userVote = voteRecord.votes.find(v => v.userID === id);

            if (!userVote) {
                return res.status(404).json({ error: "This user has not voted for this bot" });
            }

            const currentTime = new Date();
            const voteExpiryTime = new Date(userVote.timestamp);
            voteExpiryTime.setHours(voteExpiryTime.getHours() + 12);

            if (currentTime > voteExpiryTime) {
                userVote.vote = false;
                userVote.expired = true;
                await voteRecord.save();
            }

            return res.json({
                vote: userVote.vote,
                timestamp: userVote.timestamp,
                expired: userVote.expired,
                expiryTime: voteExpiryTime.toLocaleString()
            });
        } else {
            return res.status(404).json({ error: "This user has not voted for this bot" });
        }
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;