// ChannelItem.js
import React from 'react';
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

  return (
    <div style={itemStyle}>
      <div style={row1Style}>
        <span>
          <Link to={`/channel/${channel.channel_id}`} style={channelNameStyle}>
            {channel.channel_name}
          </Link>
        </span>
        <button style={deleteButtonStyle} onClick={() => onDelete(channel.channel_id)}>
          Delete
        </button>
      </div>
      <div style={createdByStyle}>Created By: {channel.created_by}</div>
    </div>
  );
};

export default ChannelItem;




