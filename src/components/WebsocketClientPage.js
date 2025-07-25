import React, { useState, useEffect, useCallback  } from 'react';

let disconnectWebsocketGlobal = null;

let rd1 = 0;
let rd2 = 0;  
let rd3 = 0;

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
  const [ipAddress, setIpAddress] = useState('localhost');
  const [websocket, setWebsocket] = useState({client: false, status: 'Disconnected. Please connect.'});
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [state, setState] = useState([false, false, false]);
  const [port, setPort] = useState('5000');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 3; // Maximum number of reconnect attempts
  const reconnectInterval = 5000; // 5 seconds

  const connectWebsocket = useCallback (() => {
    console.log("connectWebsocket called ", ipAddress, port, reconnectAttempts);
    const socket = new WebSocket(`ws://${ipAddress}:${port}/api/ws`);
    setSocket(socket);  

    socket.onopen = () => {
      setWebsocket({client: true, status: 'Connected'});
      setReconnectAttempts(0);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const currentDate = formatDate(new Date());
      const message = `${currentDate} - ${data.message || data.status}`;
      setReceivedMessages(prev => [...prev, message]);
      setWebsocket({...websocket, status: 'incomming message...'});
    };

    socket.onerror = (event) => {
      console.log(`Error occurred: ${event}`);
      setWebsocket({...websocket, status: "Error: " + event.message || "Unknown error"});
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setWebsocket({...websocket, client: false, status: 'Disconnected.'});
      setSocket(null);
    };

  }, [ipAddress, port, reconnectAttempts]);

  useEffect(() => {
    return () => {
      console.log("WebsocketClientPage useEffect called");
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  const disconnectWebsocket = (e) => {
    console.log("disconnectWebsocket called");

    if (socket) {
      socket.close();
      //setSocket(null); 
      //setReconnectAttempts(maxReconnectAttempts); // Prevent auto-reconnect on manual disconnect          
    }
  };
 
  const toggleBtn = (event) => {
    console.log("toggleBtn called");
    const { id } = event.target;
    const newState = [...state];
    const sendData = {
      cmd: '',
      data: '',
      time: ''
    };

    console.log("Button ID:", id);

    if(id === "red-btn")
    {      
      if(newState[0] === false)
      {
        console.log("red checked");
        newState[0] = true;
        sendData.cmd = '11';
        sendData.data = 'Red on';  
        sendData.time = '101';
      } else {
        console.log("red unchecked");
        newState[0] = false;
        sendData.cmd = '12';
        sendData.data = 'Red off';  
        sendData.time = '101';
      }
    }
      
    if(id === "green-btn")
    {
      if(newState[1] === false)
      {
          console.log("green checked");
          newState[1] = true;
          sendData.cmd = '31';
          sendData.data = 'Green on';
          sendData.time = '101';    
      } else {
          console.log("green unchecked");
          newState[1] = false;
          sendData.cmd = '32';
          sendData.data = 'Green off';
          sendData.time = '101';

      }
    }
     
    if(id === "blue-btn")
    {
      if(newState[2] === false)
      {
        console.log("blue checked");
        newState[2] = true;
        sendData.cmd = '21';
        sendData.data = 'Blue on';
        sendData.time = '101';
      } else {
        console.log("blue unchecked");
        newState[2] = false;
        sendData.cmd = '22';
        sendData.data = 'Blue off';
        sendData.time = '101';
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
