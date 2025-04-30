import express from "express";
import cors from "cors";
import "./loadEnvironment.mjs";
import posts from "./routes/posts.mjs";
import cookieParser from "cookie-parser";
// import isIOTDevice from "./middleware/auth.mjs";

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
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
