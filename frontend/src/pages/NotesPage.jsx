// NotesPage.jsx
import React, { useState, useEffect } from "react";
import API from "../api";
import "./NotesPage.css";

export default function NotesPage({ onLogout }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const [editingNote, setEditingNote] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch notes
  const fetchNotes = async () => {
    try {
      const res = await API.get("/notes");
      setNotes(res.data);
    } catch {
      setError("Failed to fetch notes. Please login again.");
    }
  };

  // Create note
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/notes", {
        title,
        content,
      });
      setNotes([...notes, res.data]);
      setTitle("");
      setContent("");
    } catch {
      setError("Failed to add note");
    }
  };

  // Delete note (with confirm popup)
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );
    if (!confirmDelete) return;

    try {
      await API.delete(`/notes/${id}`);
      setNotes(notes.filter((note) => note._id !== id));
    } catch {
      setError("Failed to delete note");
    }
  };

  // Edit note start
  const handleEditClick = (note) => {
    setEditingNote(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  // Save edit
  const handleEditSave = async (id) => {
    try {
      const res = await API.put(`/notes/${id}`, {
        title: editTitle,
        content: editContent,
      });
      setNotes(notes.map((n) => (n._id === id ? res.data : n)));
      setEditingNote(null);
    } catch {
      setError("Failed to update note");
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

  // 🔍 Filter notes (only title + content)
  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="notes-container">
      <div
        className="notes-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Welcome, {localStorage.getItem("username")}</h2>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* 🔍 Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "1rem 0",
        }}
      >
        <input
          type="text"
          placeholder="Search notes...🔍"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "250px",
            padding: "0.6rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Create Note */}
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

      {/* Notes List */}
      <div className="notes-grid">
        {filteredNotes.map((note) =>
          editingNote === note._id ? (
            <div key={note._id} className="note-card">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <button onClick={() => handleEditSave(note._id)}>Save</button>
              <button onClick={() => setEditingNote(null)}>Cancel</button>
            </div>
          ) : (
            <div key={note._id} className="note-card">
              <h3>{note.title}</h3>
              <p>{note.content}</p>

              <p>
                <small>
                  Created: {new Date(note.createdAt).toLocaleString()}
                </small>
              </p>
              <p>
                <small>
                  Updated: {new Date(note.updatedAt).toLocaleString()}
                </small>
              </p>
              <button onClick={() => handleEditClick(note)}>Edit</button>
              <button onClick={() => handleDelete(note._id)}>Delete</button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
