import React, { useState, useEffect, useRef} from 'react';

const reconnectInterval = 5000;
const reconnectMaxAttempts = 5;
const MAX_SPREADS = 30; // Maximum number of spreads

let disconnectMqttGlobal = null;

/**
 * Format a Date object into a string in the format of MM/DD/YYYY HH:MM:SS
 * @param {Date} date The Date object to be formatted
 * @returns {string} A string in the format of MM/DD/YYYY HH:MM:SS
 */
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

/**
 * The MqttClientPage component displays a MQTT client interface where users can connect to a MQTT server, select a topic, send a message, and receive messages.
 * The component is also responsible for handling the socket connection and reconnecting to the server if the connection is lost.
 * The component also displays a list of received messages and a status message at the bottom center of the page.
 * The component also has a logout button that disconnects the MQTT client and logs out the user.
 * @param {object} props - The component's props
 * @param {array} props.onServers - An array of registered MQTT servers
 * @param {function} props.onLogout - A function to call when the user logs out
 * @returns {ReactElement} - The component's JSX element
 */
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
  const [reconnectAttempts, setReconnectAttempts] = useState(0);    
 
  const mqttClientRef = useRef(null);

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

  useEffect(() => {
    console.log(receivedMessages.length);
  }, [receivedMessages]);

  {/* Reconnect logic 
  useEffect(() => {
    console.log("mqttClientPage useEffect reconnectAttempts", reconnectAttempts);
    if(!mqttClientRef.current) {
      return; // Early exit if mqttClientRef.current is null
    }

    if (reconnectAttempts < reconnectMaxAttempts)
    {
      console.log("Reconnecting to MQTT");
      connectMqtt();
    }
    else {
      console.log("Maximum reconnect attempts reached. Logout...");
      setSocket(null);
      onLogout();
      }
  }, [reconnectAttempts]);*/}

  useEffect(() => {
    console.log("MqttClientPage useEffect");

    if (!socket) {
      return; // Early exit if socket is null
    }

    /**
     * Event handler for when the MQTT connection is closed. If the
     * connection was closed intentionally, mqttClientRef.current is
     * null. If not, the connection was closed unexpectedly and we
     * should try to reconnect after a short delay.
     */
    socket.onclose = () => {
      
      console.log('Connection closed', (mqttClientRef.current === null ) ? 'intentionally' : 'unexpectedly');
              
      setMqttStatus('Disconnected');
      setReceivedMessages([]);
      setPublishMessage('');
      setMqttClient(false);
      setReconnectAttempts(0);  
      disconnectMqttGlobal = null;

      {/* Try to reconnect after a short delay    
      if(mqttClientRef.current) {
        mqttClientRef.current = null;  

        setTimeout(() => {
            console.log("Reconnecting to MQTT");
            connectMqtt();
        }, reconnectInterval);
      };*/}      
  
    };

    return () => {
      // Clean up the socket connection when the component unmounts
      if (socket) {
        console.log("MqttClientPage useEffect cleanup");
        mqttClientRef.current = null;  
        socket.close();
      }
    };

  }, [socket]);

  /**
   * Connects to the MQTT server with the selected server and sets up the WebSocket
   * connection to the server. Sends a message with a route identifier to the server
   * to initiate the connection. Handles incoming messages and errors from the server.
   * @returns {void}
   */
  const connectMqtt = () => {
    if (!selectedServer) {
      console.error("No server selected");
      return;
    }

    setRegisteredServers(onServers || []); 
    console.log("Registered servers:", registeredServers); 
    const serverIndex = registeredServers.findIndex(server => server.name === selectedServer.name);
    const socket = new WebSocket('ws://localhost:5000/api/ws');
    mqttClientRef.current = socket;
    setSocket(socket);

/**
 * Event handler for when the WebSocket connection is opened.
 * Sends a message to the server with a route identifier and the index
 * of the selected MQTT server to initiate the connection.
 */
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
          addMessage(message);
          //setReceivedMessages(prev => [...prev, message]);
        }
        setMqttStatus(data.status || 'received');
        setMqttClient(true);
    };

    // Handle errors
    socket.onerror = (event) => {
        console.log(`Error occurred: ${event.message}`);
        setReconnectAttempts(prev => prev + 1);   
    };

  }
  
/**
 * Adds a new message to the list of received messages.
 * If the number of received messages exceeds the maximum allowed,
 * it removes the oldest message to maintain the limit.
 *
 * @param {string} message - The message to be added to the list.
 */
  const addMessage = (message) => {
    setReceivedMessages((prevMessages) => {
      if (prevMessages.length >= MAX_SPREADS) {
        return [...prevMessages.slice(1), message];
      } else {
        return [...prevMessages, message];
      }
    });
  }

/**
 * Disconnects from the MQTT server.
 * This function sends a disconnect message to the server and sets the
 * WebSocket connection to null. It also sets a flag to indicate that
 * the disconnection was intentional.
 */
  const disconnectMqtt = () => {
    console.log("disconnectMqtt called");
    mqttClientRef.current = true;  // Set the flag to true to indicate intentional close
    // Send a message to the server
    socket.send(JSON.stringify({ route: 'disconnect' }));
    //socket.close();
    setSocket(null);
  };

/**
 * Publishes a message to the MQTT server.
 * This function sends a message to the MQTT server with the specified topic and message.
 * If the socket is not connected, or the topic or message is empty, it does nothing.
 *
 * @function
 */
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
    <div className="mqtt-client-page" style={{ display: 'flex', flexDirection: 'column', height: 'auto', width: '100%' }}>
      <div style={{ display: 'flex', flex: 1 }}>

        {/* Left Area */}
        <div style={{display: 'flex', flex: 1, padding: '10px',  flexDirection: 'column'}}>
          <h2 style={{ fontWeight: 'bold', fontSize: '24px', marginBottom: '20px' }}>Received Messages</h2>

          <textarea
            readOnly
            value={receivedMessages.join('\n')}
            style={{ width: '90%', height: '50vh', alignSelf: 'center',  padding: '10px'}}
            placeholder="Received messages will appear here"
          />

        </div>
        
        
        {/* Right Area */}
        <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '24px', marginBottom: '20px' }}>MQTT Client</h2>
          
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
              style={{ width: '80px', height: "40px", padding: '10px' }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Status message at the bottom center */}
      <div style={{ /*backgroundColor: '#282c34',*/ fontSize: '16px', height: '150px', paddingBottom: '55px', textAlign: 'center' }}>
        <p>Status: {MqttStatus}</p>
      </div>

    </div>    
  );
}

// Export a function that can be called from outside to trigger disconnect
function triggerMqttDisconnect() {
  if (disconnectMqttGlobal) {
    disconnectMqttGlobal();
  }
}

export { MqttClientPage , triggerMqttDisconnect };