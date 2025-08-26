// const express = require('express');
// const bodyParser = require('body-parser');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const connectDB = require('./config/db');

// dotenv.config();

// const app = express();

// // ✅ Enable CORS for frontend (hackathon safe → allow all origins)
// app.use(cors({
//   origin: "*",
//   methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));

// // ✅ Parse incoming requests
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// // ✅ Routes
// app.use('/ussd', require('./routes/ussdRoutes'));   // USSD service
// app.use('/api', require('./routes/apiRoutes'));     // REST API for dashboard

// const PORT = process.env.PORT || 5000;

// // ✅ Start server only after DB connects
// const startServer = async () => {
//   try {
//     await connectDB();
//     app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
//   } catch (err) {
//     console.error("❌ Failed to start server:", err.message);
//     process.exit(1);
//   }
// };

// startServer();


import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Load env vars
dotenv.config();

const app = express();

// ✅ Enable CORS for frontend (hackathon safe → allow all origins)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Core Routes
import ussdRoutes from "./routes/ussdRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import webAuthRoutes from "./routes/webAuthRoutes.js";
import webCaseRoutes from "./routes/webCaseRoutes.js";
import webAdminRoutes from "./routes/webAdminRoutes.js";
import webAnalyticsRoutes from "./routes/webAnalyticsRoutes.js";

app.use("/ussd", ussdRoutes);                 // USSD service
app.use("/api", apiRoutes);                   // legacy/basic API
app.use("/api/web/auth", webAuthRoutes);      // Register/Login
app.use("/api/web/cases", webCaseRoutes);     // Case submission & dashboard
app.use("/api/web/admin", webAdminRoutes);    // Admin-only management
app.use("/api/web/analytics", webAnalyticsRoutes); // Stats & insights

const PORT = process.env.PORT || 5001;

// ✅ Start server after DB connects
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
