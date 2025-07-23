import React, { useState, useEffect } from 'react';

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
  const [ipAddress, setIpAddress] = useState('192.168.0.16');
  const [selectedValue, setSelectedValue] = useState('value1');
  const [websocketClient, setWebsocketClient] = useState(null);
  const [websocketStatus, setWebsocketStatus] = useState('Disconnected');
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [state, setState] = useState([false, false, false]);
  const [port, setPort] = useState('8001');

  const connectWebsocket = () => {
    const socket = new WebSocket(`wss://${ipAddress}:${port}`);
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
 
  const toggleBtn = (event) => {
    const { id, checked } = event.target;
    const newState = [...state];
    const sendData = {
      cmd: '',
      data: '',
      time: ''
    };
    
    console.log("toggleBtn called");
    console.log("Button ID:", id);

    if(id === "red-btn")
    {      
      console.log("newState[0]:", newState[0]);     
      if((checked == true) && (newState[0] !== true))
      {
        console.log("red checked");
        newState[0] = true;
        sendData.cmd = '11';
        sendData.data = 'Red on';
        sendData.time = '101';
      }
      else
      {
        console.log("red unchecked");
        newState[0] = false;
        sendData.cmd = '12';
        sendData.data = 'Red off';  
        sendData.time = '101';
      }  
    }
      
    if(id === "green-btn")
    {
        console.log("newState[1]:", newState[1]);
      if((checked == true) && (newState[1] !== true))
      {
        console.log("green checked");
        newState[1] = true;
        sendData.cmd = '31';
        sendData.data = 'Green on';
        sendData.time = '101';
      }
      else
      {        
        console.log("green unchecked");
        newState[1] = false;
        sendData.cmd = '32';
        sendData.data = 'Green off';
        sendData.time = '101';
      }     
    }
       
    if(id === "blue-btn")
    {
        console.log("newState[2]:", newState[2]);
      if((checked == true) && (newState[2] !== true))
      {
        console.log("blue checked");
        newState[2] = true;
        sendData.cmd = '21';
        sendData.data = 'Blue on';
        sendData.time = '101';
      }
      else
      {
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
      socket.send(JSON.stringify(sendData));
    }

  }


  const sendValue = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ route: 'publish', message: selectedValue }));
    }
  };

  disconnectWebsocketGlobal = disconnectWebsocket;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', padding: '20px' }}>
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
          <h2 style={{ fontWeight: 'bold', fontSize: '24px', marginBottom: '20px' }}>WebSocket Client</h2>

          <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>     
              <input
                type="text"
                id="ipAddress"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="Enter WebSocket IP address"
                style={{flex: 1, width: '100%', padding: '10px', minWidth: '100px' }}
              />
              <label for="ipAddress" style={{alignContent: 'center', fontSize: '16px' }}>IP Address</label>
            
              <input
                type="text"
                id="port"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="Enter WebSocket Port"
                style={{flex: 1,  width: '100%', padding: '10px', minWidth: '100px' }}
              />   
              <label for="port" style={{alignContent: 'center', fontSize: '16px' }}>Port</label>          
          </div>

          <div style={{display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px'}}>
            <button 
              onClick={connectWebsocket} 
              disabled={websocketClient}
              style={{ flex: 1, height: "40px", minWidth: '100px', maxWidth: '200px' }}
            >
              Connect
            </button>
            <button 
              onClick={disconnectWebsocket} 
              disabled={!websocketClient}
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

          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={sendValue}
              disabled={!websocketClient}
              style={{ padding: '10px' }}
            >
              Send Value
            </button>
          </div>
        </div>
      </div>

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
