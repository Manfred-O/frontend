import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate  } from 'react-router-dom';
import './App.css';
import {MqttClientPage, triggerMqttDisconnect   } from './components/MqttClientPage';
import {WebsocketClientPage, triggerWebsocketDisconnect } from './components/WebsocketClientPage';

function App() {
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [registeredServers, setRegisteredServers] = useState([]);
  const [isLogin, setIsLogin] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toggling, setToggling] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);
  const [activeForm, setActiveForm] = useState(''); // New state to track active form

  useEffect(() => {
    fetch('http://localhost:5000/api/http/hello')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setMessage(data.message)
        fetchServers();
        fetchUsers();      
      })
      .catch(error => {
        console.error('Error:', error)
        setMessage('Server is down or not responding');
      });
  }, []);

  useEffect(() => {
    const getImage = async () => {
      const response = await fetch('http://localhost:5000/api/http/image?' + new URLSearchParams({
         image: 'istockphoto-2167092274-1024x1024.jpg',
         }).toString());
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    };
    getImage();
  }, []);

  const fetchUsers = () => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/http/users')
      .then(response => response.json())
      .then(data => {
        setRegisteredUsers(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setIsLoading(false);
      });
  };

  const fetchServers = () => {
    fetch('http://localhost:5000/api/http/servers')
      .then(response => response.json())
      .then(data => {
        setRegisteredServers(data);
      })
      .catch(error => {
        console.error('Error fetching servers:', error);
      });
  };


  const handleLogin = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/http/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Login successful') {
          setLoggedIn(true);
        } else {
          alert('Invalid credentials. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Login failed. Please try again.');
      });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (username && email && password) {
      fetch('http://localhost:5000/api/http/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })
        .then(response => response.json())
        .then(data => {
          alert(data.message);
          setUsername('');
          setEmail('');
          setPassword('');
          fetchUsers();
          setIsLogin(true);
          setActiveForm('login'); // Switch to login form after registration
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Registration failed. Please try again.');
        });
    } else {
      alert('Please fill in all fields.');
    }
  };

  const renderActiveForm = () => {
    switch(activeForm) {
      case 'login':
        return renderLoginForm();
      case 'register':
        return renderRegisterForm();
      default:
        return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ marginTop: '10px', fontSize: '18px' }}>Welcome! Please login or register.</p>   
          <img src={imageUrl} style={{ width: '300px', height: 'auto' }} />
        </div>
      );
    }
  };

  const renderLoginForm = () => (
    <div>
      <p style={{ marginTop: '10px', fontSize: '18px' }}>Please login.</p> 
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );

  const renderRegisterForm = () => (
    <div>
      <p style={{ marginTop: '10px', fontSize: '18px' }}>Please register.</p> 
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );

  const renderServerList = () => (
    <div>
      <h2 style={{ fontWeight: 'bold', fontSize: '16px' }}>Registered Servers:</h2>
      {isLoading ? (
        <p>Loading servers...</p>
      ) : registeredServers.length > 0 ? (
        <ul>
          {registeredServers.map((user, index) => (
            <li style={{fontSize: '16px'}} key={index}>{user.name} - {user.host}</li>
          ))}
        </ul>
      ) : (
        <p>No servers found.</p>
      )}
    </div>
  );

  const renderUserList = () => (
    <div>
      <h2 style={{ fontWeight: 'bold', fontSize: '16px' }}>Registered Users:</h2>
      {isLoading ? (
        <p>Loading users...</p>
      ) : registeredUsers.length > 0 ? (
        <ul>
          {registeredUsers.map((user, index) => (
            <li style={{fontSize: '16px'}} key={index}>{user.username} - {user.email}</li>
          ))}
        </ul>
      ) : (
        <p>No registered users found.</p>
      )}
    </div>
  );

  const handleLogout = () => {
    console.log('Logging out...');
    //triggerMqttDisconnect(); // This will disconnect Mqtt if connected
    //triggerWebsocketDisconnect(); // This will disconnect Websocket if connected
    setLoggedIn(false);
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <Router>
      <div className="App">
        <div className="header">
          <h1 style={{ fontWeight: 'bold', fontSize: '18px' }}>{loggedIn ? `Welcome, ${username}` :  `${message}` }</h1>
          {loggedIn ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingRight : '20px' }}>
              <button className="toggle-button" onClick={() => setToggling(!toggling)}>
              <i class={`fa ${toggling ? 'fa-toggle-on' : 'fa-toggle-off'}`} style={{ fontSize: '18px', color: 'white'}}>
              </i></button>
              <button className="logout-button" onClick={handleLogout}>
              <i class="fa fa-sign-out" style={{ fontSize: '18px', color: 'white'}}>
              </i></button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingRight: '20px' }}>
              <button className="register-button" onClick={() => setActiveForm('register')}>
              <i class="fa fa-registered" style={{ fontSize: '18px', color: 'white'}}>
              </i></button>
              <button className="login-button" onClick={() => setActiveForm('login')}>
              <i class="fa fa-sign-in" style={{ fontSize: '18px', color: 'white'}}>
              </i></button>
            </div>
          )}
        </div> 
        <div className="main">
          <Routes>
            <Route path="/" element={
              loggedIn ? <Navigate to="/mqtt" /> : (
                <>
                  {renderActiveForm()}
                  {renderServerList()}
                  {renderUserList()}
                </>
              )
            } />
            <Route path="/mqtt" element={
              loggedIn ? toggling ? <MqttClientPage onLogout={handleLogout} onServers={registeredServers} /> :
                                    <WebsocketClientPage onLogout={handleLogout} onServers={registeredServers} />
              : <Navigate to="/" />
            } />
          </Routes>
        </div>
      <div className='footer'>
        <p>© 2025 My Fullstack App</p>
      </div>
    </div>
    </Router>
  );
}

export default App;