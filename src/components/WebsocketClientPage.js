import React, { useState, useEffect, useCallback  } from 'react';

const maxReconnectAttempts = 3; // Maximum number of reconnect attempts
const reconnectInterval = 5000; // 5 seconds
const MAX_SPREADS = 50; // Maximum number of spreads

let disconnectWebsocketGlobal = null;


/**
 * Format a Date object into a string in the format 'yyyy-mm-dd hh:mm:ss'
 * @param {Date} date The Date object to format
 * @returns {string} The formatted string
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
 * WebsocketClientPage is a React component that provides a WebSocket client
 * interface. The user can connect to a WebSocket server by entering the IP
 * address and port of the server. The component displays the received messages
 * in a text area and provides buttons to connect and disconnect from the
 * WebSocket server. The component also provides a toggle button to send a
 * value to the WebSocket server.
 * @param {object} props - The props passed to the component.
 * @param {function} props.onLogout - The function to call when the user
 *   clicks the logout button.
 * @param {function} props.onServers - The function to call when the user
 *   selects a server from the list of available servers.
 * @return {ReactElement} The WebsocketClientPage component.
 */
function WebsocketClientPage({ onLogout, onServers }) {
  const [ipAddress, setIpAddress] = useState('localhost');
  const [websocket, setWebsocket] = useState({client: false, status: 'Disconnected. Please connect.'});
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [state, setState] = useState([false, false, false]);
  const [port, setPort] = useState('5000');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);


  useEffect(() => {
    console.log(receivedMessages.length);
  }, [receivedMessages]);

  useEffect(() => {
    return () => {
      console.log("WebsocketClientPage useEffect cleanup");
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  
  const connectWebsocket = useCallback (() => {
    console.log("connectWebsocket called ", ipAddress, port, reconnectAttempts);
    const socket = new WebSocket(`wss://${ipAddress}:${port}`);
    //const socket = new WebSocket(`ws://${ipAddress}:${port}/api/ws`);
    setSocket(socket);  

    // Event listener for WebSocket connection open
    // When the connection is open, set the connection status to 'Connected'
    // and reset the reconnect attempts counter.
    socket.onopen = () => {
      setWebsocket({client: true, status: 'Connected'});
      setReconnectAttempts(0);
    };

    // Event listener for WebSocket messages
    // When a message is received from the server, it is parsed as JSON and
    // the message is formatted with the current date and time. The message
    // is then added to the received messages array and the connection status
    // is updated to indicate that an incoming message was received.
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const currentDate = formatDate(new Date());
      const message = `${currentDate} - ${data.message || data.status}`;
      addMessage(message);
      //setReceivedMessages(prev => [...prev, message]);
      setWebsocket({...websocket, status: 'incomming message...'});
    };

    // Event listener for WebSocket errors
    // When an error occurs, log the error to the console and update the
    // connection status to indicate the error. The error message is
    // included in the connection status.
    socket.onerror = (event) => {
      console.log(`Error occurred: ${event}`);
      setWebsocket({...websocket, status: "Error: " + event.message || "Unknown error"});
    };


    // Event listener for WebSocket connection close
    // When the connection is closed, log the closure to the console and update
    // the connection status to indicate that the connection is disconnected.
    // The connection object is also reset to null.
    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setWebsocket({...websocket, client: false, status: 'Disconnected.'});
      setSocket(null);
    };

  }, [ipAddress, port, reconnectAttempts]);

  /**
   * Disconnect the WebSocket manually. Called when the user clicks the
   * disconnect button. This prevents auto-reconnect on manual disconnect.
   * @param {object} e - The event object from the button click.
   */
  const disconnectWebsocket = (e) => {
    console.log("disconnectWebsocket called");

    if (socket) {
      socket.close();
      //setSocket(null); 
      //setReconnectAttempts(maxReconnectAttempts); // Prevent auto-reconnect on manual disconnect          
    }
  };
 
  
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
 * Toggles the state of the selected button and sends the new state to the websocket server.
 * @param {Event} event The event object passed to the function.
 * @property {String} id The id of the button that was clicke d.
 */
  const toggleBtn = (event) => {
    console.log("toggleBtn called");
    const { id } = event.target;
    const newState = [...state];
    const sendData = {
      cmd: '',
      data: '',
      time: ''
    };

    const currentDate = formatDate(new Date());

    console.log("Button ID:", id);

    if(id === "red-btn")
    {      
      if(newState[0] === false)
      {
        console.log("red checked");
        newState[0] = true;
        sendData.cmd = 111;
        sendData.data = 'Red on';  
        sendData.time = currentDate;
      } else {
        console.log("red unchecked");
        newState[0] = false;
        sendData.cmd = 112;
        sendData.data = 'Red off';  
        sendData.time = currentDate;
      }
    }
      
    if(id === "green-btn")
    {
      if(newState[1] === false)
      {
          console.log("green checked");
          newState[1] = true;
          sendData.cmd = 131;
          sendData.data = 'Green on';
          sendData.time = currentDate;    
      } else {
          console.log("green unchecked");
          newState[1] = false;
          sendData.cmd = 132;
          sendData.data = 'Green off';
          sendData.time = currentDate;

      }
    }
     
    if(id === "blue-btn")
    {
      if(newState[2] === false)
      {
        console.log("blue checked");
        newState[2] = true;
        sendData.cmd = 121;
        sendData.data = 'Blue on';
        sendData.time = currentDate;
      } else {
        console.log("blue unchecked");
        newState[2] = false;
        sendData.cmd = 122;
        sendData.data = 'Blue off';
        sendData.time = currentDate;
      }
    }


         
    // Update the state with the new values
    setState(newState);

    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("Sending data:", sendData);
      socket.send(JSON.stringify(sendData));
    }

    const web = {...websocket};
    const reconnect = reconnectAttempts;

    console.log('connection state', web.client, web.status , reconnect);

  }

