import React, { useState, useEffect, useRef } from "react";
import WebSocketService from "../../utils/websocket";
import { removeToken } from "../../utils/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import DataTable from "./DataTable"; // assuming DataTable is in the same directory
// import "./Dashboard.css"; // optional styling

const Dashboard = ({ onLogout }) => {
  const [dataRows, setDataRows] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [manualAlertMsg, setManualAlertMsg] = useState("");
  const socketService = useRef(null);

  const WEBSOCKET_URL = "ws://localhost:5000/ws";

  const handleData = (data) => {
    setDataRows((prev) => [...prev, data]);
  };

  const handleAlert = (alertMessage) => {
    setAlerts((prev) => [...prev, alertMessage]);
  };

  useEffect(() => {
    socketService.current = new WebSocketService(
      WEBSOCKET_URL,
      handleData,
      handleAlert
    );
    socketService.current.connect();

    return () => {
      socketService.current.disconnect();
    };
  }, []);

  const handleManualAlert = () => {
    if (manualAlertMsg.trim()) {
      socketService.current.sendAlert(manualAlertMsg.trim());
      setManualAlertMsg("");
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
