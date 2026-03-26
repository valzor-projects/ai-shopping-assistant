import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Box, Container, Typography, Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleXmark, faArrowRight, faHouse } from "@fortawesome/free-solid-svg-icons";
import api from "../api/axios";
import useCartStore from "../store/useCartStore";

export function PurchaseSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCartStore();

  useEffect(() => {
    if (sessionId) {
      api.post("/payments/checkout-success", { sessionId })
        .then(() => clearCart())
        .catch(() => {});
    }
  }, [sessionId]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(76,175,130,0.07) 0%, transparent 70%)",
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative" }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(76,175,130,0.1)",
            border: "1px solid rgba(76,175,130,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 4,
          }}
        >
          <FontAwesomeIcon icon={faCircleCheck} style={{fontSize:52,color:"#4CAF82"}} />
        </Box>
        <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, color: "text.primary", mb: 2 }}>
          Order Confirmed
        </Typography>
        <Typography sx={{ color: "text.secondary", lineHeight: 1.8, mb: 5, fontSize: "1rem" }}>
          Thank you for your purchase. Your order has been placed and will be processed shortly. You'll receive a confirmation email soon.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
          <Button component={Link} to="/" variant="contained" size="large" startIcon={<FontAwesomeIcon icon={faHouse} style={{fontSize:13}} />} sx={{ px: 4 }}>
            Back to Home
          </Button>
          <Button component={Link} to="/shop" variant="outlined" size="large" endIcon={<FontAwesomeIcon icon={faArrowRight} style={{fontSize:12}} />} sx={{ px: 4 }}>
            Continue Shopping
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export function PurchaseCancelPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(224,92,92,0.06) 0%, transparent 70%)",
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative" }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(224,92,92,0.1)",
            border: "1px solid rgba(224,92,92,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 4,
          }}
        >
          <FontAwesomeIcon icon={faCircleXmark} style={{fontSize:52,color:"#E05C5C"}} />
        </Box>
        <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, color: "text.primary", mb: 2 }}>
          Payment Cancelled
        </Typography>
        <Typography sx={{ color: "text.secondary", lineHeight: 1.8, mb: 5 }}>
          Your order was not completed. No charges were made. Your cart is still saved.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
          <Button component={Link} to="/cart" variant="contained" size="large" sx={{ px: 4 }}>
            Return to Cart
          </Button>
          <Button component={Link} to="/shop" variant="outlined" size="large" endIcon={<FontAwesomeIcon icon={faArrowRight} style={{fontSize:12}} />} sx={{ px: 4 }}>
            Continue Shopping
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default PurchaseSuccessPage;
