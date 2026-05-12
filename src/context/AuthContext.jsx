import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

// 1. Create the context
const AuthContext = createContext();

// 2. Create a custom hook for easy access
export function useAuth() {
  return useContext(AuthContext);
}

// 3. Create the Provider component that wraps the whole app
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged listens for login/logout events automatically
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // user is null if logged out
      setLoading(false);
    });

    // Cleanup the listener when component unmounts
    return unsubscribe;
  }, []);

  const value = { currentUser };

  // Don't render children until Firebase has checked auth state
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
