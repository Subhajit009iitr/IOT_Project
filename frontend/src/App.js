import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import WebSocketMock from './websocket';

const App = () => {
  const [dataRows, setDataRows] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [manualAlertMsg, setManualAlertMsg] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    // Set up WebSocket
    socketRef.current = new WebSocketMock(handleMessage);
  }, []);

  const handleMessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'data') {
      setDataRows((prev) => [...prev, message.payload]);
    } else if (message.type === 'alert') {
      setAlerts((prev) => [...prev, message.payload]);
    }
  };

  const handleManualAlert = () => {
    if (manualAlertMsg.trim() && socketRef.current) {
      socketRef.current.send(manualAlertMsg.trim());
      setManualAlertMsg('');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Real-time Environmental Sensor Data</h2>

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
            <th>Date</th>
            <th>Time</th>
            <th>Temperature (°C)</th>
            <th>Altitude (m)</th>
            <th>Pressure (hPa)</th>
          </tr>
        </thead>
        <tbody>
          {dataRows.map((entry, index) => (
            <tr key={index}>
              <td>{entry.date}</td>
              <td>{entry.time}</td>
              <td>{entry.temperature}</td>
              <td>{entry.altitude}</td>
              <td>{entry.pressure}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;





// import React, { useState, useEffect, useRef } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import WebSocketService from './websocket'; // Import WebSocket service

// const App = () => {
//   const [dataRows, setDataRows] = useState([]);
//   const [alerts, setAlerts] = useState([]);
//   const [manualAlertMsg, setManualAlertMsg] = useState('');
//   const socketService = useRef(null);

//   // WebSocket server URL (replace with your backend URL)
//   const WEBSOCKET_URL = 'ws://your-backend-websocket-url'; // Replace with your actual WebSocket URL

//   // Callback for handling new data
//   const handleData = (data) => {
//     setDataRows((prev) => [...prev, data]);
//   };

//   // Callback for handling alerts
//   const handleAlert = (alertMessage) => {
//     setAlerts((prev) => [...prev, alertMessage]);
//   };

//   // Initialize WebSocket connection
//   useEffect(() => {
//     socketService.current = new WebSocketService(WEBSOCKET_URL, handleData, handleAlert);
//     socketService.current.connect();

//     // Cleanup WebSocket connection on component unmount
//     return () => {
//       socketService.current.disconnect();
//     };
//   }, []);

//   // Send manual alert
//   const handleManualAlert = () => {
//     if (manualAlertMsg.trim() && socketService.current) {
//       socketService.current.sendAlert(manualAlertMsg.trim());
//       setManualAlertMsg('');
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h2>Real-time Environmental Sensor Data</h2>

//       {alerts.length > 0 && (
//         <div className="alert alert-warning mt-3">
//           <h5>Notifications:</h5>
//           <ul>
//             {alerts.map((alert, index) => (
//               <li key={index}>{alert}</li>
//             ))}
//           </ul>
//         </div>
//       )}

//       <div className="input-group mt-3 mb-4">
//         <input
//           type="text"
//           className="form-control"
//           placeholder="Manual alert message"
//           value={manualAlertMsg}
//           onChange={(e) => setManualAlertMsg(e.target.value)}
//         />
//         <button className="btn btn-danger" onClick={handleManualAlert}>
//           Send Manual Alert
//         </button>
//       </div>

//       <table className="table table-bordered table-striped">
//         <thead className="table-dark">
//           <tr>
//             <th>Date</th>
//             <th>Time</th>
//             <th>Temperature (°C)</th>
//             <th>Altitude (m)</th>
//             <th>Pressure (hPa)</th>
//           </tr>
//         </thead>
//         <tbody>
//           {dataRows.map((entry, index) => (
//             <tr key={index}>
//               <td>{entry.date}</td>
//               <td>{entry.time}</td>
//               <td>{entry.temperature}</td>
//               <td>{entry.altitude}</td>
//               <td>{entry.pressure}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default App;
