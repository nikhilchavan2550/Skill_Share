import mongoose from 'mongoose';

const tokenBlacklistSchema = new mongoose.Schema({
 token: {
 type: String,
 required: true,
 unique: true
 },
 invalidatedAt: {
 type: Date,
 default: Date.now
 }
});

export const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);