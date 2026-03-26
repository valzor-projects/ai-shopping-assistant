import { useState, useRef, useEffect } from "react";
import {
    Box, IconButton, Typography, TextField, Paper, Avatar,
    CircularProgress, Fade, Chip, Grid, Table, TableBody,
    TableCell, TableHead, TableRow, Button,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComments, faXmark, faPaperPlane, faRobot, faBagShopping,
} from "@fortawesome/free-solid-svg-icons";
import ProductCard from "./ProductCard";
import useCartStore from "../store/useCartStore";
import toast from "react-hot-toast";

const WELCOME_MESSAGE = {
    id: "welcome",
    role: "assistant",
    text: "Welcome to LUXE! I'm your personal shopping assistant. Ask me about products, and I'll help you find exactly what you're looking for.",
    products: [],
    cartProducts: [],
    compareProducts: [],
    streaming: false,
    timestamp: new Date(),
};

const SUGGESTED_QUERIES = [
    "Show me featured jewelry",
    "Find electronics under $500",
    "What fragrances do you have?",
    "Recommend clothing for men",
];

const getOrCreateSessionId = () => {
    let id = sessionStorage.getItem("chatSessionId");
    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem("chatSessionId", id);
    }
    return id;
};

function ComparisonTable({ products }) {
    if (!products || products.length !== 2) return null;
    const [a, b] = products;

    const rows = [
        { label: "Price", va: `$${a.price?.toFixed(2)}`, vb: `$${b.price?.toFixed(2)}` },
        { label: "Category", va: a.category, vb: b.category },
        {
            label: "Sizes",
            va: a.sizes?.length > 0 ? a.sizes.join(", ") : a.shoeSizes?.join(", ") || "—",
            vb: b.sizes?.length > 0 ? b.sizes.join(", ") : b.shoeSizes?.join(", ") || "—",
        },
        { label: "Featured", va: a.isFeatured ? "✓ Yes" : "No", vb: b.isFeatured ? "✓ Yes" : "No" },
    ];

    return (
        <Box sx={{ mt: 2, ml: 4.5, border: "1px solid rgba(201,168,76,0.18)", borderRadius: "8px", overflow: "hidden" }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ background: "rgba(201,168,76,0.08)" }}>
                        <TableCell sx={{ color: "text.disabled", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", py: 1.2, width: "28%" }}>
                            FEATURE
                        </TableCell>
                        <TableCell sx={{ color: "primary.main", fontSize: "0.72rem", fontWeight: 600, py: 1.2 }}>
                            {a.name}
                        </TableCell>
                        <TableCell sx={{ color: "#A07FCC", fontSize: "0.72rem", fontWeight: 600, py: 1.2 }}>
                            {b.name}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.label} sx={{ "&:last-child td": { borderBottom: 0 }, "&:hover": { background: "rgba(255,255,255,0.02)" } }}>
                            <TableCell sx={{ color: "text.disabled", fontSize: "0.68rem", py: 1, fontWeight: 600 }}>{row.label}</TableCell>
                            <TableCell sx={{ color: "text.primary", fontSize: "0.72rem", py: 1 }}>{row.va}</TableCell>
                            <TableCell sx={{ color: "text.primary", fontSize: "0.72rem", py: 1 }}>{row.vb}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Box sx={{ display: "flex", gap: 1, p: 1.5, borderTop: "1px solid rgba(201,168,76,0.1)", background: "rgba(0,0,0,0.15)" }}>
                <Typography sx={{ fontSize: "0.65rem", color: "text.disabled", alignSelf: "center", mr: "auto" }}>
                    Click a product card below to view full details
                </Typography>
            </Box>
        </Box>
    );
}

