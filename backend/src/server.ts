import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import app from "./app";
import connectDB from "./config/db";

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
