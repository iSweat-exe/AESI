const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  serverId: { type: String, required: true },
  balance: { type: Number, default: 250 },
  dailyLastUsed: { type: Number, default: 0 },
  coinflipLastUsed: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
});

const model = mongoose.model("aesidb", profileSchema);

module.exports = model;
