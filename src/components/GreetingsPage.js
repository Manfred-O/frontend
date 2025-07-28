
import React, { useState, useEffect } from 'react';

function GreetingsPage({ onFetchServers, onFetchUsers }) {
  const [servers, setServers] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoadingServers, setIsLoadingServers] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchServers();
    }, []);

  const fetchUsers = () => {
    setIsLoadingUsers(true);
    fetch('http://localhost:5000/api/http/users')
      .then(response => response.json())
      .then(data => {
        setUsers(data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setIsLoadingUsers(false);
        setUsers([]);
      });
    setIsLoadingUsers(false);
  };

  const fetchServers = () => {
    setIsLoadingServers(true);
    fetch('http://localhost:5000/api/http/servers')
      .then(response => response.json())
      .then(data => {
        setServers(data);
      })
      .catch(error => {
        console.error('Error fetching servers:', error);
        setServers([]);
      });
    setIsLoadingServers(false);
  };

const handleFetchServers = async () => {
    console.log('Fetching servers...');
    setIsLoadingServers(true);
    try {
        const fetchedServers = await Promise.resolve(onFetchServers());
        console.log('Fetched servers:', fetchedServers);
        if (fetchedServers !== null && Array.isArray(fetchedServers)) {
        setServers(fetchedServers);
        } else {
        console.error('Invalid server data received');
        setServers([]);
        }
    } catch (error) {
        console.error('Error fetching servers:', error);
        setServers([]);
    } finally {
        setIsLoadingServers(false);
    }
};

  const handleFetchUsers = async () => {
    console.log('Fetching users...');
    setIsLoadingUsers(true);
    try{
        const fetchedUsers = await Promise.resolve(onFetchUsers());
        console.log('Fetched users:', fetchedUsers);
        if (fetchedUsers!== null && Array.isArray(fetchedUsers)) {
        setUsers(fetchedUsers);
        } else {
        console.error('Invalid user data received');
        setUsers([]);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
    } finally {
        setIsLoadingUsers(false);
    }
  };

  const renderServerList = () => (
    <div>
      <h2 style={{ fontWeight: 'bold', fontSize: '16px' }}>Registered Servers:</h2>
      {isLoadingServers ? (
        <p>Loading servers...</p>
      ) : servers && servers.length > 0 ? (
        <ul>
          {servers.map((server, index) => (
            <li style={{fontSize: '16px'}} key={index}>{server.name} - {server.host}</li>
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
      {isLoadingUsers ? (
        <p>Loading users...</p>
      ) : users.length > 0 ? (
        <ul>
          {users.map((user, index) => (
            <li style={{fontSize: '16px'}} key={index}>{user.username} - {user.email}</li>
          ))}
        </ul>
      ) : (
        <p>No registered users found.</p>
      )}
    </div>
  );

  return (
    <div style={{ textAlign: 'center', marginTop: '30px' }}>
      <h1 style={{fontSize: '24px'}}>Welcome and Greetings!</h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
        <button onClick={handleFetchServers}>Fetch Servers</button>
        <button onClick={handleFetchUsers}>Fetch Users</button>
      </div>
      <div style={{ marginTop: '20px' }}>
        {renderServerList()}
        {renderUserList()}
      </div>
    </div>
  );
}

export default GreetingsPage;