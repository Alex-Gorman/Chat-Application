// ChannelItem.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ChannelItem = ({ channel, onDelete }) => {
  const itemStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    marginBottom: '10px',
    display: 'flex',
    flexDirection: 'column', // Stack elements vertically
    alignItems: 'stretch', // Stretch items horizontally
  };

  const row1Style = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const deleteButtonStyle = {
    cursor: 'pointer',
  };

  const channelNameStyle = {
    color: 'green',
    textDecoration: 'none',
    fontWeight: 'bold',
  };

  const createdByStyle = {
    fontSize: '14px',
    marginTop: '5px',
  };

  const [isUserAdmin, setIsUserAdmin] = useState(false);
  useEffect(() => {
    // Check if the user is already logged in when the component mounts
    const checkIfAdmin = async () => {
      try {
        const response = await fetch('http://localhost:3002/getCurrentUserName', {});
        const data = await response.json();

        if (response.status === 200 && data.currentUserName === 'Admin') {
          setIsUserAdmin(true);
        } else {
          setIsUserAdmin(false);
        }
      } catch (error) {
        console.error('Error during login check:', error);
      }
    };

    checkIfAdmin();
  }, []);

  return (
    <div style={itemStyle}>
      <div style={row1Style}>
        <span>
          <Link to={`/channel/${channel.channel_name}`} style={channelNameStyle}>
            {channel.channel_name}
          </Link>
        </span>
        {isUserAdmin && (
          <button style={deleteButtonStyle} onClick={() => onDelete(channel.channel_id)}>
            Delete
          </button>
)}

      </div>
      <div style={createdByStyle}>Created By: {channel.created_by}</div>
    </div>
  );
};

export default ChannelItem;





