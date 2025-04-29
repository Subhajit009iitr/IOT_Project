// src/Dashboard.js
import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import WebSocketService from "./websocket";
import { removeToken } from "./auth";

const Dashboard = ({ onLogout }) => {
  const [dataRows, setDataRows] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [manualAlertMsg, setManualAlertMsg] = useState("");
  const socketService = useRef(null);

  const WEBSOCKET_URL = "ws://localhost:5000/ws"; // change to your backend URL

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
    if (manualAlertMsg.trim() && socketService.current) {
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

      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Timestamp</th>
            <th>Temp (°C)</th>
            <th>Alt (m)</th>
            <th>Pres (hPa)</th>
            <th>Lat</th>
            <th>Lng</th>
            <th>ax</th>
            <th>ay</th>
            <th>az</th>
            <th>gx</th>
            <th>gy</th>
            <th>gz</th>
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, i) => (
            <tr key={i}>
              <td>{new Date(row.timestamp).toLocaleString()}</td>
              <td>{row.temp?.toFixed(2)}</td>
              <td>{row.alt?.toFixed(2)}</td>
              <td>{row.pres?.toFixed(2)}</td>
              <td>{row.lat?.toFixed(4)}</td>
              <td>{row.lng?.toFixed(4)}</td>
              <td>{row.ax}</td>
              <td>{row.ay}</td>
              <td>{row.az}</td>
              <td>{row.gx}</td>
              <td>{row.gy}</td>
              <td>{row.gz}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
