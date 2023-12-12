import React, { useState, useEffect } from 'react';

function SearchPage() {
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

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSearch = () => {
    // Implement your search logic here
    console.log(`Search term: ${searchTerm}`);
    // You can send the search term to the server or perform any other search-related actions
  };

  return (
    <div style={containerStyle}>
      <h1>Search List</h1>

      {isUserLoggedIn ? (
        <>
          <form style={formStyle}>
            <label style={labelStyle} htmlFor="searchTerm">
              Search Term:
            </label>
            <input
              style={inputStyle}
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button style={buttonStyle} type="button" onClick={handleSearch}>
              Search
            </button>
          </form>
          
          {/* Render the list of channels or search results */}
          {/* <div>
            {channels && channels.map((channel) => (
              <ChannelItem key={channel.channel_id} channel={channel} onDelete={handleDeleteChannel} />
            ))}
          </div> */}

        </>
      ) : (
        <div>
          <p>Please login to see the search page.</p>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
