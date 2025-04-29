// // server.js
// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
// import jwt from "jsonwebtoken";
// import { WebSocketServer } from "ws";

// const SECRET_KEY = "secret123"; // should be stored securely in env
// const PORT = 5000;

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // Simple in-memory user
// const USERS = [{ email: "test@gmail.com", password: "123456" }];

// // JWT Login route
// app.post("/api/login", (req, res) => {
//   const { email, password } = req.body;
//   const user = USERS.find((u) => u.email === email && u.password === password);
//   if (!user) {
//     return res.status(401).json({ message: "Invalid credentials" });
//   }

//   const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
//   res.json({ token });
// });

// // Start HTTP server
// const server = app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// // --- WebSocket Section ---
// const wss = new WebSocketServer({ server, path: "/ws" });

// let lastTemp = 30;
// let lastAlt = 300;

// const generateMockData = () => {
//   const timestamp = new Date();
//   const temperature = lastTemp + (Math.random() - 0.5) * 2;
//   const altitude = lastAlt + (Math.random() - 0.5) * 4;
//   const pressure = 977 + Math.random() * 2;

//   const date = timestamp.toLocaleDateString("en-GB");
//   const time = timestamp.toLocaleTimeString("en-GB");

//   const data = {
//     date,
//     time,
//     temperature: temperature.toFixed(2),
//     altitude: altitude.toFixed(2),
//     pressure: pressure.toFixed(2),
//   };

//   const tempDiff = Math.abs(temperature - lastTemp);
//   const altDiff = Math.abs(altitude - lastAlt);

//   lastTemp = temperature;
//   lastAlt = altitude;

//     return { data, alert: tempDiff > 0.5 || altDiff > 0.5};
// //   return { data, alert: tempDiff };
// };

// wss.on("connection", (ws) => {
//   console.log("New client connected");

//   const interval = setInterval(() => {
//     const { data, alert } = generateMockData();
//     ws.send(JSON.stringify({ type: "data", payload: data }));

//     if (alert) {
//       ws.send(
//         JSON.stringify({
//           type: "alert",
//           payload: "⚠️ Sudden change detected in temperature or altitude!",
//         })
//       );
//     }
//   }, 5000);

//   ws.on("message", (msg) => {
//     try {
//       const parsed = JSON.parse(msg);
//       if (parsed.type === "manual-alert") {
//         console.log("Manual Alert from client:", parsed.payload);
//         // Broadcast manual alert to all clients
//         wss.clients.forEach((client) => {
//           if (client.readyState === ws.OPEN) {
//             client.send(
//               JSON.stringify({
//                 type: "alert",
//                 payload: `🔔 Manual Alert: ${parsed.payload}`,
//               })
//             );
//           }
//         });
//       }
//     } catch (err) {
//       console.error("Invalid message format:", msg);
//     }
//   });

//   ws.on("close", () => {
//     console.log("Client disconnected");
//     clearInterval(interval);
//   });
// });

// server.js (Updated)

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import { WebSocketServer } from "ws";

const SECRET_KEY = "secret123";
const PORT = 5000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const USERS = [{ email: "test@gmail.com", password: "123456" }];

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server, path: "/ws" });

const dataHistory = [];

const generateMockData = () => {
  const data = {
    timestamp: new Date().toISOString(),
    temp: 30 + (Math.random() - 0.5) * 5,
    alt: 300 + (Math.random() - 0.5) * 15,
    pres: 976 + (Math.random() - 0.5) * 3,
    lat: 28.6 + (Math.random() - 0.5) * 0.01,
    lng: 77.2 + (Math.random() - 0.5) * 0.01,
    ax: -16000 + Math.random() * 32000,
    ay: -16000 + Math.random() * 32000,
    az: -16000 + Math.random() * 32000,
    gx: -250 + Math.random() * 500,
    gy: -250 + Math.random() * 500,
    gz: -250 + Math.random() * 500,
  };

  return data;
};

const checkForAlert = (data) => {
  if (dataHistory.length === 0) return null;

  const fields = [
    "temp",
    "alt",
    "pres",
    "lat",
    "lng",
    "ax",
    "ay",
    "az",
    "gx",
    "gy",
    "gz",
  ];
  const last10 = dataHistory.slice(-10);
  let alerts = [];

  for (let field of fields) {
    const prevValues = last10.map((d) => d[field]).filter((v) => v != null);
    if (prevValues.length === 0) continue;

    const max = Math.max(...prevValues);
    const min = Math.min(...prevValues);
    const range = max - min;
    const delta = Math.abs(data[field] - min);
    // console.log (data, prevValues, max, min, range, delta);
    // console.log(range,delta);
    if (range > 0 && delta > range * 0.5) {
    // if (range > 0) {
      alerts.push(
        `${field.toUpperCase()} change is large: Δ${delta.toFixed(
          2
        )} > 50% of range (${range.toFixed(2)})`
      );
    }
  }

  return alerts.length ? alerts.join("; ") : null;
};

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  const interval = setInterval(() => {
    const data = generateMockData();
    dataHistory.push(data);
    if (dataHistory.length > 10) dataHistory.shift();

    ws.send(JSON.stringify({ type: "data", payload: data }));

    const alertMessage = checkForAlert(data);
    if (alertMessage) {
      ws.send(JSON.stringify({ type: "alert", payload: `⚠️ ${alertMessage}` }));
    }
  }, 5000);

  ws.on("message", (msg) => {
    try {
      const parsed = JSON.parse(msg);
      if (parsed.type === "manual-alert") {
        wss.clients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(
              JSON.stringify({
                type: "alert",
                payload: `🔔 Manual Alert: ${parsed.payload}`,
              })
            );
          }
        });
      }
    } catch (err) {
      console.error("WebSocket message error:", err);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    clearInterval(interval);
  });
});
