#!/usr/bin/env node
// scripts/backfill-timestamps.js

// Load env (optional in prod)
try { require("dotenv").config(); } catch (_) {}

const path = require("path");
const mongoose = require("mongoose");

// Resolve project root no matter where this file lives
const ROOT = path.resolve(__dirname, "..");

// Import models via absolute paths from ROOT
const Campground = require(path.join(ROOT, "models/campground"));
const Comment = require(path.join(ROOT, "models/comment"));

const MONGO = process.env.YELPCAMPDATABASEURL || process.env.MONGO_URI;
if (!MONGO) {
  console.error("Set BLOGGERURL or MONGO_URI in your environment.");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO);
    console.log("Connected to MongoDB.");

    // Prefer accurate createdAt from ObjectId timestamp; use $$NOW for updatedAt
    // This uses an update *pipeline* (MongoDB 4.2+). If your driver rejects it, see fallback below.
    const pipeline = [
      {
        $set: {
          createdAt: { $ifNull: ["$createdAt", { $toDate: "$_id" }] },
          updatedAt: { $ifNull: ["$updatedAt", "$$NOW"] },
        },
      },
    ];

    let cgRes, cmRes;
    try {
      cgRes = await Campground.updateMany({ createdAt: { $exists: false } }, pipeline);
      cmRes = await Comment.updateMany({ createdAt: { $exists: false } }, pipeline);
    } catch (e) {
      console.warn("Pipeline update not supported by your stack; falling back to per-doc updates…");
      // Fallback (works everywhere): set createdAt from ObjectId on each missing doc
      const now = new Date();

      const cgDocs = await Campground.find({ createdAt: { $exists: false } }).select("_id");
      for (const d of cgDocs) {
        await Campground.updateOne(
          { _id: d._id },
          { $set: { createdAt: d._id.getTimestamp(), updatedAt: now } }
        );
      }
      const cmDocs = await Comment.find({ createdAt: { $exists: false } }).select("_id");
      for (const d of cmDocs) {
        await Comment.updateOne(
          { _id: d._id },
          { $set: { createdAt: d._id.getTimestamp(), updatedAt: now } }
        );
      }
      cgRes = { modifiedCount: cgDocs.length };
      cmRes = { modifiedCount: cmDocs.length };
    }

    console.log("Campgrounds updated:", cgRes.modifiedCount);
    console.log("Comments updated:", cmRes.modifiedCount);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
