import Product from "../models/product-model.js";

const getItemProductId = (item) => {
    return (item.product || item.id || "").toString();
};

export const getCartProducts = async (req, res) => {
    try {
        const productIds = req.user.cartItems
            .map((item) => item.product || item.id)
            .filter(Boolean);

        const products = await Product.find({ _id: { $in: productIds } });

        const cartItems = req.user.cartItems.map((cartItem) => {
            const cartProductId = getItemProductId(cartItem);
            const product = products.find((p) => p._id.toString() === cartProductId);
            if (!product) return null;
            return {
                ...product.toJSON(),
                quantity: cartItem.quantity,
                selectedSize: cartItem.selectedSize || null,
            };
        }).filter(Boolean);

        res.json(cartItems);
    } catch (error) {
        console.log("Error in getCartProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId, selectedSize } = req.body;
        const user = req.user;

        const existingItem = user.cartItems.find(
            (item) =>
                getItemProductId(item) === productId &&
                (item.selectedSize || null) === (selectedSize || null)
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push({ product: productId, quantity: 1, selectedSize: selectedSize || null });
        }

        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const removeAllFromCart = async (req, res) => {
    try {
        const { productId, selectedSize } = req.body;
        const user = req.user;

        if (!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter(
                (item) =>
                    !(
                        getItemProductId(item) === productId &&
                        (item.selectedSize || null) === (selectedSize || null)
                    )
            );
        }

        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { quantity, selectedSize } = req.body;
        const user = req.user;

        const existingItem = user.cartItems.find(
            (item) =>
                getItemProductId(item) === productId &&
                (item.selectedSize || null) === (selectedSize || null)
        );

        if (existingItem) {
            if (quantity === 0) {
                user.cartItems = user.cartItems.filter(
                    (item) =>
                        !(
                            getItemProductId(item) === productId &&
                            (item.selectedSize || null) === (selectedSize || null)
                        )
                );
                await user.save();
                return res.json(user.cartItems);
            }

            existingItem.quantity = quantity;
            await user.save();
            res.json(user.cartItems);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.log("Error in updateQuantity controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};