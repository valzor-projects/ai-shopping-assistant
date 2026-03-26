import axios from "axios";
import { API_BASE } from "./config.js";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send cookies (access/refresh tokens)
});

export default api;
