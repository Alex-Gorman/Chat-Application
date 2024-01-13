import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import ChannelPage from '/code/posting/src/ChannelPage/ChannelPage.js';
import ChannelItem from '/code/posting/src/ChannelItem/ChannelItem.js';

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
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const [doesChannelExist, getChannelName] = useState('');

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

  const handleChannelNameChange = (e) => {
    setChannelName(e.target.value);
  }

  useEffect(() => {
    // Check if the user is already logged in when the component mounts
    const checkIfChannelExists = async () => {
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

    checkIfChannelExists();
  }, []);

  const handleCreateChannel = async (e) => {
    e.preventDefault();

    // Check if the user is logged in before creating a channel
    if (!isUserLoggedIn) {
      alert('Please login to create a channel.');
      return;
    }

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
        body: JSON.stringify(newChannel),
      });

      if (response.ok) {
        console.log('Channel created successfully.');
        setChannelName('');
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

  const handleDeleteChannel = async (channelId) => {
    try {
      const response = await fetch(`http://localhost:3002/deleteChannel/${channelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Channel deleted successfully.');
        const updatedChannels = await fetchChannels();
        setChannels(updatedChannels);
      } else {
        console.error('Failed to delete the channel.');
      }
    } catch (error) {
      console.error('Failed to delete the channel.', error);
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

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchChannels();
      setChannels(data);
    };

    fetchData();
  }, []);

  return (
    <div style={containerStyle}>
      <h1>Channels</h1>

      {isUserLoggedIn ? (
        <>
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
          <div>
            {channels && channels.map((channel) => (
              <ChannelItem key={channel.channel_id} channel={channel} onDelete={handleDeleteChannel} />
            ))}
          </div>

          <Routes>
            <Route path="/ChannelsPage/*" element={<ChannelsPage />}>
              <Route index element={<ChannelPage />} />
              <Route path="channel/:channelName" element={<ChannelPage />} />
            </Route>
          </Routes>



        </>
      ) : (
        <div>
          <p>Please login to see channels.</p>
        </div>
      )}
    </div>
  );
}

export default ChannelsPage;









