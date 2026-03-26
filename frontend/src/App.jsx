import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, NavLink } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Box, CircularProgress } from "@mui/material";

import useAuthStore from "./store/useAuthStore";
import Navbar from "./components/Navbar";
import ChatBot from "./components/ChatBot";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import AdminPage from "./pages/AdminPage";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

const AuthRoute = ({ children }) => {
  const { user } = useAuthStore();
  return !user ? children : <Navigate to="/" replace />;
};

export default function App() {
  const { checkAuth, checkingAuth } = useAuthStore();

  useEffect(() => { checkAuth(); }, [checkAuth]);

  if (checkingAuth) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0A0A0F" }}>
        <CircularProgress sx={{ color: "#C9A84C" }} size={40} thickness={2} />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <style>{`
                @keyframes pageFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .page-enter {
                    animation: pageFadeIn 0.2s ease forwards;
                }
            `}</style>
      <Box sx={{ minHeight: "100vh", background: "#0A0A0F" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<div className="page-enter"><HomePage /></div>} />
          <Route path="/shop" element={<div className="page-enter"><ShopPage /></div>} />
          <Route path="/shop/:category" element={<div className="page-enter"><ShopPage /></div>} />
          <Route path="/product/:id" element={<div className="page-enter"><ProductPage /></div>} />
          <Route path="/login" element={<AuthRoute><div className="page-enter"><LoginPage /></div></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><div className="page-enter"><SignupPage /></div></AuthRoute>} />
          <Route path="/cart" element={<ProtectedRoute><div className="page-enter"><CartPage /></div></ProtectedRoute>} />
          <Route path="/purchase-success" element={<ProtectedRoute><div className="page-enter"><PurchaseSuccessPage /></div></ProtectedRoute>} />
          <Route path="/purchase-cancel" element={<ProtectedRoute><div className="page-enter"><PurchaseCancelPage /></div></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><div className="page-enter"><AdminPage /></div></AdminRoute>} />
        </Routes>
        <ChatBot />
      </Box>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1A1A26",
            color: "#F0ECE3",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "2px",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.875rem",
          },
          success: { iconTheme: { primary: "#C9A84C", secondary: "#0A0A0F" } },
          error: { iconTheme: { primary: "#E05C5C", secondary: "#F0ECE3" } },
        }}
      />
    </BrowserRouter>
  );
}