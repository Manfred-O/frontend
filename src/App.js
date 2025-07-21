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
  const [isLogin, setIsLogin] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/hello')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error:', error));

    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/users')
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

  const handleLogin = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/login', {
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
      fetch('http://localhost:5000/api/register', {
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
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Registration failed. Please try again.');
        });
    } else {
      alert('Please fill in all fields.');
    }
  };

  const renderLoginForm = () => (
    <div>
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
        <button type="button" onClick={() => setIsLogin(false)}>Register</button>
      </form>
    </div>
  );

  const renderRegisterForm = () => (
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
      <button type="button" onClick={() => setIsLogin(true)}>Back to Login</button>
    </form>
  );

  const renderUserList = () => (
    <div>
      <h2 style={{ fontWeight: 'bold', fontSize: '32px' }}>Registered Users:</h2>
      {isLoading ? (
        <p>Loading users...</p>
      ) : registeredUsers.length > 0 ? (
        <ul>
          {registeredUsers.map((user, index) => (
            <li key={index}>{user.username} - {user.email}</li>
          ))}
        </ul>
      ) : (
        <p>No registered users found.</p>
      )}
    </div>
  );

  const handleLogout = () => {
    //triggerMqttDisconnect(); // This will disconnect MQTT if connected
    triggerWebsocketDisconnect(); // This will disconnect WebSocket if connected
    setLoggedIn(false);
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <Router>
      <div className="App">
        <div className="header">
          <h1 style={{ fontWeight: 'bold', fontSize: '24px' }}>{loggedIn ? `Welcome, ${username}` :  `${message}` }</h1>
        {loggedIn && (
          <button className="logout-button" onClick={handleLogout}>
          <i class="fa fa-sign-out" style={{ fontSize: '24px', color: 'white'}}>
          </i></button>
        )}
        </div> 
        <div className="main">
          <Routes>
            <Route path="/" element={
              loggedIn ? <Navigate to="/mqtt" /> : (
                <>
                  <h1 style={{ fontWeight: 'bold', fontSize: '32px' }}>Please login or register</h1>
                  {isLogin ? renderLoginForm() : renderRegisterForm()}
                  {renderUserList()}
                </>
              )
            } />
            <Route path="/mqtt" element={
              loggedIn ? <WebsocketClientPage onLogout={handleLogout} /> : <Navigate to="/" />
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