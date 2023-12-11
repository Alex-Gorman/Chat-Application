import React from 'react';

function HomePage() {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column', // Stack elements vertically
    justifyContent: 'flex-start', // Align content at the top
    alignItems: 'center',
    height: '100vh',
    padding: '50px 200px', // Adjusted padding for the top and bottom
  };

  const paragraphStyle = {
    textAlign: 'left', // Align text to the left
    marginBottom: '20px', // Add margin between paragraphs
  };

  const boldTextStyle = {
    ...paragraphStyle,
    fontSize: '20px',
    fontWeight: 'bold',
  };

  return (
    <div style={containerStyle}>
      <p style={boldTextStyle}>
        This chat application allows users to create channels, view all channels,
        select a channel and post messages to that channel, and post replies to existing messages.
      </p>
      <p style={paragraphStyle}>
        Welcome! <br />
        Please Login to continue.
      </p>
    </div>
  );
}

export default HomePage;






