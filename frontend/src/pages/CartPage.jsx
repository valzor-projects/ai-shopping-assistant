import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Grid, Button, TextField,
  IconButton, Divider, Chip, Paper, Alert,
  Table, TableBody, TableCell, TableRow, CircularProgress,
  InputAdornment,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBagShopping, faTag, faArrowLeft, faCircleCheck,
  faTrash, faPlus, faMinus, faLock,
} from "@fortawesome/free-solid-svg-icons";
import useCartStore from "../store/useCartStore";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function CartPage() {
  const {
    cart, fetchCart, updateQuantity, removeFromCart,
    coupon, isCouponApplied, applyCoupon, removeCoupon,
    total, subtotal, clearCart,
  } = useCartStore();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(couponCode.trim().toUpperCase());
    setApplyingCoupon(false);
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await api.post("/payments/create-checkout-session", {
        products: cart,
        couponCode: coupon?.code || null,
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        window.location.href = `https://checkout.stripe.com/c/pay/${res.data.id}`;
      }
    } catch {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 14, textAlign: "center" }}>
        <Box sx={{ mb: 3 }}>
          <FontAwesomeIcon icon={faBagShopping} style={{ fontSize: 72, color: "#2A2A3A" }} />
        </Box>
        <Typography variant="h3" sx={{ color: "text.primary", mb: 2, fontSize: "2.2rem" }}>Your cart is empty</Typography>
        <Typography sx={{ color: "text.secondary", mb: 6 }}>
          Discover our collection and add something extraordinary.
        </Typography>
        <Button
          component={Link} to="/shop" variant="contained" size="large"
          startIcon={<FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 13 }} />}
        >
          Browse Collection
        </Button>
      </Container>
    );
  }

  const savings = subtotal - total;
  const shipping = subtotal >= 200 ? 0 : 15;

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, minHeight: "100vh" }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 5 }}>
          <Button
            component={Link} to="/shop"
            startIcon={<FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 12 }} />}
            variant="text" sx={{ mb: 2, fontSize: "0.75rem" }}
          >
            Continue Shopping
          </Button>
          <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.6rem" }, color: "text.primary" }}>
            Your Cart
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {cart.reduce((s, i) => s + i.quantity, 0)} items
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={0} sx={{ background: "#12121A", border: "1px solid rgba(201,168,76,0.08)", borderRadius: "6px", overflow: "hidden" }}>
              {cart.map((item, idx) => (
                <Box key={`${item._id}-${item.selectedSize || "no-size"}`}>
                  <Box sx={{ display: "flex", gap: { xs: 2, sm: 3 }, p: { xs: 2, sm: 3 }, alignItems: "center" }}>
                    <Box
                      component="img"
                      src={item.image || `https://placehold.co/100x100/1A1A26/C9A84C?text=${encodeURIComponent(item.name)}`}
                      alt={item.name}
                      sx={{ width: { xs: 70, sm: 90 }, height: { xs: 70, sm: 90 }, objectFit: "cover", borderRadius: "4px", border: "1px solid rgba(201,168,76,0.1)", flexShrink: 0 }}
                    />

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        component={Link}
                        to={`/product/${item._id}`}
                        sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: { xs: "1rem", sm: "1.1rem" }, fontWeight: 500, color: "text.primary", textDecoration: "none", display: "block", mb: 0.3, "&:hover": { color: "primary.main" } }}
                      >
                        {item.name}
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", mb: item.selectedSize ? 0.6 : 0 }}>
                        {item.category}
                      </Typography>
                      {item.selectedSize && (
                        <Box sx={{ display: "inline-flex", alignItems: "center", mt: 0.4 }}>
                          <Box sx={{
                            px: 1.2, py: 0.25,
                            border: "1px solid rgba(201,168,76,0.35)",
                            borderRadius: "3px",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            color: "primary.main",
                            letterSpacing: "0.06em",
                            background: "rgba(201,168,76,0.08)",
                          }}>
                            Size: {item.selectedSize}
                          </Box>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "3px", overflow: "hidden", flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item._id, item.quantity - 1, item.selectedSize)}
                        sx={{ borderRadius: 0, color: "text.secondary", "&:hover": { color: "primary.main", background: "rgba(201,168,76,0.06)" }, px: 1.2, py: 0.9 }}
                      >
                        <FontAwesomeIcon icon={faMinus} style={{ fontSize: 11 }} />
                      </IconButton>
                      <Typography sx={{ px: 2, fontSize: "0.88rem", fontWeight: 600, color: "text.primary", minWidth: 28, textAlign: "center" }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item._id, item.quantity + 1, item.selectedSize)}
                        sx={{ borderRadius: 0, color: "text.secondary", "&:hover": { color: "primary.main", background: "rgba(201,168,76,0.06)" }, px: 1.2, py: 0.9 }}
                      >
                        <FontAwesomeIcon icon={faPlus} style={{ fontSize: 11 }} />
                      </IconButton>
                    </Box>

                    <Box sx={{ textAlign: "right", minWidth: 70, flexShrink: 0 }}>
                      <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.15rem", fontWeight: 600, color: "primary.main" }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                        ${item.price.toFixed(2)} ea.
                      </Typography>
                    </Box>

                    <IconButton
                      onClick={() => removeFromCart(item._id, item.selectedSize)}
                      size="small"
                      sx={{ color: "text.disabled", "&:hover": { color: "error.main" }, flexShrink: 0 }}
                    >
                      <FontAwesomeIcon icon={faTrash} style={{ fontSize: 13 }} />
                    </IconButton>
                  </Box>
                  {idx < cart.length - 1 && <Divider />}
                </Box>
              ))}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ background: "#12121A", border: "1px solid rgba(201,168,76,0.08)", borderRadius: "6px", p: 3, position: "sticky", top: 90 }}>
              <Typography variant="h5" sx={{ color: "text.primary", mb: 3.5, fontFamily: '"Cormorant Garamond", serif', fontSize: "1.5rem" }}>
                Order Summary
              </Typography>

              <Table size="small" sx={{ mb: 2.5 }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ border: "none", pl: 0, color: "text.secondary", fontSize: "0.85rem" }}>Subtotal</TableCell>
                    <TableCell align="right" sx={{ border: "none", pr: 0, color: "text.primary", fontWeight: 600 }}>
                      ${subtotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  {isCouponApplied && savings > 0 && (
                    <TableRow>
                      <TableCell sx={{ border: "none", pl: 0, color: "success.main", fontSize: "0.85rem" }}>
                        Coupon ({coupon.discountPercentage}% off)
                      </TableCell>
                      <TableCell align="right" sx={{ border: "none", pr: 0, color: "success.main", fontWeight: 600 }}>
                        −${savings.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell sx={{ border: "none", pl: 0, color: "text.secondary", fontSize: "0.85rem" }}>Shipping</TableCell>
                    <TableCell align="right" sx={{ border: "none", pr: 0, fontWeight: 600, color: shipping === 0 ? "success.main" : "text.primary" }}>
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Divider sx={{ mb: 2.5 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>Total</Typography>
                <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.6rem", fontWeight: 700, color: "primary.main" }}>
                  ${(total + shipping).toFixed(2)}
                </Typography>
              </Box>

              {!isCouponApplied ? (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FontAwesomeIcon icon={faTag} style={{ fontSize: 13, color: "#4A4A60" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant="outlined" size="small"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode}
                      sx={{ px: 2, whiteSpace: "nowrap" }}
                    >
                      {applyingCoupon ? <CircularProgress size={13} sx={{ color: "primary.main" }} /> : "Apply"}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ mb: 3 }}>
                  <Chip
                    icon={<FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 13, color: "#4CAF82", marginLeft: 8 }} />}
                    label={`${coupon.code} — ${coupon.discountPercentage}% off`}
                    onDelete={removeCoupon}
                    sx={{ background: "rgba(76,175,130,0.1)", color: "success.main", border: "1px solid rgba(76,175,130,0.3)" }}
                  />
                </Box>
              )}

              {shipping > 0 && (
                <Alert severity="info" sx={{ mb: 3, fontSize: "0.78rem" }}>
                  Add ${(200 - subtotal).toFixed(2)} more for free shipping!
                </Alert>
              )}

              <Button
                fullWidth variant="contained" size="large"
                onClick={handleCheckout}
                disabled={checkoutLoading}
                sx={{ py: 1.8 }}
                startIcon={checkoutLoading
                  ? <CircularProgress size={15} sx={{ color: "inherit" }} />
                  : <FontAwesomeIcon icon={faBagShopping} style={{ fontSize: 14 }} />
                }
              >
                {checkoutLoading ? "Processing…" : "Proceed to Checkout"}
              </Button>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mt: 2 }}>
                <FontAwesomeIcon icon={faLock} style={{ fontSize: 10, color: "#4A4A60" }} />
                <Typography sx={{ color: "text.disabled", fontSize: "0.72rem" }}>
                  Secured by Stripe · SSL Encrypted
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}