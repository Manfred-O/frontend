import React, { useState, useEffect } from 'react';

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

function WebsocketClientPage({ onLogout, onServers }) {
  const [ipAddress, setIpAddress] = useState('localhost:5000');
  const [selectedValue, setSelectedValue] = useState('value1');
  const [websocketClient, setWebsocketClient] = useState(null);
  const [websocketStatus, setWebsocketStatus] = useState('Disconnected');
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  const connectWebsocket = () => {
    const socket = new WebSocket(`ws://${ipAddress}/api/mqtt`);
    setSocket(socket);

    socket.onopen = () => {
      setWebsocketStatus('Connected');
      setWebsocketClient(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const currentDate = formatDate(new Date());
      const message = `${currentDate} - ${data.message || data.status}`;
      setReceivedMessages(prev => [...prev, message]);
    };

    socket.onerror = (event) => {
      console.log(`Error occurred: ${event}`);
      setWebsocketStatus('Error');
    };

    socket.onclose = () => {
      setWebsocketClient(false);
      setWebsocketStatus('Disconnected');
      setReceivedMessages([]);
    };
  }

  const disconnectWebsocket = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  const sendValue = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ route: 'publish', message: selectedValue }));
    }
  };

  disconnectWebsocketGlobal = disconnectWebsocket;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px' }}>
      <h2 style={{ fontWeight: 'bold', fontSize: '24px', marginBottom: '20px' }}>WebSocket Client</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          placeholder="Enter WebSocket IP address"
          style={{ width: '100%', padding: '10px' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={connectWebsocket} 
          disabled={websocketClient}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          Connect
        </button>
        <button 
          onClick={disconnectWebsocket} 
          disabled={!websocketClient}
          style={{ padding: '10px' }}
        >
          Disconnect
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '20px' }}>
          <input
            type="radio"
            value="value1"
            checked={selectedValue === 'value1'}
            onChange={() => setSelectedValue('value1')}
          />
          Value 1
        </label>
        <label style={{ marginRight: '20px' }}>
          <input
            type="radio"
            value="value2"
            checked={selectedValue === 'value2'}
            onChange={() => setSelectedValue('value2')}
          />
          Value 2
        </label>
        <label>
          <input
            type="radio"
            value="value3"
            checked={selectedValue === 'value3'}
            onChange={() => setSelectedValue('value3')}
          />
          Value 3
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={sendValue}
          disabled={!websocketClient}
          style={{ padding: '10px' }}
        >
          Send Value
        </button>
      </div>

      <textarea
        readOnly
        value={receivedMessages.join('\n')}
        style={{ flex: 1, width: '100%', padding: '10px' }}
        placeholder="Received messages will appear here"
      />

      <div style={{ marginTop: '20px', fontSize: '16px', textAlign: 'center'}}>
        <p>Status: {websocketStatus}</p>
      </div>
    </div>
  );
}

export function triggerWebsocketDisconnect() {
  if (disconnectWebsocketGlobal) {
    disconnectWebsocketGlobal();
  }
}

export { WebsocketClientPage };