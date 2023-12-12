import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const navStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    listStyle: 'none',
    padding: 0,
  };

  const navItemStyle = {
    marginRight: '20px',
    textDecoration: 'none',
    color: 'black',
    fontSize: '16px',
    cursor: 'pointer', // Add cursor pointer for clickable elements
  };

  const titleStyle = {
    marginRight: '200px',
    textDecoration: 'none',
    color: 'black',
    fontSize: '20px',
    fontWeight: 'bold',
  };

  const navbarContainerStyle = {
    borderBottom: '1px solid black', // Thin bottom border
    maxWidth: '80%', // Limit the width of the container
    margin: '0 auto', // Center the container horizontally
    paddingBottom: '10px', // Add some spacing between the navbar and the border
  };

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
    // Call the function when the component mounts
    const checkIfLoggedIn = async () => {
      try {
        const response = await fetch('http://localhost:3002/isUserLoggedIn', {});

        if (response.status === 200) {
          setIsUserLoggedIn(true);
        } else {
          setIsUserLoggedIn(false);
        }
      } catch (error) {
        console.error('Error during login:', error);
      }
    };
    checkIfLoggedIn();
  }, []); // The empty dependency array ensures this effect runs once when the component mounts

  return (
    <nav>
      <div style={navbarContainerStyle}>
        <ul style={navStyle}>

          <li style={titleStyle}>The Chat Room</li>

          <li style={navItemStyle}>
            <Link to="/" style={navItemStyle}>
              Home
            </Link>
          </li>

          <li style={navItemStyle}>
            <Link to="/LoginPage" style={navItemStyle}>
              Login
            </Link>
          </li>

          <li style={navItemStyle}>
            <Link to="/ChannelsPage" style={navItemStyle}>
              Channels
            </Link>
          </li>

          <li style={navItemStyle}>
            <Link to="/SearchPage" style={navItemStyle}>
                Search
            </Link>
          </li>

          <li style={navItemStyle}>
            <Link to="/LogoutPage" style={navItemStyle}>
                Logout
            </Link>
          </li>

          {/* <li style={navItemStyle}>
            <Link to="/AdminPage" style={navItemStyle}>
              Admin
            </Link>
          </li> */}



          {/* {isUserLoggedIn && (
            <li style={navItemStyle} onClick={handleLogout}>
              Logout
            </li>
          )} */}

        </ul>
      </div>
    </nav>
  );
}

export default Navbar;









