import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, TextField, Button,
  Alert, InputAdornment, IconButton, CircularProgress,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGem, faEnvelope, faLock, faEye, faEyeSlash, faUser } from "@fortawesome/free-solid-svg-icons";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

/* Shared auth layout wrapper */
const AuthLayout = ({ children, title, subtitle, linkText, linkTo, linkLabel }) => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(ellipse 50% 60% at 20% 50%, rgba(123,94,167,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 40% 50% at 80% 40%, rgba(201,168,76,0.08) 0%, transparent 60%)
        `,
      },
    }}
  >
    <Container maxWidth="sm" sx={{ position: "relative" }}>
      <Box
        sx={{
          background: "#12121A",
          border: "1px solid rgba(201,168,76,0.12)",
          borderRadius: "6px",
          p: { xs: 4, md: 6 },
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Box component={Link} to="/" sx={{ display: "inline-flex", alignItems: "center", gap: 1.2, textDecoration: "none", mb: 4 }}>
            <FontAwesomeIcon icon={faGem} style={{ fontSize: 20, color: "#C9A84C" }} />
            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.6rem", fontWeight: 600, color: "text.primary", letterSpacing: "0.1em" }}>
              LUXE
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontSize: "1.8rem", color: "text.primary", mb: 1 }}>{title}</Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>{subtitle}</Typography>
        </Box>

        {children}

        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
            {linkText}{" "}
            <Typography
              component={Link}
              to={linkTo}
              sx={{ color: "primary.main", textDecoration: "none", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
            >
              {linkLabel}
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Container>
  </Box>
);

/* FontAwesome icon adornment helper */
const FaAdornment = ({ icon }) => (
  <InputAdornment position="start">
    <FontAwesomeIcon icon={icon} style={{ fontSize: 14, color: "#4A4A60" }} />
  </InputAdornment>
);

/* ── LOGIN PAGE ── */
export function LoginPage() {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue your journey"
      linkText="Don't have an account?"
      linkTo="/signup"
      linkLabel="Create one"
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <TextField
          fullWidth label="Email Address" type="email" required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          InputProps={{ startAdornment: <FaAdornment icon={faEnvelope} /> }}
        />
        <TextField
          fullWidth label="Password" required
          type={showPw ? "text" : "password"}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          InputProps={{
            startAdornment: <FaAdornment icon={faLock} />,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small" sx={{ color: "text.disabled" }}>
                  <FontAwesomeIcon icon={showPw ? faEyeSlash : faEye} style={{ fontSize: 14 }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit" fullWidth variant="contained" size="large"
          disabled={loading}
          sx={{ mt: 1, py: 1.8 }}
          startIcon={loading ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : null}
        >
          {loading ? "Signing In…" : "Sign In"}
        </Button>
      </Box>
    </AuthLayout>
  );
}

/* ── SIGNUP PAGE ── */
export function SignupPage() {
  const { signup, loading } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    try {
      await signup(form.name, form.email, form.password);
      toast.success("Account created! Welcome to Luxe.");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 8) return { label: "Too short", color: "#E05C5C", w: "20%" };
    if (p.length < 12) return { label: "Fair", color: "#E09C3C", w: "50%" };
    if (p.length < 16) return { label: "Good", color: "#4CAF82", w: "75%" };
    return { label: "Strong", color: "#C9A84C", w: "100%" };
  })();

  const confirmMismatch = form.confirm.length > 0 && form.password !== form.confirm;

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Luxe and discover premium products"
      linkText="Already have an account?"
      linkTo="/login"
      linkLabel="Sign in"
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <TextField
          fullWidth label="Full Name" required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          InputProps={{ startAdornment: <FaAdornment icon={faUser} /> }}
        />
        <TextField
          fullWidth label="Email Address" type="email" required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          InputProps={{ startAdornment: <FaAdornment icon={faEnvelope} /> }}
        />

        {/* Password with strength meter */}
        <Box>
          <TextField
            fullWidth label="Password" required
            type={showPw ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            InputProps={{
              startAdornment: <FaAdornment icon={faLock} />,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small" sx={{ color: "text.disabled" }}>
                    <FontAwesomeIcon icon={showPw ? faEyeSlash : faEye} style={{ fontSize: 14 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {strength && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, overflow: "hidden" }}>
                <Box sx={{ height: "100%", width: strength.w, background: strength.color, transition: "width 0.35s ease, background 0.35s ease" }} />
              </Box>
              <Typography sx={{ fontSize: "0.7rem", color: strength.color, mt: 0.5 }}>{strength.label}</Typography>
            </Box>
          )}
        </Box>

        <TextField
          fullWidth label="Confirm Password" required
          type={showPw ? "text" : "password"}
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          error={confirmMismatch}
          helperText={confirmMismatch ? "Passwords don't match" : ""}
          InputProps={{ startAdornment: <FaAdornment icon={faLock} /> }}
        />

        <Typography sx={{ color: "text.disabled", fontSize: "0.74rem", lineHeight: 1.6 }}>
          Minimum 8 characters. Avoid common passwords to keep your account secure.
        </Typography>

        <Button
          type="submit" fullWidth variant="contained" size="large"
          disabled={loading}
          sx={{ mt: 1, py: 1.8 }}
          startIcon={loading ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : null}
        >
          {loading ? "Creating Account…" : "Create Account"}
        </Button>
      </Box>
    </AuthLayout>
  );
}

// Default export for LoginPage route
export default LoginPage;