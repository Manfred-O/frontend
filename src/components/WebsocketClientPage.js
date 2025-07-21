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

function formatDate(date) {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function WebsocketClientPage({ onLogout }) {
  const [selectedServer, setSelectedServer] = useState(connectionOptions[0]);
  const [websocketClient, setWebsocketClient] = useState(null);
  const [websocketStatus, setWebsocketStatus] = useState('Disconnected');
  const [publishMessage, setPublishMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [inputUsed, setInputUsed] = useState(false);

  const connectWebsocket = () => {
    const serverIndex = connectionOptions.findIndex(option => option === selectedServer);
    
    const socket = new WebSocket('ws://localhost:5000/api/mqtt');
    setSocket(socket);

    socket.onopen = () => {
        // Send a message with a route identifier
        socket.send(JSON.stringify({
            route: 'connect',
            serverIndex: serverIndex
    }));
    };
  
// Handle incoming messages
    socket.onmessage = (event) => {
        // Parse the incoming message
        const data = JSON.parse(event.data);

        // Handle the response
        console.log(`Received response on topic ${data.topic}: ${data.message || data.status}`);
        console.log(`Ready state: ${socket.readyState}`);
        if(data.topic !== undefined && data.message) {
          const currentDate = formatDate(new Date());
          const message = `${currentDate} - ${data.topic} - ${data.message}`;
          setReceivedMessages(prev => [...prev, message]);
        }
        setWebsocketStatus(data.status || 'received');
        setWebsocketClient(true);
    };

    // Handle errors
    socket.onerror = (event) => {
        console.log(`Error occurred: ${event}`);
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed'); 
        setWebsocketClient(false);
        setWebsocketStatus('Disconnected');
        disconnectWebsocket();
        disconnectWebsocketGlobal = null;
        setReceivedMessages([]);
        setPublishMessage('');
        onLogout();
        // Reset the publish message
        setPublishMessage('');
    };
 
  }

    const disconnectWebsocket = () => {
        if (!websocketClient) {
            console.warn('No WebSocket client to disconnect');
            return;
        }

        // Send a message to the server
        socket.send(JSON.stringify({ route: 'disconnect' }));
        socket.close();
        setWebsocketClient(null);
    };

  const handlePublish = () => {
    console.log(`Publishing message: ${publishMessage}`);
    if (socket && publishMessage) {
      // Send a message to the server
      socket.send(JSON.stringify({ route: 'publish', topic: 'test/data', message: publishMessage }));
      //setPublishMessage(''); // Clear the input after sending
    }
  };

  // Assign the disconnectWebsocket function to the global variable
  disconnectWebsocketGlobal = disconnectWebsocket;  

  /*
  // Simulating receiving messages (replace this with actual MQTT subscription logic)
  useEffect(() => {
    const interval = setInterval(() => {
      if (mqttClient) {
        const fakeMessage = `Received: Message at ${new Date().toLocaleTimeString()}`;
        setReceivedMessages(prev => [...prev, fakeMessage]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [mqttClient]); 

style={{ width: '90%', height: 'calc(100% - 250px)', padding: '10px' }}
, alignItems: 'center', justifyContent: 'center',
*/

  return (
    <div className="mqtt-client-page" style={{ display: 'flex', height: '100vh', width: '100%' }}>

      {/* Left Area */}
      <div style={{display: 'flex', flex: 1, padding: '10px',  flexDirection: 'column'}}>
        <h2 style={{ fontWeight: 'bold', fontSize: '24px', marginBottom: '20px' }}>Received Messages</h2>

        <textarea
          readOnly
          value={receivedMessages.join('\n')}
          style={{ width: '90%', height: '600px', alignSelf: 'center',  padding: '10px'}}
          placeholder="Received messages will appear here"
        />

      </div>
      
      
      {/* Right Area */}
      <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontWeight: 'bold', fontSize: '24px', marginBottom: '20px' }}>MQTT WebSocket Client</h2>
        
        <div style={{ marginBottom: '20px' }}>
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

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={connectWebsocket} 
            disabled={websocketClient}
            style={{ flex: 1, height: "40px" }}
          >
            Connect
          </button>
          <button 
            onClick={disconnectWebsocketGlobal} 
            disabled={!websocketClient}
            style={{ flex: 1, height: "40px" }}
          >
            Disconnect
          </button>
        </div>

        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <input
            type="text"
            value={publishMessage}
            onChange={(e) => {
            setPublishMessage(e.target.value);
              if (!inputUsed) setInputUsed(true);
            }}
            placeholder={!inputUsed ? "Enter message to publish" : ""}
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