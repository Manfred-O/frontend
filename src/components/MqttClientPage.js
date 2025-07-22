import React, { useState, useEffect } from 'react';

let disconnectMqttGlobal = null;

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

function MqttClientPage({ onLogout, onServers }) {
  const [registeredServers, setRegisteredServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [topicServer, setSelectedTopic] = useState('');
  const [MqttClient, setMqttClient] = useState(null);
  const [MqttStatus, setMqttStatus] = useState('Disconnected');
  const [publishMessage, setPublishMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [inputUsed, setInputUsed] = useState(false);  

  useEffect(() => {
    // Set registered servers when the component mounts
    setRegisteredServers(onServers || []);
  }, [onServers]);

  useEffect(() => {
    // Set the first server as selected when registeredServers are loaded
    if (registeredServers.length > 0 && !selectedServer) {
      setSelectedServer(registeredServers[0]);
    }
  }, [registeredServers, selectedServer]);

  useEffect(() => {
    // Set the first topic as selected when a server is selected
    if (selectedServer && selectedServer.topics.length > 0) {
      setSelectedTopic(selectedServer.topics[0].value);
    }
  }, [selectedServer]);

  const connectMqtt = () => {
    if (!selectedServer) {
      console.error("No server selected");
      return;
    }

    setRegisteredServers(onServers || []); 
    console.log("Registered servers:", registeredServers); 

    const serverIndex = registeredServers.findIndex(server => server.name === selectedServer.name);
    
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
        setMqttStatus(data.status || 'received');
        setMqttClient(true);
    };

    // Handle errors
    socket.onerror = (event) => {
        console.log(`Error occurred: ${event}`);
    };

    socket.onclose = () => {
        console.log('Mqtt connection closed'); 
        setMqttClient(false);
        setMqttStatus('Disconnected');
        disconnectMqtt();
        disconnectMqttGlobal = null;
        setReceivedMessages([]);
        setPublishMessage('');
        onLogout();
        // Reset the publish message
        setPublishMessage('');
    };
 
  }

    const disconnectMqtt = () => {
        if (!MqttClient) {
            console.warn('No Mqtt client to disconnect');
            return;
        }

        // Send a message to the server
        socket.send(JSON.stringify({ route: 'disconnect' }));
        //socket.close();
        setMqttClient(null);
    };

  const handlePublish = () => {
    console.log(`Publishing message: ${publishMessage}`);
    if (socket && publishMessage && topicServer) {
      console.log(`Sending message to topic ${topicServer}: ${publishMessage}`);
      // Send a message to the server
      socket.send(JSON.stringify({ route: 'publish', topic: topicServer , message: publishMessage }));
      //setPublishMessage(''); // Clear the input after sending
    }
  };

  // Assign the disconnectMqtt function to the global variable
  disconnectMqttGlobal = disconnectMqtt;  

  return (
    <div className="mqtt-client-page" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <div style={{ display: 'flex', flex: 1 }}>

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
          <h2 style={{ fontWeight: 'bold', fontSize: '24px', marginBottom: '20px' }}>MQTT Mqtt Client</h2>
          
          <div style={{ marginBottom: '20px', fontSize: '16px' }}>
            {registeredServers.map((option, index) => (
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

          {/* Connect/Disconnect buttons in the middle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', maxWidth: '300px' }}>
              <button 
                onClick={connectMqtt} 
                disabled={MqttClient}
                style={{ flex: 1, height: "40px", minWidth: '100px' }}
              >
                Connect
              </button>
              <button 
                onClick={disconnectMqtt} 
                disabled={!MqttClient}
                style={{ flex: 1, height: "40px", minWidth: '100px' }}
              >
                Disconnect
              </button>
            </div>
          </div>

          <h2 style={{ fontWeight: 'bold', fontSize: '24px', marginBottom: '20px' }}>Select Topic</h2>

          <div style={{ marginBottom: '20px', fontSize: '16px' }}>
            {selectedServer && selectedServer.topics.map((option, index) => (
              <label key={index} style={{ marginRight: '20px' }}>
                <input
                  type="checkbox"
                  name="topicOption"
                  checked={topicServer === option.value}
                  onChange={() => setSelectedTopic(option.value)}
                />
                {option.label}
              </label>
            ))}
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
              disabled={!MqttClient}
              style={{ width: '80px', height: "40px" }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Status message at the bottom center */}
      <div style={{ fontSize: '16px', paddingBottom: '55px', textAlign: 'center'}}>
        <p>Status: {MqttStatus}</p>
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