//NotesPage.jsx
import React, { useState, useEffect } from "react";
import API from "../api";

export default function NotesPage({ onLogout }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  // Fetch notes
  const fetchNotes = async () => {
    try {
      const res = await API.get("/notes");
      setNotes(res.data);
    } catch (err) {
      setError("Failed to fetch notes. Please login again.");
    }
  };

  // Create note
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/notes", { title, content });
      setNotes([...notes, res.data]);
      setTitle("");
      setContent("");
    } catch (err) {
      setError("Failed to add note");
    }
  };

  // Delete note
  const handleDelete = async (id) => {
    try {
      await API.delete(`/notes/${id}`);
      setNotes(notes.filter((note) => note._id !== id));
    } catch (err) {
      setError("Failed to delete note");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    onLogout();
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h2>Welcome, {localStorage.getItem("username")}</h2>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form className="note-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Note Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">Add Note</button>
      </form>

      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note._id} className="note-card">
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <button className="delete-btn" onClick={() => handleDelete(note._id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

