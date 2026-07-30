import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from '@clerk/express'
const app = express();

// Middleware
app.use(cors())
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});
connectDB()
app.use(clerkMiddleware())
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
console.log(process.env.MONGODB_URI);