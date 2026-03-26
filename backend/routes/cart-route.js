import express from "express";
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from "../controllers/cart-controller.js";
import { protectRoute } from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/", protectRoute, getCartProducts);          // Get all items in the cart
router.post("/", protectRoute, addToCart);               // Add a product to the cart
router.delete("/", protectRoute, removeAllFromCart);     // Remove one or all products from the cart
router.put("/:id", protectRoute, updateQuantity);        // Update the quantity of a cart item

export default router;