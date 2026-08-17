import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db.js";

import makeAdmin from "./scripts/makeAdmin.js";
import productRoutes from "./routes/productsRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/ordersRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import adminRoutes from "./routes/adminroutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import firstOrderRoutes from "./routes/firstOrderRoutes.js";
import { seedProducts } from "./scripts/seedProducts.js";
import { seedCategories } from "./scripts/seedCategories.js";
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

await connectDB();
await makeAdmin();
// await seedCategories();
// Seed dummy products if no products are present
// await seedProducts(process.env.MONGODB_URI as string);

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/sale", saleRoutes);
app.use("/api/first-order", firstOrderRoutes);

// app.listen(port, () => {
//     console.log(`Server is running at http://localhost:${port}`);
// });
export default app;