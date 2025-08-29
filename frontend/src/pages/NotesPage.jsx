// NotesPage.jsx — enhanced with Image Uploads (create + edit + preview + optional removal)
import React, { useState, useEffect } from "react";
import API from "../api";
import "./NotesPage.css";

export default function NotesPage({ onLogout }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null); // NEW: file for create
  const [imagePreview, setImagePreview] = useState(null); // NEW: preview for create
  const [error, setError] = useState("");

  const [editingNote, setEditingNote] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImageFile, setEditImageFile] = useState(null); // NEW: file for edit
  const [editImagePreview, setEditImagePreview] = useState(null); // NEW: preview for edit
  const [editRemoveImage, setEditRemoveImage] = useState(false); // NEW: remove existing image

  const [searchQuery, setSearchQuery] = useState("");

  // Helpers
  const resetCreateForm = () => {
    setTitle("");
    setContent("");
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  // Fetch notes
  const fetchNotes = async () => {
    try {
      const res = await API.get("/notes");
      setNotes(res.data);
    } catch {
      setError("Failed to fetch notes. Please login again.");
    }
  };

  // Create note (multipart/form-data if image present)
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (imageFile) formData.append("image", imageFile); // BACKEND: expect field name "image"

      const res = await API.post("/notes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNotes([...notes, res.data]);
      resetCreateForm();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add note");
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
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditRemoveImage(false);
  };

  // Save edit (multipart/form-data to allow optional new image or removal)
  const handleEditSave = async (id) => {
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("content", editContent);
      if (editImageFile) {
        formData.append("image", editImageFile);
      }
      if (editRemoveImage) {
        formData.append("removeImage", "true"); // BACKEND: check this flag to clear existing image
      }

      const res = await API.put(`/notes/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNotes(notes.map((n) => (n._id === id ? res.data : n)));
      setEditingNote(null);
      setEditImageFile(null);
      if (editImagePreview) URL.revokeObjectURL(editImagePreview);
      setEditImagePreview(null);
      setEditRemoveImage(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update note");
    }
  };

  useEffect(() => {
    fetchNotes();
    // cleanup previews on unmount
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (editImagePreview) URL.revokeObjectURL(editImagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // File input handlers
  const onCreateFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      return;
    }
    // Basic guard (optional): max ~5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large. Max 5MB.");
      e.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      e.target.value = "";
      return;
    }
    setError("");
    setImageFile(file);
    const url = URL.createObjectURL(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(url);
  };

  const onEditFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setEditImageFile(null);
      if (editImagePreview) URL.revokeObjectURL(editImagePreview);
      setEditImagePreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large. Max 5MB.");
      e.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      e.target.value = "";
      return;
    }
    setError("");
    setEditImageFile(file);
    const url = URL.createObjectURL(file);
    if (editImagePreview) URL.revokeObjectURL(editImagePreview);
    setEditImagePreview(url);
    setEditRemoveImage(false); // since a new file is chosen
  };

  const renderImage = (note) => {
    const url = note.fileUrl || note.image; // backend field
    if (!url) return null;

    // prepend backend base URL
    const fullUrl = url.startsWith("http")
      ? url
      : `http://localhost:5000${url}`;

    return (
      <div className="note-image-wrapper">
        <img src={fullUrl} alt="Note" className="note-image" />
      </div>
    );
  };


  return (
    <div className="notes-container">
      <div
        className="notes-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <h2>Welcome, {localStorage.getItem("username")}</h2>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* 🔍 Search Bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", margin: "1rem 0" }}>
        <input
          type="text"
          placeholder="Search notes...🔍"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "250px", padding: "0.6rem", borderRadius: "5px", border: "1px solid #ccc" }}
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Create Note */}
      <form className="note-form" onSubmit={handleCreate} encType="multipart/form-data">
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

        {/* NEW: Image input + preview (create) */}
        <div className="note-image-input">
          <input
            type="file"
            accept="image/*"
            onChange={onCreateFileChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                className="small-btn"
                onClick={() => {
                  setImageFile(null);
                  if (imagePreview) URL.revokeObjectURL(imagePreview);
                  setImagePreview(null);
                }}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

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

              {/* EXISTING image (if any) */}
              {(note.imageUrl || note.image) && !editImagePreview && (
                <div className="image-current">
                  <img
                    src={
                      note.fileUrl?.startsWith("http")
                        ? note.fileUrl
                        : `http://localhost:5000${note.fileUrl}`
                    }
                    alt={note.title}
                    style={{
                      maxWidth: "200px",   // limit width
                      maxHeight: "200px",  // limit height
                      objectFit: "cover",  // crop nicely without distortion
                      borderRadius: "8px", // optional rounded corners
                      display: "block",
                      marginTop: "10px"
                    }}
                  />


                  <label className="checkbox-inline">
                    <input
                      type="checkbox"
                      checked={editRemoveImage}
                      onChange={(e) => setEditRemoveImage(e.target.checked)}
                    />
                    Remove current image
                  </label>
                </div>

              )}

              {/* NEW image file (edit) */}
              <div className="note-image-input">
                <input type="file" accept="image/*" onChange={onEditFileChange} />
                {editImagePreview && (
                  <div className="image-preview">
                    <img src={editImagePreview} alt="New Preview" />
                    <button
                      type="button"
                      className="small-btn"
                      onClick={() => {
                        setEditImageFile(null);
                        if (editImagePreview) URL.revokeObjectURL(editImagePreview);
                        setEditImagePreview(null);
                      }}
                    >
                      Clear New Image
                    </button>
                  </div>
                )}
              </div>

              <button onClick={() => handleEditSave(note._id)}>Save</button>
              <button onClick={() => setEditingNote(null)}>Cancel</button>
            </div>
          ) : (
            <div key={note._id} className="note-card">
              {renderImage(note)}
              <h3>{note.title}</h3>
              <p>{note.content}</p>

              <p>
                <small>Created: {new Date(note.createdAt).toLocaleString()}</small>
              </p>
              <p>
                <small>Updated: {new Date(note.updatedAt).toLocaleString()}</small>
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


