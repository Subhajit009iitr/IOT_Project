import express from "express";
import cors from "cors";
import "./loadEnvironment.mjs";
import posts from "./routes/posts.mjs";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { WebSocketServer } from "ws";
import { sensorDataModel } from "./db/models.mjs";

const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors({
  origin: "http://localhost:4030",   // 👈 Set the exact origin of your frontend
  credentials: true,                 // 👈 Allow cookies/credentials to be sent
}));

app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/", posts);

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Uh oh! An unexpected error occured.")
})

// start the Express server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

const wss = new WebSocketServer({ server, path: "/ws" });

const dataHistory = [];

async function fetchData() {
  try {
    const latestData = await sensorDataModel.find({})
    .sort({ time: -1 })
    .limit(10);
    dataHistory.push(latestData);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

wss.on("connection", async function connection(ws, req) {
  console.log("WebSocket client connected");
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;
  let user;
  try {
    if (!token) throw new Error('No token found');
    user = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    ws.send(JSON.stringify({ error: 'Authentication failed' }));
    ws.close();
    return;
  }

  const interval = setInterval(async () => {
    try {
      const latestData = await sensorDataModel.find({}).sort({ time: -1 }).limit(10);
      ws.send(JSON.stringify({ type: "data", payload: data }));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, 5000);

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    clearInterval(interval);
  });
});
