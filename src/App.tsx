import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";

// Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProductView from "./pages/ProductView";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-white" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Routes */}
        <Route path="/product/:id" element={<ProductView />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={!user ? <AdminLogin /> : <Navigate to="/admin" />} />
        <Route path="/admin/*" element={user ? <AdminDashboard /> : <Navigate to="/admin/login" />} />
        
        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    </BrowserRouter>
  );
}
