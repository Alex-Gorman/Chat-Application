import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: '100vh',
  };

  const inputContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: '15px',
    alignItems: 'center',
  };

  const labelStyle = {
    marginRight: '10px',
    textAlign: 'left',
    width: '80px',
  };

  const inputStyle = {
    padding: '5px',
    fontSize: '16px',
    width: '200px', // Adjust the width for consistency with the RegisterPage
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  };

  const buttonStyle = {
    padding: '5px 10px',
    fontSize: '16px',
    margin: '5px',
  };

  useEffect(() => {
    // Check if the user is already logged in when the component mounts
    const checkIfLoggedIn = async () => {
      try {
        const response = await fetch('http://localhost:3002/isUserLoggedIn', {});

        if (response.status === 200) {
          setIsUserLoggedIn(true);
        } else {
          setIsUserLoggedIn(false);
        }
      } catch (error) {
        console.error('Error during login check:', error);
      }
    };

    checkIfLoggedIn();
  }, []);

  const handleLoginClick = async () => {
    try {
      // Assuming your server endpoint for login is "/api/login"
      const response = await fetch('http://localhost:3002/getUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.status === 200) {
        // Successful login, you can redirect or perform any other actions here
        console.log('Login successful');
        navigate('/ChannelsPage');
      } else if (response.status === 401) {
        // Unauthorized, show an error message
        alert('Invalid credentials. Please try again.');
        console.error('Login failed');
      } else {
        // Handle other status codes if needed
        alert('Failed to login. Please try again.');
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleRegisterClick = () => {
    // Navigate to the RegisterPage
    navigate('/RegisterPage');
  };

  return (
    <div style={containerStyle}>
      <h2>Login</h2>

      {isUserLoggedIn ? (
        <div>
          <p>Already Logged In. Logout to use another user.</p>
        </div>
      ) : (
        <>
          <div style={inputContainerStyle}>
            <label style={labelStyle} htmlFor="username">
              Username:
            </label>
            <input
              style={inputStyle}
              type="text"
              id="username"
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
              style={inputStyle}
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={buttonContainerStyle}>
            <button style={buttonStyle} type="button" onClick={handleLoginClick}>
              Login
            </button>
            <button style={buttonStyle} type="button" onClick={handleRegisterClick}>
              Register
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default LoginPage;









