import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // State
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");

  // ── READ: Fetch contacts from Firestore ──────────────────────────────────
  async function fetchContacts() {
    setLoading(true);
    try {
      const q = query(
        collection(db, "contacts"),
        where("userId", "==", currentUser.uid)  // Only this user's contacts
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort alphabetically on the client side (no Firestore index needed)
      data.sort((a, b) => a.name.localeCompare(b.name));
      setContacts(data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchContacts();
  }, []);

  // ── CREATE: Add a new contact ────────────────────────────────────────────
  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await addDoc(collection(db, "contacts"), {
        ...formData,
        userId: currentUser.uid, // Tag contact with the logged-in user's ID
        createdAt: new Date(),
      });
      resetForm();
      fetchContacts(); // Refresh the list
    } catch (err) {
      setError("Failed to add contact.");
    }
  }

  // ── UPDATE: Edit an existing contact ─────────────────────────────────────
  async function handleUpdate(e) {
    e.preventDefault();
    setError("");
    try {
      const contactRef = doc(db, "contacts", editingContact.id);
      await updateDoc(contactRef, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      resetForm();
      fetchContacts(); // Refresh the list
    } catch (err) {
      setError("Failed to update contact.");
    }
  }

  // ── DELETE: Remove a contact ─────────────────────────────────────────────
  async function handleDelete(contactId) {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await deleteDoc(doc(db, "contacts", contactId));
      fetchContacts(); // Refresh the list
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function openEditForm(contact) {
    setEditingContact(contact);
    setFormData({ name: contact.name, email: contact.email, phone: contact.phone });
    setShowForm(true);
  }

  function resetForm() {
    setShowForm(false);
    setEditingContact(null);
    setFormData({ name: "", email: "", phone: "" });
    setError("");
  }

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="home-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-brand">📒 Contact Book</div>
        <div className="navbar-right">
          <span className="user-email">{currentUser.email}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="main-content">
        <div className="page-header">
          <h1>My Contacts <span className="contact-count">{contacts.length}</span></h1>
          <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            + Add Contact
          </button>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="form-overlay" onClick={resetForm}>
            <div className="contact-form-card" onClick={(e) => e.stopPropagation()}>
              <h2>{editingContact ? "Edit Contact" : "New Contact"}</h2>
              {error && <div className="error-msg">{error}</div>}
              <form onSubmit={editingContact ? handleUpdate : handleAdd} className="auth-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                  <button type="submit" className="btn-primary">
                    {editingContact ? "Save Changes" : "Add Contact"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Contacts List */}
        {loading ? (
          <div className="loading-state">Loading your contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <p>No contacts yet. Add your first one!</p>
          </div>
        ) : (
          <div className="contacts-grid">
            {contacts.map((contact) => (
              <div key={contact.id} className="contact-card">
                <div className="contact-avatar">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="contact-info">
                  <h3>{contact.name}</h3>
                  <p>✉️ {contact.email}</p>
                  <p>📞 {contact.phone}</p>
                </div>
                <div className="contact-actions">
                  <button className="btn-edit" onClick={() => openEditForm(contact)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(contact.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
