import React, { useState, useEffect } from 'react';

function ChannelsPage() {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const labelStyle = {
    marginRight: '10px',
    fontSize: '16px',
  };

  const inputStyle = {
    padding: '5px',
    fontSize: '16px',
    marginRight: '10px',
  };

  const buttonStyle = {
    padding: '5px 10px',
    fontSize: '16px',
    backgroundColor: 'blue',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  };

  const [channelName, setChannelName] = useState('');
  const [channels, setChannels] = useState([]);

  const handleChannelNameChange = (e) => {
    setChannelName(e.target.value);
  }

  const handleCreateChannel = async (e) => {
    e.preventDefault();

    // Create a JavaScript object representing the new channel
    const newChannel = {
      channelName: channelName,
    };

    try {
      const response = await fetch('http://localhost:3002/postChannel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChannel), // Send newChannel directly
      });

      if (response.ok) {
        console.log('Channel created successfully.');
        setChannelName('');
        // // After creating the channel, fetch the updated list of channels
        // fetchChannels();
        // Fetch the updated list of channels and update the UI
        const updatedChannels = await fetchChannels();
        setChannels(updatedChannels);
      } else {
        console.error('Failed to create a new channel.');
      }
    } catch (error) {
      console.error('Failed to create a new channel.', error);
    }
  };

  // Function to fetch the list of channels
  const fetchChannels = async () => {
  try {
    const response = await fetch('http://localhost:3002/getChannels');

    if (response.ok) {
      const channelsData = await response.json();
      return channelsData; // Return the fetched channels data
    } else {
      console.error('Failed to fetch channels.');
    }
  } catch (error) {
    console.error('Error fetching channels:', error);
  }
};

  // const fetchChannels = async () => {
  //   try {
  //       const response = await fetch('http://localhost:3002/getChannels');

  //     if (response.ok) {
  //       const channelsData = await response.json();
  //       setChannels(channelsData); // Update the 'channels' state with the fetched data
  //     } else {
  //       console.error('Failed to fetch channels.');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching channels:', error);
  //   }
  // };

  // Fetch the list of channels when the component mounts
  useEffect(() => {
    fetchChannels();
  }, []);

  return (
    <div style={containerStyle}>
      <h1>Channels</h1>

      <h1>Create New Channel</h1>

      <form onSubmit={handleCreateChannel} style={formStyle}>
        <label style={labelStyle} htmlFor="channelName">
          Channel Name:
        </label>
        <input
          style={inputStyle}
          type="text"
          id="channelName"
          value={channelName}
          onChange={handleChannelNameChange}
        />
        <button style={buttonStyle} type="submit">Create Channel</button>
      </form>

      {/* Render the list of channels */}
      <h2>Channel List</h2>
      <ul>
        {channels.map((channel) => (
          <li key={channel.channel_id}>{channel.channel_name}</li>
        ))}
      </ul>
    </div>
  );
}

export default ChannelsPage;








