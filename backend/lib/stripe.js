import { ENV } from "./env.js";
import Stripe from "stripe";

// Initialize and export the Stripe client using the secret key from env
export const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);