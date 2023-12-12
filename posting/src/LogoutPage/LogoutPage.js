import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutPage() {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginTop: '20px',
  };

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3002/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Logout successful
        console.log('Logout successful');
        setIsUserLoggedIn(false); // Update the state to reflect user log out
        navigate('/LoginPage'); // Redirect to the login page or another appropriate page
      } else {
        // Handle logout failure, show an error message, or take appropriate action
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
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

  return (
    <div style={containerStyle}>
      <h1>Logout</h1>

      {isUserLoggedIn ? (
        <>
          {/* Render the list of channels */}

          <button style={buttonStyle} onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <div>
          <p>Please login to see the Logout Page.</p>
        </div>
      )}
    </div>
  );
}

export default LogoutPage;
