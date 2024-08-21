const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    botID: String,
    votes: [
        {
            userID: String,
            vote: Boolean,
            timestamp: Number,
            expired: Boolean
        }
    ],
    amount: Number
});

const Vote = mongoose.model('Vote', voteSchema);
module.exports = Vote;