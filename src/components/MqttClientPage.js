import React, { useState } from 'react';

const connectionOptions = [
  {
    name: "Test Server",  
  },
  {
    name: "Private Server",
  }
];

function MqttClientPage({ onLogout }) {
  const [selectedServer, setSelectedServer] = useState(connectionOptions[0]);
  const [mqttClient, setMqttClient] = useState(null);
  const [mqttStatus, setMqttStatus] = useState('Disconnected');

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

  return (
    <div className="mqtt-client-page">
      <h2>MQTT WebSocket Client</h2>
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
      </div>
      <p>Status: {mqttStatus}</p>
      <button onClick={() => {
        disconnectMqtt();
        onLogout();
      }}>Logout</button>
    </div>
  );
}

export default MqttClientPage;