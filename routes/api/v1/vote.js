const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Client, GatewayIntentBits } = require('discord.js');
const Vote = require('../../../models/votes');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once('ready', () => {
    console.log('Connected to Discord');
});

client.login(process.env.DISCORD_TOKEN);

router.get('/:botID', async (req, res) => {
    const { botID } = req.params;
    const { user: userID } = req.query;
    const guildID = '1275535499007627436';
    const botRoleID = '1275619408303358083';

    try {
        const guild = await client.guilds.fetch(guildID);
        const bot = await guild.members.fetch(botID);
        const user = await guild.members.fetch(userID);

        if (!bot.roles.cache.has(botRoleID)) {
            return res.status(403).json({ error: "The provided ID does not belong to a bot or the bot does not have the required role." });
        }

        const existingVoteRecord = await Vote.findOne({ botID });

        if (existingVoteRecord) {
            const userVote = existingVoteRecord.votes.find(v => v.userID === userID);

            if (userVote) {
                const currentTime = new Date();
                const voteExpiryTime = new Date(userVote.timestamp);
                voteExpiryTime.setHours(voteExpiryTime.getHours() + 12);

                if (currentTime < voteExpiryTime) {
                    return res.status(429).json({ error: `You need to wait before voting again. Please try again after ${voteExpiryTime.toLocaleString()}.` });
                } else {
                    userVote.vote = true;
                    userVote.timestamp = new Date();
                    userVote.expired = false;
                }
            } else {
                const lastUserVote = await Vote.findOne({ 'votes.userID': userID, 'votes.timestamp': { $gte: new Date(Date.now() - 12 * 60 * 60 * 1000) } });

                if (lastUserVote) {
                    return res.status(429).json({ error: "You have already voted for another bot in the last 12 hours." });
                }

                existingVoteRecord.votes.push({ userID, vote: true, timestamp: new Date(), expired: false });
            }

            existingVoteRecord.amount += 1;
            await existingVoteRecord.save();

            return res.json({ message: "Vote registered successfully" });
        } else {
            const newVoteRecord = new Vote({
                botID,
                votes: [{ userID, vote: true, timestamp: new Date(), expired: false }],
                amount: 1
            });

            await newVoteRecord.save();
            return res.json({ message: "Vote registered successfully" });
        }
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;