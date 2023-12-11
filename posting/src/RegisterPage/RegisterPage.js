
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column', // Stack elements vertically
    justifyContent: 'flex-start', // Align content at the top
    alignItems: 'center',
    height: '100vh',
  };

  const inputContainerStyle = {
    display: 'flex',
    flexDirection: 'row', // Align elements in a row
    marginBottom: '15px', // Add margin between input elements
    alignItems: 'center', // Align items vertically in input container
  };

  const labelStyle = {
    marginRight: '10px', // Add space between label and input
    textAlign: 'left', // Left-align the label
    width: '80px', // Set a fixed width for labels
  };

  const inputStyle = {
    padding: '5px',
    fontSize: '16px',
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'row', // Align buttons in a row
    alignItems: 'center', // Align items vertically in button container
  };

  const buttonStyle = {
    padding: '5px 10px',
    fontSize: '16px',
    margin: '5px', // Add margin between buttons
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:3002/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();
      console.log(data.message); // Log the server response

      // Check if the registration was successful
      if (response.status === 200) {
        // Display an alert if registration is successful
        alert('User registered successfully!');
        navigate('/LoginPage');
      } else if (response.status === 400) {
        alert('User already exists');
      } else {
        // Handle other cases if needed
        alert('Failed to register user. Please try again.');
      }

      // Handle success or error response as needed
    } catch (error) {
      console.error('Error during registration:', error);
      // Handle error
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Register</h2>

      <div style={inputContainerStyle}>
        <label style={labelStyle} htmlFor="username">
          Username:
        </label>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div style={inputContainerStyle}>
        <label style={labelStyle} htmlFor="password">
          Password:
        </label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div style={buttonContainerStyle}>
        <button type="button" onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
}

export default RegisterPage;
