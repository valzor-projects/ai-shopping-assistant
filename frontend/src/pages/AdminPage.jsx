import { useEffect, useState, useRef } from "react";
import {
  Box, Container, Typography, Grid, Card, CardContent,
  Button, TextField, Table, TableBody, TableCell, TableHead,
  TableRow, Chip, Switch, IconButton, Paper, Tabs, Tab,
  InputAdornment, CircularProgress, Alert, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers, faBoxOpen, faReceipt, faDollarSign,
  faPlus, faTrash, faImage, faList, faFileLines, faFont,
  faPenToSquare, faXmark, faUpload, faRuler,
} from "@fortawesome/free-solid-svg-icons";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/axios";
import useProductStore from "../store/useProductStore";
import toast from "react-hot-toast";

const CATEGORIES = ["Electronics", "Clothing", "Accessories", "Jewelry", "Home", "Fragrance"];
const SIZE_CATEGORIES = ["Clothing", "Accessories"];
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const SHOE_SIZES = ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"];
const EMPTY_PRODUCT = { name: "", description: "", price: "", image: "", category: "", sizes: [], shoeSizes: [] };

const StatCard = ({ icon, label, value, color, sub }) => (
  <Card>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ color: "text.secondary", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", mb: 1 }}>{label}</Typography>
          <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "2rem", fontWeight: 600, color: "text.primary", lineHeight: 1 }}>
            {value}
          </Typography>
          {sub && <Typography sx={{ color: "text.secondary", fontSize: "0.78rem", mt: 0.5 }}>{sub}</Typography>}
        </Box>
        <Box sx={{ p: 1.5, background: `${color}15`, borderRadius: "4px", color, display: "flex" }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

function ImageUploader({ value, onChange, label = "Product Image" }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => { onChange(reader.result); setUploading(false); };
    reader.onerror = () => { toast.error("Failed to read file"); setUploading(false); };
    reader.readAsDataURL(file);
  };

  return (
    <Box>
      <Typography sx={{ color: "text.secondary", fontSize: "0.78rem", mb: 1.5, letterSpacing: "0.04em" }}>{label}</Typography>
      <Box
        onClick={() => fileRef.current?.click()}
        sx={{
          border: "2px dashed rgba(201,168,76,0.25)", borderRadius: "4px",
          height: value ? "auto" : 140,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.2s", overflow: "hidden", position: "relative",
          "&:hover": { borderColor: "rgba(201,168,76,0.6)", background: "rgba(201,168,76,0.03)" },
        }}
      >
        {uploading ? (
          <CircularProgress size={28} sx={{ color: "primary.main" }} />
        ) : value ? (
          <Box component="img" src={value} alt="Preview" sx={{ width: "100%", maxHeight: 200, objectFit: "contain", display: "block" }} onError={(e) => { e.target.style.display = "none"; }} />
        ) : (
          <Box sx={{ textAlign: "center", p: 2 }}>
            <FontAwesomeIcon icon={faUpload} style={{ fontSize: 24, color: "#C9A84C", opacity: 0.6, marginBottom: 8 }} />
            <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>Click to upload image</Typography>
            <Typography sx={{ color: "text.disabled", fontSize: "0.7rem", mt: 0.3 }}>PNG, JPG, WEBP · max 5MB</Typography>
          </Box>
        )}
        {value && (
          <Box
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            sx={{
              position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%",
              background: "rgba(10,10,15,0.75)", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", "&:hover": { background: "rgba(224,92,92,0.8)" },
            }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 11, color: "#fff" }} />
          </Box>
        )}
      </Box>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      <TextField
        fullWidth size="small"
        placeholder="Or paste an image URL..."
        value={value?.startsWith("data:") ? "" : (value || "")}
        onChange={(e) => onChange(e.target.value)}
        sx={{ mt: 1.5 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FontAwesomeIcon icon={faImage} style={{ fontSize: 12, color: "#4A4A60" }} />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}

function SizeSelector({ category, sizes, shoeSizes, onSizesChange, onShoeSizesChange }) {
  if (!SIZE_CATEGORIES.includes(category)) return null;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <FontAwesomeIcon icon={faRuler} style={{ fontSize: 13, color: "#C9A84C" }} />
        <Typography sx={{ color: "text.secondary", fontSize: "0.78rem", letterSpacing: "0.04em" }}>
          Available Sizes
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography sx={{ color: "text.disabled", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", mb: 1 }}>
          Clothing
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
          {CLOTHING_SIZES.map((s) => {
            const checked = sizes.includes(s);
            return (
              <Box
                key={s}
                onClick={() => onSizesChange(checked ? sizes.filter((x) => x !== s) : [...sizes, s])}
                sx={{
                  px: 1.5, py: 0.6,
                  border: `1px solid ${checked ? "#C9A84C" : "rgba(201,168,76,0.2)"}`,
                  borderRadius: "2px", cursor: "pointer",
                  background: checked ? "rgba(201,168,76,0.12)" : "transparent",
                  color: checked ? "#C9A84C" : "#9A9BAD",
                  fontSize: "0.72rem", fontWeight: checked ? 700 : 500,
                  letterSpacing: "0.04em", transition: "all 0.15s",
                  "&:hover": { borderColor: "#C9A84C", color: "#C9A84C" },
                }}
              >
                {s}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box>
        <Typography sx={{ color: "text.disabled", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", mb: 1 }}>
          Shoe Sizes (optional)
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
          {SHOE_SIZES.map((s) => {
            const checked = shoeSizes.includes(s);
            return (
              <Box
                key={s}
                onClick={() => onShoeSizesChange(checked ? shoeSizes.filter((x) => x !== s) : [...shoeSizes, s])}
                sx={{
                  px: 1.5, py: 0.6,
                  border: `1px solid ${checked ? "#7B5EA7" : "rgba(123,94,167,0.2)"}`,
                  borderRadius: "2px", cursor: "pointer",
                  background: checked ? "rgba(123,94,167,0.12)" : "transparent",
                  color: checked ? "#A07FCC" : "#9A9BAD",
                  fontSize: "0.72rem", fontWeight: checked ? 700 : 500,
                  transition: "all 0.15s",
                  "&:hover": { borderColor: "#7B5EA7", color: "#A07FCC" },
                }}
              >
                {s}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

// ProductForm must be outside AdminPage to avoid re-definition on every render
function ProductForm({ data, onChange, onSubmit, submitLabel, submitting }) {
  return (
    <Box component={onSubmit ? "form" : "div"} onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <TextField
        fullWidth label="Product Name" required
        value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })}
        InputProps={{ startAdornment: <InputAdornment position="start"><FontAwesomeIcon icon={faFont} style={{ fontSize: 14, color: "#4A4A60" }} /></InputAdornment> }}
      />
      <TextField
        fullWidth label="Description" required multiline rows={3}
        value={data.description} onChange={(e) => onChange({ ...data, description: e.target.value })}
        InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mt: "12px !important" }}><FontAwesomeIcon icon={faFileLines} style={{ fontSize: 14, color: "#4A4A60" }} /></InputAdornment> }}
      />
      {/* MUI v7 Grid: size prop — FIXED from item xs={6} */}
      <Grid container spacing={2}>
        <Grid size={6}>
          <TextField
            fullWidth label="Price ($)" type="number" required
            value={data.price} onChange={(e) => onChange({ ...data, price: e.target.value })}
            InputProps={{ startAdornment: <InputAdornment position="start"><FontAwesomeIcon icon={faDollarSign} style={{ fontSize: 14, color: "#4A4A60" }} /></InputAdornment> }}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            select fullWidth label="Category" required
            value={data.category} onChange={(e) => onChange({ ...data, category: e.target.value, sizes: [], shoeSizes: [] })}
            InputProps={{ startAdornment: <InputAdornment position="start"><FontAwesomeIcon icon={faList} style={{ fontSize: 14, color: "#4A4A60" }} /></InputAdornment> }}
          >
            {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      <SizeSelector
        category={data.category}
        sizes={data.sizes || []}
        shoeSizes={data.shoeSizes || []}
        onSizesChange={(s) => onChange({ ...data, sizes: s })}
        onShoeSizesChange={(s) => onChange({ ...data, shoeSizes: s })}
      />

      <ImageUploader value={data.image} onChange={(img) => onChange({ ...data, image: img })} />

      {onSubmit && (
        <Button
          type="submit" variant="contained" size="large"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : <FontAwesomeIcon icon={faPlus} />}
          sx={{ py: 1.8, mt: 1 }}
        >
          {submitting ? "Creating..." : submitLabel}
        </Button>
      )}
    </Box>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [creating, setCreating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editData, setEditData] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);

  const { products, fetchAllProducts, deleteProduct, toggleFeatured, createProduct, updateProduct, loading } = useProductStore();

  useEffect(() => {
    fetchAllProducts();
    const loadAnalytics = async () => {
      try {
        const res = await api.get("/analytics");
        setAnalytics(res.data.analyticsData);
        setChartData(res.data.dailySalesData);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoadingAnalytics(false);
      }
    };
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    setCreating(true);
    try {
      await createProduct({ ...newProduct, price: parseFloat(newProduct.price) });
      setNewProduct(EMPTY_PRODUCT);
      setTab(1);
    } catch {
      // toast handled in store
    } finally {
      setCreating(false);
    }
  };

  const handleEditOpen = (product) => {
    setEditProduct(product);
    setEditData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      image: product.image || "",
      category: product.category,
      sizes: product.sizes || [],
      shoeSizes: product.shoeSizes || [],
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editData.name || !editData.price || !editData.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      await updateProduct(editProduct._id, { ...editData, price: parseFloat(editData.price) });
      setEditOpen(false);
    } catch {
      // toast handled in store
    } finally {
      setSaving(false);
    }
  };

  const tabSx = {
    mb: 4,
    borderBottom: "1px solid rgba(201,168,76,0.15)",
    "& .MuiTab-root": {
      color: "rgba(154,155,173,0.7)",
      fontSize: "0.78rem",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontWeight: 500,
      minWidth: 100,
    },
    "& .Mui-selected": { color: "#C9A84C !important", fontWeight: 700 },
    "& .MuiTabs-indicator": { backgroundColor: "#C9A84C", height: "2px" },
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 5 }}>
          <Typography variant="subtitle1" sx={{ color: "primary.main", mb: 0.5 }}>Administrator</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, color: "text.primary" }}>
            Dashboard
          </Typography>
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={tabSx}>
          <Tab label="Analytics" />
          <Tab label="Products" />
          <Tab label="Add Product" />
        </Tabs>

        {/* Analytics Tab */}
        {tab === 0 && (
          <Box>
            {loadingAnalytics ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: "primary.main" }} />
              </Box>
            ) : analytics ? (
              <>
                {/* MUI v7 Grid: size prop — FIXED from item xs={12} sm={6} md={3} */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                  {[
                    { icon: <FontAwesomeIcon icon={faUsers} />, label: "Total Users", value: analytics.users.toLocaleString(), color: "#7B5EA7" },
                    { icon: <FontAwesomeIcon icon={faBoxOpen} />, label: "Products", value: analytics.products.toLocaleString(), color: "#4C8AE0" },
                    { icon: <FontAwesomeIcon icon={faReceipt} />, label: "Total Sales", value: analytics.totalSales.toLocaleString(), color: "#4CAF82" },
                    { icon: <FontAwesomeIcon icon={faDollarSign} />, label: "Revenue", value: `$${analytics.totalRevenue.toLocaleString()}`, color: "#C9A84C", sub: "All time" },
                  ].map((s) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={s.label}>
                      <StatCard {...s} />
                    </Grid>
                  ))}
                </Grid>
                <Paper elevation={0} sx={{ background: "#12121A", border: "1px solid rgba(201,168,76,0.08)", borderRadius: "4px", p: 3 }}>
                  <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.3rem", color: "text.primary", mb: 3 }}>
                    Last 7 Days — Revenue
                  </Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7B5EA7" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#7B5EA7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.06)" />
                      <XAxis dataKey="date" tick={{ fill: "#9A9BAD", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#9A9BAD", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#1A1A26", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "4px", color: "#F0ECE3", fontSize: "0.8rem" }} cursor={{ stroke: "rgba(201,168,76,0.2)" }} />
                      <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#revenueGrad)" dot={false} name="Revenue ($)" />
                      <Area type="monotone" dataKey="sales" stroke="#7B5EA7" strokeWidth={2} fill="url(#salesGrad)" dot={false} name="Orders" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </>
            ) : (
              <Alert severity="error">Failed to load analytics data</Alert>
            )}
          </Box>
        )}

        {/* Products Tab */}
        {tab === 1 && (
          <Paper elevation={0} sx={{ background: "#12121A", border: "1px solid rgba(201,168,76,0.08)", borderRadius: "4px", overflow: "hidden" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ "& .MuiTableCell-root": { borderColor: "rgba(201,168,76,0.08)", color: "text.secondary", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", py: 2 } }}>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell align="center">Featured</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, border: "none" }}>
                      <CircularProgress sx={{ color: "primary.main" }} size={32} />
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, border: "none", color: "text.secondary" }}>
                      No products yet. Add your first product from the "Add Product" tab.
                    </TableCell>
                  </TableRow>
                ) : products.map((product) => (
                  <TableRow key={product._id} sx={{ "&:hover": { background: "rgba(201,168,76,0.03)" }, "& .MuiTableCell-root": { borderColor: "rgba(201,168,76,0.06)", py: 2 } }}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar src={product.image} variant="rounded" sx={{ width: 44, height: 44, border: "1px solid rgba(201,168,76,0.1)", borderRadius: "2px" }} />
                        <Box>
                          <Typography sx={{ color: "text.primary", fontWeight: 500, fontSize: "0.875rem" }}>{product.name}</Typography>
                          {product.sizes?.length > 0 && (
                            <Typography sx={{ color: "text.disabled", fontSize: "0.68rem", mt: 0.2 }}>
                              Sizes: {product.sizes.join(", ")}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={product.category} size="small" sx={{ background: "rgba(201,168,76,0.08)", color: "primary.main", fontSize: "0.7rem" }} />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: "primary.main", fontWeight: 600, fontFamily: '"Cormorant Garamond", serif', fontSize: "1.05rem" }}>
                        ${product.price?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={Boolean(product.isFeatured)}
                        onChange={() => toggleFeatured(product._id)}
                        size="small"
                        sx={{ "& .MuiSwitch-thumb": { background: product.isFeatured ? "#C9A84C" : "#4A4A60" }, "& .Mui-checked + .MuiSwitch-track": { background: "#C9A84C30" } }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                        <IconButton onClick={() => handleEditOpen(product)} size="small" sx={{ color: "text.disabled", "&:hover": { color: "primary.main", background: "rgba(201,168,76,0.08)" } }}>
                          <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 13 }} />
                        </IconButton>
                        <IconButton onClick={() => deleteProduct(product._id)} size="small" sx={{ color: "text.disabled", "&:hover": { color: "error.main", background: "rgba(224,92,92,0.08)" } }}>
                          <FontAwesomeIcon icon={faTrash} style={{ fontSize: 13 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* Add Product Tab */}
        {tab === 2 && (
          <Paper elevation={0} sx={{ background: "#12121A", border: "1px solid rgba(201,168,76,0.08)", borderRadius: "4px", p: { xs: 3, md: 5 }, maxWidth: 640 }}>
            <Typography variant="h4" sx={{ color: "text.primary", mb: 4, fontSize: "1.6rem" }}>Add New Product</Typography>
            <ProductForm
              data={newProduct}
              onChange={setNewProduct}
              onSubmit={handleCreateProduct}
              submitLabel="Create Product"
              submitting={creating}
            />
          </Paper>
        )}
      </Container>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => !saving && setEditOpen(false)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: "#12121A", border: "1px solid rgba(201,168,76,0.12)", borderRadius: "6px" } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: "1.4rem", color: "text.primary" }}>
            Edit Product
          </Typography>
          <IconButton onClick={() => setEditOpen(false)} disabled={saving} size="small" sx={{ color: "text.secondary" }}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 16 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mt: 1 }}>
            <ProductForm data={editData} onChange={setEditData} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button variant="outlined" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained" onClick={handleEditSave} disabled={saving}
            startIcon={saving ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : null}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}