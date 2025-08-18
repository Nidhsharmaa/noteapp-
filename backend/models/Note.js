//Notes.js
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // link notes to a user
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
