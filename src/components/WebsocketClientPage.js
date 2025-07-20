import React, { useState, useEffect } from 'react';

const connectionOptions = [
  {
    name: "Test Server",  
  },
  {
    name: "Private Server",
  }
];

let disconnectWebsocketGlobal = null;

function WebsocketClientPage({ onLogout }) {
  const [selectedServer, setSelectedServer] = useState(connectionOptions[0]);
  const [websocketClient, setWebsocketClient] = useState(null);
  const [websocketStatus, setWebsocketStatus] = useState('Disconnected');
  const [publishMessage, setPublishMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]);

  const connectWebsocket = () => {
    const serverIndex = connectionOptions.findIndex(option => option === selectedServer);
    
    const socket = new WebSocket('ws://localhost:5000/api/mqtt');

    socket.onopen = () => {
        // Send a message with a route identifier
        socket.send(JSON.stringify({
            route: 'connect',
            data: { topic: 'myTopic' }
    }));
    };

// Handle incoming messages
    socket.onmessage = (event) => {
        // Parse the incoming message
        const data = JSON.parse(event.data);

        // Handle the response
        console.log(`Received response: ${data}`);
        console.log(`Ready state: ${socket.readyState}`);
        
        setWebsocketStatus(data.message);
        setWebsocketClient(true);
    };

    // Handle errors
    socket.onerror = (event) => {
        console.log(`Error occurred: ${event}`);
    };

    const disconnectWebsocket = () => {
        if (!websocketClient) {
            console.warn('No WebSocket client to disconnect');
            return;
        }

        // Send a message to the server
        socket.send(JSON.stringify({ route: 'disconnect' }));
    };
  };
  
const handlePublish = () => {
  if (mqttClient && publishMessage) {
    fetch('http://localhost:5000/api/mqtt/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic: 'test/data', message: publishMessage }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Message published:', data);
      setReceivedMessages(prev => [...prev, `Sent: ${publishMessage}`]);
      setPublishMessage('');
    })
    .catch(error => {
      console.error('Error publishing message:', error);
      // Optionally, you can add error handling here, such as showing an error message to the user
    });
  }
};

  // Simulating receiving messages (replace this with actual MQTT subscription logic)
  useEffect(() => {
    const interval = setInterval(() => {
      if (websocketClient) {
        const fakeMessage = `Received: Message at ${new Date().toLocaleTimeString()}`;
        setReceivedMessages(prev => [...prev, fakeMessage]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [websocketClient]);  

  // Assign the disconnectWebsocket function to the global variable
  disconnectWebsocketGlobal = disconnectWebsocket;

  return (
    <div className="mqtt-client-page">
      <h2 style={{ fontWeight: 'bold', fontSize: '32px' }}>MQTT WebSocket Client</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          {connectionOptions.map((option, index) => (
            <label key={index} style={{ marginRight: '20px' }}>
              <input
                type="checkbox"
                name="serverOption"
                checked={selectedServer === option}
                onChange={() => setSelectedServer(option)}
              />
              {option.name}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button 
            onClick={connectWebsocket} 
            disabled={websocketClient}
            style={{ width: '120px', height: "40px", padding: '5px 0' }}
          >
            Connect
          </button>
          <button 
            onClick={disconnectWebsocket} 
            disabled={!websocketClient}
            style={{ width: '120px', height: "40px", padding: '5px 0' }}
          >
            Disconnect
          </button>
        </div>
        <div style={{ display: 'flex', width: '100%', marginBottom: '20px' }}>
          <input
            type="text"
            value={publishMessage}
            onChange={(e) => setPublishMessage(e.target.value)}
            placeholder="Enter message to publish"
            style={{ flex: 1, marginRight: '10px', padding: '10px' }}
          />
          <button 
            onClick={handlePublish}
            disabled={!websocketClient}
            style={{ width: '80px', height: "40px" }}
          >
            Send
          </button>
        </div>
        <div style={{ width: '100%', marginBottom: '20px' }}>
          <textarea
            readOnly
            value={receivedMessages.join('\n')}
            style={{ width: '100%', height: '200px', padding: '10px' }}
            placeholder="Received messages will appear here"
          />
        </div>
        <p>Status: {websocketStatus}</p>  
      </div>  
    </div>
  );
}

// Export a function that can be called from outside to trigger disconnect
export function triggerWebsocketDisconnect() {
  if (disconnectWebsocketGlobal) {
    disconnectWebsocketGlobal();
  }
}

export { WebsocketClientPage };