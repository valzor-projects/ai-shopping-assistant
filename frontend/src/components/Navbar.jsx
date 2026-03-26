import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar, Toolbar, Box, Typography, IconButton, Badge,
  Button, Menu, MenuItem, Divider, Drawer, List, ListItem,
  ListItemText, useScrollTrigger, Slide, Avatar,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBagShopping, faGem, faBars, faXmark,
  faRightFromBracket, faUserShield,
  faMicrochip, faShirt, faBriefcase, faRing, faCouch, faSprayCan,
} from "@fortawesome/free-solid-svg-icons";
import useAuthStore from "../store/useAuthStore";
import useCartStore from "../store/useCartStore";

const CATEGORIES = [
  { label: "Electronics", icon: faMicrochip, path: "electronics" },
  { label: "Clothing", icon: faShirt, path: "clothing" },
  { label: "Accessories", icon: faBriefcase, path: "accessories" },
  { label: "Jewelry", icon: faRing, path: "jewelry" },
  { label: "Homes", icon: faCouch, path: "home" },
  { label: "Fragrance", icon: faSprayCan, path: "fragrance" },
];

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return <Slide appear={false} direction="down" in={!trigger}>{children}</Slide>;
}

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { cart } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate("/");
  };

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const navLinkSx = (path) => ({
    color: isActive(path) ? "primary.main" : "text.secondary",
    fontSize: "0.68rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontWeight: 600,
    position: "relative",
    px: 1,
    py: 0.5,
    minWidth: 0,
    transition: "color 0.2s",
    "&:hover": { color: "primary.main" },
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: -2,
      left: "50%",
      transform: isActive(path) ? "translateX(-50%) scaleX(1)" : "translateX(-50%) scaleX(0)",
      width: "calc(100% - 16px)",
      height: "1px",
      background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
      transition: "transform 0.3s ease",
    },
    "&:hover::after": { transform: "translateX(-50%) scaleX(1)" },
  });

  return (
    <>
      <HideOnScroll>
        <AppBar position="fixed" elevation={0}>
          <Toolbar sx={{ px: { xs: 2, md: 4 }, minHeight: { xs: 64, md: 72 } }}>

            <IconButton
              sx={{ display: { md: "none" }, color: "text.secondary", mr: 1 }}
              onClick={() => setDrawerOpen(true)}
            >
              <FontAwesomeIcon icon={faBars} style={{ fontSize: 18 }} />
            </IconButton>

            <Box
              component={Link}
              to="/"
              sx={{ display: "flex", alignItems: "center", gap: 1, textDecoration: "none", mr: { md: 3 } }}
            >
              <FontAwesomeIcon icon={faGem} style={{ fontSize: 18, color: "#C9A84C" }} />
              <Typography
                sx={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: { xs: "1.4rem", md: "1.55rem" },
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "text.primary",
                  lineHeight: 1,
                }}
              >
                LUXE
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0, flex: 1 }}>
              <Button component={Link} to="/" sx={navLinkSx("/")}>Home</Button>
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.path}
                  component={Link}
                  to={`/shop/${cat.path}`}
                  sx={navLinkSx(`/shop/${cat.path}`)}
                >
                  {cat.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto" }}>
              {user && (
                <IconButton
                  component={Link}
                  to="/cart"
                  sx={{
                    color: isActive("/cart") ? "primary.main" : "text.secondary",
                    transition: "color 0.2s",
                    "&:hover": { color: "primary.main" },
                    position: "relative",
                  }}
                >
                  <Badge badgeContent={cartCount} max={99}>
                    <FontAwesomeIcon icon={faBagShopping} style={{ fontSize: 17 }} />
                  </Badge>
                </IconButton>
              )}

              {user ? (
                <>
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }}>
                    <Avatar
                      sx={{
                        width: 32, height: 32, fontSize: "0.82rem", fontWeight: 700,
                        background: "linear-gradient(135deg, #C9A84C 0%, #7B5EA7 100%)",
                        color: "#0A0A0F",
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    sx={{ mt: 1 }}
                  >
                    <Box sx={{ px: 2.5, py: 1.8 }}>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary" }}>{user.name}</Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{user.email}</Typography>
                    </Box>
                    <Divider />

                    {user.role === "admin" && (
                      <MenuItem onClick={() => { setAnchorEl(null); navigate("/admin"); }} sx={{ gap: 2, py: 1.3 }}>
                        <FontAwesomeIcon icon={faUserShield} style={{ fontSize: 13, color: "#C9A84C" }} />
                        <Typography variant="body2">Admin Dashboard</Typography>
                      </MenuItem>
                    )}

                    <MenuItem onClick={handleLogout} sx={{ gap: 2, py: 1.3, color: "error.main" }}>
                      <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 13, color: "#E05C5C" }} />
                      <Typography variant="body2" sx={{ color: "error.main" }}>Sign Out</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: "flex", gap: 1, ml: 1 }}>
                  <Button component={Link} to="/login" variant="outlined" size="small" sx={{ display: { xs: "none", sm: "flex" } }}>
                    Sign In
                  </Button>
                  <Button component={Link} to="/signup" variant="contained" size="small">
                    Join
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Toolbar sx={{ minHeight: { xs: 64, md: 72 } }} />

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 288, background: "#10101A", borderRight: "1px solid rgba(201,168,76,0.1)" } }}
      >
        <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <FontAwesomeIcon icon={faGem} style={{ fontSize: 17, color: "#C9A84C" }} />
              <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.4rem", fontWeight: 600, color: "text.primary", letterSpacing: "0.1em" }}>
                LUXE
              </Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)} size="small" sx={{ color: "text.secondary" }}>
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <List disablePadding sx={{ flex: 1 }}>
            <ListItem
              component={Link}
              to="/"
              onClick={() => setDrawerOpen(false)}
              sx={{
                py: 1.5, px: 0,
                borderBottom: "1px solid rgba(201,168,76,0.06)",
                textDecoration: "none",
                "&:hover .drawer-label": { color: "primary.main" },
              }}
            >
              <ListItemText
                primary="Home"
                primaryTypographyProps={{ className: "drawer-label", sx: { fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, color: "text.primary", transition: "color 0.2s" } }}
              />
            </ListItem>

            <Typography sx={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "primary.main", mt: 3.5, mb: 1.5, fontWeight: 600 }}>
              Categories
            </Typography>
            {CATEGORIES.map((cat) => (
              <ListItem
                key={cat.path}
                component={Link}
                to={`/shop/${cat.path}`}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  py: 1.3, px: 0,
                  borderBottom: "1px solid rgba(201,168,76,0.05)",
                  textDecoration: "none",
                  display: "flex", gap: 2, alignItems: "center",
                }}
              >
                <FontAwesomeIcon icon={cat.icon} style={{ fontSize: 13, color: "#C9A84C", opacity: 0.7, width: 16 }} />
                <ListItemText
                  primary={cat.label}
                  primaryTypographyProps={{ sx: { fontSize: "0.78rem", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, color: "text.secondary" } }}
                />
              </ListItem>
            ))}
          </List>

          {!user && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 4 }}>
              <Button fullWidth variant="contained" component={Link} to="/signup" onClick={() => setDrawerOpen(false)}>
                Create Account
              </Button>
              <Button fullWidth variant="outlined" component={Link} to="/login" onClick={() => setDrawerOpen(false)}>
                Sign In
              </Button>
            </Box>
          )}

          {user && (
            <Box sx={{ pt: 3, mt: 3, borderTop: "1px solid rgba(201,168,76,0.1)" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Avatar sx={{ width: 32, height: 32, fontSize: "0.82rem", background: "linear-gradient(135deg, #C9A84C, #7B5EA7)", color: "#0A0A0F" }}>
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.primary" }}>{user.name}</Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>{user.role}</Typography>
                </Box>
              </Box>
              <Button
                fullWidth variant="text" size="small"
                startIcon={<FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 12 }} />}
                onClick={() => { setDrawerOpen(false); handleLogout(); }}
                sx={{ color: "error.main", justifyContent: "flex-start" }}
              >
                Sign Out
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}