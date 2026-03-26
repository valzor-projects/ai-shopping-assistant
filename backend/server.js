import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";

import chatRoutes from "./routes/chat-route.js";
import authenticationRouter from "./routes/auth-route.js";
import productRoutes from "./routes/product-route.js";
import cartRoutes from "./routes/cart-route.js";
import couponRoutes from "./routes/coupon-route.js";
import paymentRoutes from "./routes/payment-route.js";
import analyticsRoutes from "./routes/analytics-route.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS — automatically allows the frontend origin (works for any hosting service)
app.use(cors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
}));

// Parse incoming JSON request bodies
app.use(express.json({ limit: "10mb" })); // limit prevents oversized payloads

// Parse cookies from incoming requests
app.use(cookieParser());

// Auth routes
app.use("/api/auth", authenticationRouter);

// Product routes
app.use("/api/products", productRoutes);

// Cart routes
app.use("/api/cart", cartRoutes);

// Coupon routes
app.use("/api/coupons", couponRoutes);

// Payment routes
app.use("/api/payments", paymentRoutes);

// Analytics routes
app.use("/api/analytics", analyticsRoutes);

// AI ChatBot
app.use("/api/chat", chatRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "API is running" });
});

// Serve the frontend in production (only if built locally — skip when frontend is a separate service)
import fs from "fs";
const frontendDist = path.join(__dirname, "/frontend/dist");
if (process.env.NODE_ENV === "production" && fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));

    // Catch-all route to serve the React app for any unmatched routes
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(frontendDist, "index.html"));
    });
}

// Start the server and connect to the database
app.listen(ENV.PORT, () => {
    console.log("Server is running on http://localhost:" + ENV.PORT);
    connectDB();
});