// // websocket.js
// class WebSocketMock {
//     constructor(onMessage) {
//       this.onMessage = onMessage;
//       this.start();
//     }

//     start() {
//       // Simulated stream of data every 3 seconds
//       setInterval(() => {
//         const dataPacket = JSON.stringify({
//           type: 'data',
//           payload: {
//             date: '14/04/2025',
//             time: new Date().toLocaleTimeString(),
//             temperature: (32 + Math.random() * 3).toFixed(2),
//             altitude: (297 + Math.random() * 2).toFixed(2),
//             pressure: (977 + Math.random()).toFixed(2),
//           },
//         });
//         this.onMessage({ data: dataPacket });
//       }, 3000);

//       // Random alert every 10 seconds (auto alert)
//       setInterval(() => {
//         const alert = JSON.stringify({
//           type: 'alert',
//           payload: `Automatic alert: abnormal behavior detected at ${new Date().toLocaleTimeString()}`,
//         });
//         this.onMessage({ data: alert });
//       }, 10000);
//     }

//     send(message) {
//       // Manual alert simulation
//       const alert = JSON.stringify({
//         type: 'alert',
//         payload: `Manual alert triggered: ${message}`,
//       });
//       this.onMessage({ data: alert });
//     }
//   }

//   export default WebSocketMock;

//   // websocket.js
// class WebSocketService {
//   constructor(url, onData, onAlert) {
//     this.url = url;
//     this.socket = null;
//     this.onData = onData;
//     this.onAlert = onAlert;
//   }

//   connect() {
//     this.socket = new WebSocket(this.url);

//     // WebSocket opened
//     this.socket.onopen = () => {
//       console.log('WebSocket connected');
//     };

//     // Handle incoming messages
//     this.socket.onmessage = (event) => {
//       const message = JSON.parse(event.data);

//       if (message.type === 'data') {
//         this.onData(message.payload);  // Pass data to the callback
//       } else if (message.type === 'alert') {
//         this.onAlert(message.payload); // Pass alert to the callback
//       }
//     };

//     // Handle WebSocket errors
//     this.socket.onerror = (error) => {
//       console.error('WebSocket Error:', error);
//     };

//     // WebSocket closed
//     this.socket.onclose = () => {
//       console.log('WebSocket connection closed');
//     };
//   }

//   // Send message to the backend (manual alert)
//   sendAlert(message) {
//     const alertMessage = JSON.stringify({
//       type: 'alert',
//       payload: message,
//     });
//     this.socket.send(alertMessage);
//   }

//   // Close the WebSocket connection
//   disconnect() {
//     if (this.socket) {
//       this.socket.close();
//     }
//   }
// }

// export default WebSocketService;

class WebSocketService {
  constructor(url, token, onData, onAlert) {
    // Append the token as a query parameter to the WebSocket URL
    // this.url = `${url}?token=${token}`;  // Adding the token as a query param
    this.url = `${url}`; // Adding the token as a query param
    this.onData = onData;
    this.onAlert = onAlert;
    this.socket = null;
  }

  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.error) {
        console.error("Auth failed:", message.error);
        return;
      }

      if (message.type === "data") {
        this.onData(message.payload);
      } else if (message.type === "alert") {
        this.onAlert(message.payload);
      }
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected");
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export default WebSocketService;
