import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

// PrivateRoute: If not logged in, redirect to /login
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

// PublicRoute: If already logged in, redirect to home
function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Protected: only accessible when logged in */}
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />

          {/* Public: only accessible when logged OUT */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
