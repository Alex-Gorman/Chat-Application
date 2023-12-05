import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
    const location = useLocation();

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

    return (
        <nav>
            <div style={navbarContainerStyle}>
                <ul style={navStyle}>
                    <li style={titleStyle}>
                        The Chat Room
                    </li>
                    <li style={navItemStyle}>
                        <Link to="/" style={navItemStyle}>Home</Link>
                    </li>
                    <li style={navItemStyle}>
                        <Link to="/LoginPage" style={navItemStyle}>Login</Link>
                    </li>
                    <li style={navItemStyle}>
                        <Link to="/ChannelsPage" style={navItemStyle}>Channels</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;






