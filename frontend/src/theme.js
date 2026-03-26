import { createTheme } from "@mui/material/styles";

// ─── Palette tokens (shared base) ─────────────────────────────────────────────
const darkPalette = {
  primary: {
    main: "#C9A84C",
    light: "#E4C97E",
    dark: "#9C7A28",
    contrastText: "#0A0A0F",
  },
  secondary: {
    main: "#7B5EA7",
    light: "#A07FCC",
    dark: "#5A3F80",
    contrastText: "#FFFFFF",
  },
  background: {
    default: "#0A0A0F",
    paper: "#12121A",
  },
  text: {
    primary: "#F0ECE3",
    secondary: "#9A9BAD",
    disabled: "#4A4A60",
  },
  divider: "rgba(201,168,76,0.12)",
  error: { main: "#E05C5C" },
  success: { main: "#4CAF82" },
  warning: { main: "#E09C3C" },
  info: { main: "#4C8AE0" },
};

// ─── Typography ───────────────────────────────────────────────────────────────
const typography = {
  fontFamily: '"DM Sans", sans-serif',
  h1: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, letterSpacing: "-0.02em" },
  h2: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, letterSpacing: "-0.015em" },
  h3: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, letterSpacing: "-0.01em" },
  h4: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500 },
  h5: { fontWeight: 500 },
  h6: { fontWeight: 500 },
  subtitle1: { letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.75rem", fontWeight: 600 },
  button: { fontWeight: 600, letterSpacing: "0.06em" },
};

// ─── Component Overrides ──────────────────────────────────────────────────────
const components = {
  MuiCssBaseline: {
    styleOverrides: {
      // CRITICAL: Set dark background on root IMMEDIATELY before any paint
      ":root": {
        backgroundColor: "#0A0A0F !important",
        colorScheme: "dark",
      },
      "html, body, #root": {
        backgroundColor: "#0A0A0F !important",
        margin: 0,
        padding: 0,
        minHeight: "100%",
      },
      "*": { boxSizing: "border-box" },
      "html, body": { scrollBehavior: "smooth" },
      "::-webkit-scrollbar": { width: "6px" },
      "::-webkit-scrollbar-track": { background: "#0A0A0F" },
      "::-webkit-scrollbar-thumb": { background: "#C9A84C40", borderRadius: "3px" },
      "::-webkit-scrollbar-thumb:hover": { background: "#C9A84C80" },
      "::selection": { background: "#C9A84C40", color: "#F0ECE3" },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: "2px",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontSize: "0.75rem",
        padding: "10px 24px",
        transition: "all 0.25s ease",
      },
      contained: {
        background: "linear-gradient(135deg, #C9A84C 0%, #E4C97E 50%, #C9A84C 100%)",
        backgroundSize: "200% 100%",
        color: "#0A0A0F",
        fontWeight: 700,
        boxShadow: "0 4px 20px rgba(201,168,76,0.25)",
        "&:hover": {
          backgroundPosition: "right center",
          boxShadow: "0 6px 30px rgba(201,168,76,0.4)",
          transform: "translateY(-1px)",
        },
        "&:active": { transform: "translateY(0)" },
      },
      outlined: {
        borderColor: "#C9A84C60",
        color: "#C9A84C",
        "&:hover": {
          borderColor: "#C9A84C",
          background: "rgba(201,168,76,0.06)",
          boxShadow: "0 0 20px rgba(201,168,76,0.15)",
        },
      },
      text: {
        color: "#C9A84C",
        "&:hover": { background: "rgba(201,168,76,0.08)" },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        background: "#1A1A26",
        border: "1px solid rgba(201,168,76,0.08)",
        borderRadius: "4px",
        transition: "all 0.3s ease",
        "&:hover": {
          border: "1px solid rgba(201,168,76,0.25)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.1)",
          transform: "translateY(-3px)",
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: "2px",
          "& fieldset": { borderColor: "rgba(201,168,76,0.2)" },
          "&:hover fieldset": { borderColor: "rgba(201,168,76,0.5)" },
          "&.Mui-focused fieldset": { borderColor: "#C9A84C" },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: "#C9A84C" },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        background: "rgba(10,10,15,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(201,168,76,0.1)",
        boxShadow: "none",
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: "2px",
        fontWeight: 600,
        letterSpacing: "0.05em",
        fontSize: "0.7rem",
        textTransform: "uppercase",
      },
    },
  },
  MuiDivider: {
    styleOverrides: { root: { borderColor: "rgba(201,168,76,0.12)" } },
  },
  MuiBadge: {
    styleOverrides: {
      badge: { background: "#C9A84C", color: "#0A0A0F", fontWeight: 700, fontSize: "0.65rem" },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        background: "#22222F",
        border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: "2px",
        fontSize: "0.75rem",
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        background: "#1A1A26",
        border: "1px solid rgba(201,168,76,0.15)",
        borderRadius: "4px",
        backdropFilter: "blur(20px)",
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        fontSize: "0.875rem",
        "&:hover": { background: "rgba(201,168,76,0.08)" },
        "&.Mui-selected": {
          background: "rgba(201,168,76,0.12)",
          "&:hover": { background: "rgba(201,168,76,0.16)" },
        },
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: { borderRadius: "2px", background: "rgba(201,168,76,0.1)" },
      bar: { background: "linear-gradient(90deg, #C9A84C, #E4C97E)" },
    },
  },
  MuiAlert: {
    styleOverrides: { root: { borderRadius: "2px", border: "1px solid" } },
  },
  MuiSkeleton: {
    styleOverrides: {
      root: {
        backgroundColor: "#1A1A26",
        "&::after": {
          background:
            "linear-gradient(90deg, transparent, rgba(201,168,76,0.06), transparent)",
        },
      },
    },
  },
};

// ─── Theme ────────────────────────────────────────────────────────────────────
// Using MUI v7's cssVariables + colorSchemes API with dark-only mode
const theme = createTheme({
  // Enable CSS variables - critical for preventing flicker
  cssVariables: true,

  // Declare dark as the only color scheme
  colorSchemes: {
    dark: {
      palette: darkPalette,
    },
  },

  // Set default mode to dark (important!)
  defaultColorScheme: 'dark',

  typography,
  components,
  shape: { borderRadius: 4 },
});

export default theme;