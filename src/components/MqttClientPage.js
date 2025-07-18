import React, { useState, useEffect } from 'react';

const connectionOptions = [
  {
    name: "Test Server",  
  },
  {
    name: "Private Server",
  }
];

let disconnectMqttGlobal = null;

function MqttClientPage({ onLogout }) {
  const [selectedServer, setSelectedServer] = useState(connectionOptions[0]);
  const [mqttClient, setMqttClient] = useState(null);
  const [mqttStatus, setMqttStatus] = useState('Disconnected');
  const [publishMessage, setPublishMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]);

  const connectMqtt = () => {
    const serverIndex = connectionOptions.findIndex(option => option === selectedServer);
    
    fetch('http://localhost:5000/api/mqtt/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serverIndex }),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setMqttStatus(data.status);
      setMqttClient(true);
    })
    .catch(error => {
      console.error('Error:', error);
      setMqttStatus('Connection Failed');
    });
  };

  const disconnectMqtt = () => {
    if (!mqttClient) {  
      console.warn('No MQTT client to disconnect');
      return;
    }

    fetch('http://localhost:5000/api/mqtt/disconnect', {
      method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setMqttStatus(data.status);
      setMqttClient(false);
    })
    .catch(error => {
      console.error('Error:', error);
    });
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
      if (mqttClient) {
        const fakeMessage = `Received: Message at ${new Date().toLocaleTimeString()}`;
        setReceivedMessages(prev => [...prev, fakeMessage]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [mqttClient]);  

  // Assign the disconnectMqtt function to the global variable
  disconnectMqttGlobal = disconnectMqtt;

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
            onClick={connectMqtt} 
            disabled={mqttClient}
            style={{ width: '120px', height: "40px", padding: '5px 0' }}
          >
            Connect
          </button>
          <button 
            onClick={disconnectMqtt} 
            disabled={!mqttClient}
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
            disabled={!mqttClient}
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
        <p>Status: {mqttStatus}</p>  
      </div>  
    </div>
  );
}

// Export a function that can be called from outside to trigger disconnect
export function triggerMqttDisconnect() {
  if (disconnectMqttGlobal) {
    disconnectMqttGlobal();
  }
}

export { MqttClientPage }; 