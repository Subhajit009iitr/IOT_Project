import React, { useState, useEffect, useRef } from "react";
import WebSocketService from "../../utils/websocket";
import { removeToken } from "../../utils/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import DataTable from "./DataTable"; 
import axios from "axios";

// import "./Dashboard.css"; // optional styling

const Dashboard = ({ onLogout }) => {
  const [dataRows, setDataRows] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [manualAlertMsg, setManualAlertMsg] = useState("");
  const socketService = useRef(null);

  const WEBSOCKET_URL = "ws://localhost:8000/ws";

  const handleData = (data) => {
    setDataRows((prev) => [...prev, data]);
  };

  const handleAlert = (alertMessage) => {
    setAlerts((prev) => [...prev, alertMessage]);
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    console.log("Token from localStorage:", token); // Debugging line
    socketService.current = new WebSocketService(
      WEBSOCKET_URL,
      token,
      handleData,
      handleAlert
    );
    socketService.current.connect();

    return () => {
      socketService.current.disconnect();
    };
  }, []);

  // useEffect(() => {
  //   const socketService = new WebSocketService(
  //     WEBSOCKET_URL, // or wss://yourdomain.com if using SSL
  //     handleData,
  //     handleAlert
  //   );
  //   socketService.connect();
  
  //   return () => {
  //     socketService.disconnect();
  //   };
  // }, []);

  const handleManualAlert = async() => {
    if (manualAlertMsg.trim()) {
      try {
        let message = manualAlertMsg.trim();
        const res = await axios.post(
          "http://localhost:8000/send-alert",
          { message },
          {
            withCredentials: true, // ensures the token cookie is sent
          }
        );
    
        if (res.data.status === "alert sent attempt made") {
          console.log("Alert sent successfully.");
        } else {
          console.warn("Alert not acknowledged properly.");
        }
      } catch (error) {
        console.error("Failed to send alert:", error.response?.data || error.message);
      }
    }
  };

  const logout = () => {
    removeToken();
    onLogout();
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>Sensor Dashboard</h2>
        <button className="btn btn-outline-danger" onClick={logout}>
          Logout
        </button>
      </div>
      {/* Header, alerts, input, and table rendering as before */}

      {alerts.length > 0 && (
        <div className="alert alert-warning mt-3">
          <h5>Notifications:</h5>
          <ul>
            {alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="input-group mt-3 mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Manual alert message"
          value={manualAlertMsg}
          onChange={(e) => setManualAlertMsg(e.target.value)}
        />
        <button className="btn btn-danger" onClick={handleManualAlert}>
          Send Manual Alert
        </button>
      </div>

      <DataTable dataRows={dataRows} />
    </div>
  );
};

export default Dashboard;
