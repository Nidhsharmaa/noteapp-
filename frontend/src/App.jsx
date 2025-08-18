//App.jsx
import React, { useState } from "react";
import LoginPage from "./pages/LoginPage";
import NotesPage from "./pages/NotesPage";
import "./styles.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="app-container">
      {isLoggedIn ? (
        <NotesPage onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}
