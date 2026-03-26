import express from "express";
import { protectRoute } from "../middleware/auth-middleware.js";
import { checkoutSuccess, createCheckoutSession } from "../controllers/payment-controller.js";

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession); // Initiate a Stripe checkout session
router.post("/checkout-success", protectRoute, checkoutSuccess);              // Handle successful payment and create order

export default router;