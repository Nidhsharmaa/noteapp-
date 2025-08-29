//Notes.js
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
   /* tags: [String],*/
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true } //  adds createdAt, updatedAt
);

export default mongoose.model("Note", noteSchema);

