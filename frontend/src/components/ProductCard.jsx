import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Button, Box, Chip, IconButton, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping, faHeart as faHeartSolid, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import useCartStore from "../store/useCartStore";
import useAuthStore from "../store/useAuthStore";

export default function ProductCard({ product, compact = false }) {
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [wished, setWished] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [pendingSize, setPendingSize] = useState(null);

  const hasSizes = product.sizes?.length > 0;
  const hasShoeSizes = product.shoeSizes?.length > 0;
  const needsSizeSelection = hasSizes || hasShoeSizes;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    if (needsSizeSelection) {
      setPendingSize(null);
      setSizeDialogOpen(true);
    } else {
      addToCart(product, null);
    }
  };

  const handleConfirmSize = () => {
    addToCart(product, pendingSize);
    setSizeDialogOpen(false);
    setPendingSize(null);
  };

  const handleCardClick = () => navigate(`/product/${product._id}`);

  const compactSizeLimit = 3;
  const normalSizeLimit = 5;
  const compactShoeSizeLimit = 2;
  const normalShoeSizeLimit = 4;

  return (
    <>
      <Card
        onClick={handleCardClick}
        sx={{
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {product.isFeatured && (
          <Chip
            label="Featured"
            size="small"
            sx={{
              position: "absolute", top: 8, left: 8, zIndex: 2,
              background: "linear-gradient(135deg, #C9A84C, #E4C97E)",
              color: "#0A0A0F", fontWeight: 700,
              fontSize: compact ? "0.55rem" : "0.62rem",
              height: compact ? 18 : 24,
            }}
          />
        )}

        <IconButton
          onClick={(e) => { e.stopPropagation(); setWished(!wished); }}
          sx={{
            position: "absolute", top: 5, right: 5, zIndex: 2,
            background: "rgba(10,10,15,0.55)", backdropFilter: "blur(4px)",
            width: compact ? 24 : 30, height: compact ? 24 : 30,
            "&:hover": { background: "rgba(10,10,15,0.85)" },
          }}
          size="small"
        >
          <FontAwesomeIcon
            icon={wished ? faHeartSolid : faHeartRegular}
            style={{ fontSize: compact ? 10 : 12, color: wished ? "#E05C5C" : "#9A9BAD" }}
          />
        </IconButton>

        <Box sx={{ position: "relative", pt: compact ? "56%" : "75%", background: "#12121A", overflow: "hidden" }}>
          {!imgLoaded && (
            <Skeleton variant="rectangular" sx={{ position: "absolute", inset: 0, height: "100%", transform: "none" }} />
          )}
          <CardMedia
            component="img"
            image={product.image || `https://placehold.co/400x300/1A1A26/C9A84C?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            sx={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.3s ease, transform 0.5s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
          />
        </Box>

        <CardContent sx={{ flex: 1, px: compact ? 1 : 2, pt: compact ? 1 : 1.5, pb: 0.5 }}>
          <Typography sx={{
            color: "text.secondary", mb: 0.3,
            fontSize: compact ? "0.55rem" : "0.6rem",
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            {product.category}
          </Typography>

          <Typography sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: compact ? "0.82rem" : "0.98rem",
            fontWeight: 500, color: "text.primary",
            mb: 0.4, lineHeight: 1.3,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {product.name}
          </Typography>

          <Typography sx={{
            fontSize: compact ? "0.85rem" : "1rem",
            fontWeight: 700, color: "primary.main",
            fontFamily: '"Cormorant Garamond", serif',
          }}>
            ${product.price?.toFixed(2)}
          </Typography>

          {hasSizes && (
            <Box sx={{ mt: compact ? 0.6 : 1, display: "flex", flexWrap: "wrap", gap: compact ? 0.3 : 0.4, alignItems: "center" }}>
              {product.sizes.slice(0, compact ? compactSizeLimit : normalSizeLimit).map((s) => (
                <Box key={s} sx={{
                  px: compact ? 0.6 : 0.8,
                  py: compact ? 0.15 : 0.2,
                  border: "1px solid rgba(201,168,76,0.25)",
                  borderRadius: "2px",
                  fontSize: compact ? "0.52rem" : "0.58rem",
                  fontWeight: 600,
                  color: "text.secondary",
                  letterSpacing: "0.04em",
                  lineHeight: 1.6,
                }}>
                  {s}
                </Box>
              ))}
              {product.sizes.length > (compact ? compactSizeLimit : normalSizeLimit) && (
                <Typography sx={{ fontSize: compact ? "0.52rem" : "0.58rem", color: "text.disabled", alignSelf: "center" }}>
                  +{product.sizes.length - (compact ? compactSizeLimit : normalSizeLimit)} more
                </Typography>
              )}
            </Box>
          )}

          {hasShoeSizes && (
            <Box sx={{ mt: compact ? 0.4 : 0.6, display: "flex", flexWrap: "wrap", gap: compact ? 0.3 : 0.4, alignItems: "center" }}>
              {product.shoeSizes.slice(0, compact ? compactShoeSizeLimit : normalShoeSizeLimit).map((s) => (
                <Box key={s} sx={{
                  px: compact ? 0.6 : 0.8,
                  py: compact ? 0.15 : 0.2,
                  border: "1px solid rgba(123,94,167,0.3)",
                  borderRadius: "2px",
                  fontSize: compact ? "0.52rem" : "0.58rem",
                  fontWeight: 600,
                  color: "#A07FCC",
                  letterSpacing: "0.02em",
                  lineHeight: 1.6,
                }}>
                  {s}
                </Box>
              ))}
              {product.shoeSizes.length > (compact ? compactShoeSizeLimit : normalShoeSizeLimit) && (
                <Typography sx={{ fontSize: compact ? "0.52rem" : "0.58rem", color: "text.disabled", alignSelf: "center" }}>
                  +{product.shoeSizes.length - (compact ? compactShoeSizeLimit : normalShoeSizeLimit)} more
                </Typography>
              )}
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ px: compact ? 1 : 2, pb: compact ? 1 : 2, pt: 0.5 }}>
          <Button
            fullWidth variant="contained"
            size="small"
            onClick={handleAddToCart}
            startIcon={<FontAwesomeIcon icon={faBagShopping} style={{ fontSize: compact ? "0.6rem" : "0.7rem" }} />}
            sx={{ fontSize: compact ? "0.6rem" : "0.68rem", py: compact ? 0.5 : 0.9 }}
          >
            Add to Cart
          </Button>
        </CardActions>
      </Card>

      <Dialog
        open={sizeDialogOpen}
        onClose={() => setSizeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        onClick={(e) => e.stopPropagation()}
        PaperProps={{ sx: { background: "#12121A", border: "1px solid rgba(201,168,76,0.12)", borderRadius: "6px" } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.2rem", color: "text.primary" }}>
            Select a Size
          </Typography>
          <IconButton onClick={() => setSizeDialogOpen(false)} size="small" sx={{ color: "text.secondary" }}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {hasSizes && (
            <Box sx={{ mb: hasShoeSizes ? 2.5 : 0 }}>
              {hasShoeSizes && (
                <Typography sx={{ color: "text.disabled", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", mb: 1 }}>
                  Clothing
                </Typography>
              )}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {product.sizes.map((s) => (
                  <Box
                    key={s}
                    onClick={() => setPendingSize(s)}
                    sx={{
                      px: 2, py: 0.8,
                      border: pendingSize === s ? "1px solid #C9A84C" : "1px solid rgba(201,168,76,0.25)",
                      borderRadius: "3px", cursor: "pointer",
                      background: pendingSize === s ? "rgba(201,168,76,0.12)" : "transparent",
                      color: pendingSize === s ? "#C9A84C" : "text.secondary",
                      fontSize: "0.8rem", fontWeight: 600,
                      transition: "all 0.15s",
                      "&:hover": { borderColor: "#C9A84C", color: "#C9A84C" },
                    }}
                  >
                    {s}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {hasShoeSizes && (
            <Box>
              {hasSizes && (
                <Typography sx={{ color: "text.disabled", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", mb: 1 }}>
                  Shoe Size
                </Typography>
              )}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {product.shoeSizes.map((s) => (
                  <Box
                    key={s}
                    onClick={() => setPendingSize(s)}
                    sx={{
                      px: 2, py: 0.8,
                      border: pendingSize === s ? "1px solid #7B5EA7" : "1px solid rgba(123,94,167,0.25)",
                      borderRadius: "3px", cursor: "pointer",
                      background: pendingSize === s ? "rgba(123,94,167,0.12)" : "transparent",
                      color: pendingSize === s ? "#A07FCC" : "text.secondary",
                      fontSize: "0.8rem", fontWeight: 600,
                      transition: "all 0.15s",
                      "&:hover": { borderColor: "#7B5EA7", color: "#A07FCC" },
                    }}
                  >
                    {s}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => setSizeDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={!pendingSize}
            onClick={handleConfirmSize}
            startIcon={<FontAwesomeIcon icon={faBagShopping} style={{ fontSize: 11 }} />}
          >
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}