function CartBanner({ products, onAdd }) {
    if (!products || products.length === 0) return null;

    return (
        <Box sx={{ mt: 1.5, ml: 4.5, p: 1.5, border: "1px solid rgba(201,168,76,0.25)", borderRadius: "8px", background: "rgba(201,168,76,0.05)" }}>
            <Typography sx={{ fontSize: "0.72rem", color: "text.disabled", mb: 1, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
                Add to Cart
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                {products.map((product) => (
                    <Box key={product._id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <span style={{ color: "#C9A84C", fontWeight: 600 }}>{product.name}</span>
                            {" "}— ${product.price?.toFixed(2)}
                        </Typography>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => onAdd(product)}
                            startIcon={<FontAwesomeIcon icon={faBagShopping} style={{ fontSize: 9 }} />}
                            sx={{ fontSize: "0.65rem", py: 0.35, px: 1.2, flexShrink: 0, minWidth: 0 }}
                        >
                            Add
                        </Button>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([WELCOME_MESSAGE]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const sessionId = useRef(getOrCreateSessionId());
    const { addToCart } = useCartStore();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 200);
    }, [open]);

    const handleCartAdd = (product) => {
        addToCart(product, null);
        toast.success(`${product.name} added to cart`);
    };

    const sendMessage = async (text) => {
        const messageText = (text || input).trim();
        if (!messageText || loading) return;

        const userMsg = {
            id: Date.now().toString(),
            role: "user",
            text: messageText,
            products: [],
            cartProducts: [],
            compareProducts: [],
            streaming: false,
            timestamp: new Date(),
        };

        const streamId = (Date.now() + 1).toString();
        const streamingMsg = {
            id: streamId,
            role: "assistant",
            text: "",
            products: [],
            cartProducts: [],
            compareProducts: [],
            streaming: true,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg, streamingMsg]);
        setInput("");
        setLoading(true);

        try {
            const { API_BASE } = await import("../api/config.js");
            const response = await fetch(`${API_BASE}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ message: messageText, sessionId: sessionId.current }),
            });

            if (!response.ok) throw new Error("Request failed");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let lastEvent = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith("event: ")) {
                        lastEvent = line.slice(7).trim();
                    } else if (line.startsWith("data: ")) {
                        const raw = line.slice(6);
                        try {
                            const parsed = JSON.parse(raw);

                            if (lastEvent === "token") {
                                setMessages((prev) =>
                                    prev.map((m) =>
                                        m.id === streamId ? { ...m, text: m.text + parsed } : m
                                    )
                                );
                            } else if (lastEvent === "done") {
                                setMessages((prev) =>
                                    prev.map((m) =>
                                        m.id === streamId
                                            ? {
                                                ...m,
                                                streaming: false,
                                                products: parsed.products || [],
                                                cartProducts: parsed.cartProducts || [],
                                                compareProducts: parsed.compareProducts || [],
                                            }
                                            : m
                                    )
                                );
                            } else if (lastEvent === "error") {
                                setMessages((prev) =>
                                    prev.map((m) =>
                                        m.id === streamId
                                            ? { ...m, text: parsed.message, streaming: false }
                                            : m
                                    )
                                );
                            }
                        } catch {
                        }
                        lastEvent = "";
                    }
                }
            }
        } catch {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === streamId
                        ? { ...m, text: "Sorry, I'm having trouble right now. Please try again in a moment.", streaming: false }
                        : m
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            <Fade in={!open}>
                <IconButton
                    onClick={() => setOpen(true)}
                    sx={{
                        position: "fixed", bottom: 28, right: 28, zIndex: 1300,
                        width: 56, height: 56,
                        background: "linear-gradient(135deg, #C9A84C 0%, #7B5EA7 100%)",
                        color: "#0A0A0F",
                        boxShadow: "0 4px 24px rgba(201,168,76,0.35)",
                        "&:hover": { background: "linear-gradient(135deg, #E4C97E 0%, #9B7ED4 100%)", transform: "scale(1.08)" },
                        transition: "all 0.25s ease",
                        display: open ? "none" : "flex",
                    }}
                >
                    <FontAwesomeIcon icon={faComments} style={{ fontSize: 22 }} />
                </IconButton>
            </Fade>

            <Fade in={open}>
                <Paper
                    elevation={0}
                    sx={{
                        position: "fixed", bottom: 28, right: 28, zIndex: 1300,
                        width: { xs: "calc(100vw - 32px)", sm: 420 },
                        height: { xs: "calc(100vh - 100px)", sm: 620 },
                        maxHeight: 620,
                        display: open ? "flex" : "none",
                        flexDirection: "column",
                        background: "#10101A",
                        border: "1px solid rgba(201,168,76,0.18)",
                        borderRadius: "12px",
                        overflow: "hidden",
                    }}
                >
                    <Box sx={{
                        px: 2.5, py: 2,
                        background: "linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(123,94,167,0.12) 100%)",
                        borderBottom: "1px solid rgba(201,168,76,0.12)",
                        display: "flex", alignItems: "center", gap: 1.5,
                    }}>
                        <Avatar sx={{ width: 34, height: 34, background: "linear-gradient(135deg, #C9A84C, #7B5EA7)" }}>
                            <FontAwesomeIcon icon={faRobot} style={{ fontSize: 15, color: "#0A0A0F" }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1rem", fontWeight: 600, color: "text.primary", lineHeight: 1.2 }}>
                                LUXE Assistant
                            </Typography>
                            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>Powered by AI</Typography>
                        </Box>
                        <IconButton onClick={() => setOpen(false)} size="small" sx={{ color: "text.secondary" }}>
                            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 16 }} />
                        </IconButton>
                    </Box>

                    <Box sx={{
                        flex: 1, overflowY: "auto", px: 2, py: 2,
                        display: "flex", flexDirection: "column", gap: 1.5,
                        "&::-webkit-scrollbar": { width: 4 },
                        "&::-webkit-scrollbar-track": { background: "transparent" },
                        "&::-webkit-scrollbar-thumb": { background: "rgba(201,168,76,0.2)", borderRadius: 2 },
                    }}>
                        {messages.map((msg) => (
                            <Box key={msg.id} sx={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                                <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                                    {msg.role === "assistant" && (
                                        <Avatar sx={{ width: 26, height: 26, background: "linear-gradient(135deg, #C9A84C, #7B5EA7)", flexShrink: 0 }}>
                                            <FontAwesomeIcon icon={faRobot} style={{ fontSize: 12, color: "#0A0A0F" }} />
                                        </Avatar>
                                    )}
                                    <Box sx={{
                                        maxWidth: "80%", px: 1.8, py: 1.2,
                                        borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                        background: msg.role === "user"
                                            ? "linear-gradient(135deg, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.15) 100%)"
                                            : "rgba(255,255,255,0.05)",
                                        border: msg.role === "user"
                                            ? "1px solid rgba(201,168,76,0.3)"
                                            : "1px solid rgba(255,255,255,0.06)",
                                    }}>
                                        <Typography sx={{ fontSize: "0.84rem", color: "text.primary", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                                            {msg.text}
                                            {msg.streaming && (
                                                <Box component="span" sx={{
                                                    display: "inline-block", width: 2, height: "1em",
                                                    background: "#C9A84C", ml: 0.3, verticalAlign: "text-bottom",
                                                    "@keyframes blink": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0 } },
                                                    animation: "blink 0.8s ease infinite",
                                                }} />
                                            )}
                                        </Typography>
                                    </Box>
                                </Box>

                                {!msg.streaming && msg.compareProducts?.length === 2 && (
                                    <ComparisonTable products={msg.compareProducts} />
                                )}

                                {!msg.streaming && msg.compareProducts?.length === 2 && (
                                    <Box sx={{ mt: 1.5, ml: 4.5 }}>
                                        <Grid container spacing={1}>
                                            {msg.compareProducts.map((product) => (
                                                <Grid key={product._id} size={{ xs: 6 }}>
                                                    <ProductCard product={product} compact={true} />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}

                                {!msg.streaming && msg.products?.length > 0 && msg.compareProducts?.length !== 2 && (
                                    <Box sx={{ mt: 1.5, ml: 4.5 }}>
                                        <Grid container spacing={1}>
                                            {msg.products.map((product) => (
                                                <Grid key={product._id} size={{ xs: 6 }}>
                                                    <ProductCard product={product} compact={true} />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}

                                {!msg.streaming && msg.cartProducts?.length > 0 && (
                                    <CartBanner products={msg.cartProducts} onAdd={handleCartAdd} />
                                )}
                            </Box>
                        ))}

                        {loading && !messages.some((m) => m.streaming) && (
                            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                                <Avatar sx={{ width: 26, height: 26, background: "linear-gradient(135deg, #C9A84C, #7B5EA7)", flexShrink: 0 }}>
                                    <FontAwesomeIcon icon={faRobot} style={{ fontSize: 12, color: "#0A0A0F" }} />
                                </Avatar>
                                <Box sx={{
                                    px: 2, py: 1.5, borderRadius: "16px 16px 16px 4px",
                                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)",
                                    display: "flex", gap: 0.6, alignItems: "center",
                                }}>
                                    {[0, 1, 2].map((i) => (
                                        <Box key={i} sx={{
                                            width: 6, height: 6, borderRadius: "50%", background: "#C9A84C", opacity: 0.7,
                                            "@keyframes bounce": { "0%, 80%, 100%": { transform: "scale(0.8)", opacity: 0.5 }, "40%": { transform: "scale(1.2)", opacity: 1 } },
                                            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                                        }} />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {messages.length === 1 && !loading && (
                            <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.8, ml: 4.5 }}>
                                {SUGGESTED_QUERIES.map((q) => (
                                    <Chip key={q} label={q} size="small" onClick={() => sendMessage(q)}
                                        sx={{
                                            fontSize: "0.72rem", height: 26,
                                            background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)",
                                            color: "text.secondary", cursor: "pointer",
                                            "&:hover": { background: "rgba(201,168,76,0.16)", color: "primary.main", borderColor: "primary.main" },
                                            transition: "all 0.2s",
                                        }}
                                    />
                                ))}
                            </Box>
                        )}

                        <div ref={messagesEndRef} />
                    </Box>

                    <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid rgba(201,168,76,0.1)", display: "flex", gap: 1, alignItems: "flex-end" }}>
                        <TextField
                            inputRef={inputRef} multiline maxRows={3} size="small"
                            placeholder="Ask about products..." value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown} disabled={loading} fullWidth
                            sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.84rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)" } }}
                        />
                        <IconButton
                            onClick={() => sendMessage()} disabled={loading || !input.trim()}
                            sx={{
                                width: 38, height: 38,
                                background: loading || !input.trim() ? "rgba(201,168,76,0.1)" : "linear-gradient(135deg, #C9A84C, #7B5EA7)",
                                color: loading || !input.trim() ? "text.disabled" : "#0A0A0F",
                                flexShrink: 0,
                                "&:hover": { background: loading || !input.trim() ? "rgba(201,168,76,0.1)" : "linear-gradient(135deg, #E4C97E, #9B7ED4)" },
                                transition: "all 0.2s", borderRadius: "8px",
                            }}
                        >
                            {loading ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: 14 }} />}
                        </IconButton>
                    </Box>
                </Paper>
            </Fade>
        </>
    );
}