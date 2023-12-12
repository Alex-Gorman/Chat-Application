import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const centerContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  height: '100vh',
};

const buttonStyle = {
  margin: '10px',
  padding: '8px 16px',
  fontSize: '16px',
  cursor: 'pointer',
};

function ChannelPage() {
  const currentURL = window.location.href;
  const url = new URL(currentURL);
  const channelNameFromUrl = url.pathname.split('/').pop();

  const [channelExists, setChannelExists] = useState(true);
  const [messageContent, setMessageContent] = useState('');
  const [messages, setMessages] = useState([]);

  const checkChannelExists = async () => {
    try {
      const response = await fetch(`http://localhost:3002/checkChannel/${channelNameFromUrl}`);
      const data = await response.json();
      setChannelExists(data.exists);
    } catch (error) {
      console.error('Error checking channel:', error);
      setChannelExists(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3002/getMessages/${channelNameFromUrl}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    try {
      // Send a POST request to create a new message
      const response = await fetch('http://localhost:3002/postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName: channelNameFromUrl,
          content: messageContent,
          parentMessageId: null, // You may need to adjust this depending on your requirements
        }),
      });

      const data = await response.json();
      console.log(data.message);

      // Fetch updated messages after sending
      fetchMessages();

      // Reset the message content after sending
      setMessageContent('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Placeholder functions for handling reply, thumbs up, and thumbs down button clicks
  const handleReply = (messageId) => {
    console.log(`Reply button clicked for message ${messageId}`);
  };

  const handleThumbsUp = (messageId) => {
    console.log(`👍 button clicked for message ${messageId}`);
  };

  const handleThumbsDown = (messageId) => {
    console.log(`👎 button clicked for message ${messageId}`);
  };

  useEffect(() => {
    // Check if the channel exists on mount
    checkChannelExists();

    // Fetch messages on mount
    fetchMessages();
  }, [channelNameFromUrl]);

  return (
    <div style={centerContentStyle}>
      {channelExists ? (
        <>
          <h2>Channel Details</h2>
          <p>Channel Name: {channelNameFromUrl}</p>
          {/* Display messages */}
          <div>
            <h3>Messages:</h3>
            <ul>
              {messages.map((message) => (
                <li key={message.message_id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{message.username}:</strong> {message.content}
                    </div>
                    <div>
                      <button
                        style={{ ...buttonStyle, marginRight: '5px' }}
                        onClick={() => handleReply(message.message_id)}
                      >
                        Reply
                      </button>
                      <button
                        style={{ ...buttonStyle, marginRight: '5px' }}
                        onClick={() => handleThumbsUp(message.message_id)}
                      >
                        👍
                      </button>
                      <button style={buttonStyle} onClick={() => handleThumbsDown(message.message_id)}>
                        👎
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Message input and send button */}
          <div>
            <input
              type="text"
              placeholder="Type your message"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
            <button style={buttonStyle} onClick={handleSendMessage}>
              Send Message
            </button>
          </div>
          <Link to="/ChannelsPage">
            <button style={buttonStyle}>Go Back</button>
          </Link>
        </>
      ) : (
        <p>Channel not available</p>
      )}
    </div>
  );
}

export default ChannelPage;