/*
  const sendValue = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ route: 'publish', message: selectedValue }));
    }
  };
*/

  disconnectWebsocketGlobal = disconnectWebsocket;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'auto', width: '100%', padding: '0px 20px' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* Left Area */}
        <div style={{display: 'flex', flex: 1, padding: '10px',  flexDirection: 'column'}}>
          <h2 style={{ fontWeight: 'bold', fontSize: '24px', marginBottom: '20px' }}>Received Messages</h2>

          <textarea
            readOnly
            value={receivedMessages.join('\n')}
            style={{ width: '90%', height: '400px', alignSelf: 'center',  padding: '10px'}}
            placeholder="Received messages will appear here"
          />

        </div>

        {/* Right Area */}
        <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '24px', marginBottom: '20px' }}>WebSocket Client</h2>

          <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>     
              <input
                type="text"
                id="ipAddress"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="Enter WebSocket IP address"
                style={{flex: 1, padding: '10px', minWidth: '100px', maxWidth: '200px' }}
              />
              <label for="ipAddress" style={{alignContent: 'center', fontSize: '16px' }}>IP Address</label>
            
              <input
                type="text"
                id="port"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="Enter WebSocket Port"
                style={{flex: 1, padding: '10px', minWidth: '100px', maxWidth: '200px' }}
              />   
              <label for="port" style={{alignContent: 'center', fontSize: '16px' }}>Port</label>          
          </div>

          <div style={{display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px'}}>
            <button 
              onClick={connectWebsocket} 
              disabled={websocket.client}
              style={{ flex: 1, height: "40px", minWidth: '100px', maxWidth: '200px' }}
            >
              Connect
            </button>
            <button 
              onClick={(e) => disconnectWebsocket(e)} 
              disabled={!websocket.client}
              style={{ flex: 1, height: "40px", minWidth: '100px', maxWidth: '200px' }}
            >
              Disconnect
            </button>
          </div>

          {/** Radio Buttons */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{gap: '10px', marginRight: '20px' }}>
              <input
                key='red-btn'
                id='red-btn'
                type="radio"
                checked={state[0]}
                onClick={(e) => toggleBtn(e)}
              />
              red
            </label>
            <label style={{gap: '10px', marginRight: '20px' }}>
              <input
                key='green-btn'
                id='green-btn'
                type="radio"
                checked={state[1]}
                onClick={(e) => toggleBtn(e)}
              />
              green
            </label>
            <label style={{ marginRight: '20px' }}>
              <input
                key='blue-btn'
                id='blue-btn'
                type="radio"
                checked={state[2]}
                onClick={(e) => toggleBtn(e)}
              />
              blue
            </label>
          </div>

          {/* Send Value Button 
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={sendValue}
              disabled={!websocketClient}
              style={{ padding: '10px' }}
            >
              Send Value
            </button>
          </div>*/}

        </div>
      </div>

      <div style={{ marginBottom: '55px', fontSize: '16px', height: '150px', textAlign: 'center'}}>
        <p>Status: {websocket.status}</p>
      </div>

    </div>
  );
}

function triggerWebsocketDisconnect() {
  if (disconnectWebsocketGlobal) {
    disconnectWebsocketGlobal();
  }
}

export { WebsocketClientPage, triggerWebsocketDisconnect };
