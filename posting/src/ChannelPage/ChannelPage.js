import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const containerStyle = {
  margin: '0 auto', // This will center the container horizontally
};

const centerContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left', // Align text to the left
  alignItems: 'center',
  // alignItems: 'flex-start', // Update alignment to 'flex-start'
  justifyContent: 'flex-start',
  height: '100vh',
  border: '2px solid blue', // Add this line to include the border
  padding: '20px', // Add padding for better visual appearance
};

const buttonStyle = {
  margin: '5px',
  cursor: 'pointer',
  padding: '4px 8px', // Adjust padding to make the buttons smaller
  fontSize: '12px', // Adjust font size for smaller text
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

  // Move the logic to update vote counts directly within fetchMessages
const fetchMessages = async () => {
  try {
    const response = await fetch(`http://localhost:3002/getMessages/${channelNameFromUrl}`);
    const data = await response.json();
    
    // Update vote counts for each message
    const updatedMessages = await Promise.all(data.map(async (message) => {
      // Fetch vote counts for the message
      const votes = await fetch(`http://localhost:3002/getVotes/${message.message_id}`);
      const votesData = await votes.json();

      // Return the message with updated vote counts
      return {
        ...message,
        thumbsUpCount: votesData.upVoteCount,
        thumbsDownCount: votesData.downVoteCount,
      };
    }));

    setMessages(updatedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

// Effect to initialize the vote counts from localStorage on component mount
useEffect(() => {
  fetchMessages();
}, [channelNameFromUrl]);

  // const fetchMessages = async () => {
  //   try {
  //     const response = await fetch(`http://localhost:3002/getMessages/${channelNameFromUrl}`);
  //     const data = await response.json();
  //     setMessages(data);
  //     // alert(messages[0]);
  //   } catch (error) {
  //     console.error('Error fetching messages:', error);
  //   }
  // };

  // useEffect(() => {
  //   if (messages.length > 0) {
  //     // alert(messages[0]);
  //   }
  // }, [messages]); 

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
  // const handleReply = (messageId) => {
  //   console.log(`Reply button clicked for message ${messageId}`);
  //   alert(`Reply button clicked for message ${messageId}`);
  // };
  // New state variables for reply functionality
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyMessageContent, setReplyMessageContent] = useState('');
  const [replyToMessageId, setReplyToMessageId] = useState(null);

  // Function to toggle the visibility of the reply input box
  const toggleReplyBox = (messageId) => {
    setShowReplyBox(!showReplyBox);
    setReplyMessageContent('');
    setReplyToMessageId(messageId);
  };

  const handleReplySendMessage = async () => {
    try {
      // Send a POST request to create a new reply message
      const response = await fetch('http://localhost:3002/postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName: channelNameFromUrl,
          content: replyMessageContent,
          parentMessageId: replyToMessageId,
          // username: currentUserName, // Use the state variable directly
        }),
      });
  
      const data = await response.json();
      console.log(data.message);
  
      // Fetch updated messages after sending the reply
      fetchMessages();
  
      // Reset reply state variables
      setShowReplyBox(false);
      setReplyMessageContent('');
      setReplyToMessageId(null);
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };  

  useEffect(() => {
    // Check if the channel exists on mount
    checkChannelExists();

    // Fetch messages on mount
    fetchMessages();
  }, [channelNameFromUrl]);

  const handleScreenshot = async (messageId) => {
    try {
      // Create an input element for file selection
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      // Add an event listener for when the user selects a file
      input.addEventListener('change', async (event) => {
        const file = event.target.files[0];

        if (file) {
          try {
            // Read the file as a data URL
            const dataUrl = await readFileAsDataURL(file);

            // Send a POST request to create a new message with the image
            await fetch('http://localhost:3002/postMessage', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                channelName: channelNameFromUrl,
                content: dataUrl, // Simply send the dataUrl directly
                parentMessageId: messageId,
              }),
            });

            // Fetch updated messages after sending
            fetchMessages();
          } catch (error) {
            console.error('Error sending screenshot message:', error);
          }
        }
      });

      // Trigger a click event on the input element to open the file dialog
      input.click();
    } catch (error) {
      console.error('Error handling screenshot:', error);
    }
  };

  // Helper function to read a file as a data URL
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  // Function to render content based on its type
  const renderContent = (content) => {
    if (content.startsWith('data:image')) {
      // If the content starts with 'data:image', assume it's an image
      return <img src={content} alt="user uploaded" style={{ maxWidth: '100%' }} />;
    } else if (typeof content === 'string' && content.startsWith('./Images/')) {
      content = content.replace("./Images/", "");
      return <img src={`http://localhost:3002/getImages/${content}`} alt="user uploaded" style={{ maxWidth: '50%' }} />;
    } else {
      // Otherwise, render it as text
      return <span>{content}</span>;
    }
  };

  // const renderMessagesWithIndentation = (messages, parentMessageId = null) => {
  //   return (
  //     <ul style={{ listStyleType: 'none', padding: 0 }}>
  //       {messages
  //         .filter((message) => message.parent_message_id === parentMessageId)
  //         .map((message) => (
  //           <li
  //             key={message.message_id}
  //             style={{
  //               marginBottom: '10px',
  //               border: '2px solid black',
  //               padding: '10px',
  //               marginLeft: parentMessageId ? '20px' : '0', // Add indentation for child messages
  //             }}
  //           >
  //             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  //               <div>
  //                 <strong>{message.username}:</strong> {renderContent(message.content)}
  //               </div>
  //               <div>
  //                 <button style={buttonStyle} onClick={() => toggleReplyBox(message.message_id)}>
  //                   Reply
  //                 </button>
  //                 {message.username === 'Admin' && (
  //                   <button style={{ ...buttonStyle, marginRight: '5px' }} onClick={() => handleDeleteMessage(message.message_id)}>
  //                     Delete
  //                   </button>
  //                 )}
  //                 <button style={{ ...buttonStyle, marginRight: '5px' }}>👍 {message.thumbsUpCount || 0}</button>
  //                 <button style={buttonStyle}>👎 {message.thumbsDownCount || 0}</button>
  //               </div>
  //             </div>
  //             {/* Show reply input box if the current message is being replied to */}
  //             {showReplyBox && replyToMessageId === message.message_id && (
  //               <div style={{ margin: '10px 0' }}>
  //                 <input
  //                   type="text"
  //                   placeholder="Type your reply"
  //                   value={replyMessageContent}
  //                   onChange={(e) => setReplyMessageContent(e.target.value)}
  //                 />
  //                 <button style={{ ...buttonStyle, marginLeft: '5px' }} onClick={handleReplySendMessage}>
  //                   Send
  //                 </button>
  //               </div>
  //             )}
  //             {/* Render child messages recursively */}
  //             {renderMessagesWithIndentation(messages, message.message_id)}
  //           </li>
  //         ))}
  //     </ul>
  //   );
  // };
  

  // const handleDeleteMessage = async (messageId) => {
  //   alert("Delete button pressed");
  // }

  const handleDeleteMessage = async (messageId) => {
    try {
      // Send a DELETE request to delete the message
      const response = await fetch(`http://localhost:3002/deleteMessage/${messageId}`, {
        method: 'DELETE',
      });
  
      const data = await response.json();
      console.log(data.message);
  
      // Fetch updated messages after deleting
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  

  const [currentUserName, setCurrentUserName] = useState('');
  
  useEffect(() => {
    const fetchCurrentUserName = async () => {
      try {
        const response = await fetch('http://localhost:3002/getCurrentUserName');
        const data = await response.json();
        setCurrentUserName(data.currentUserName);
      } catch (error) {
        console.error('Error fetching current user name:', error);
      }
    };

    fetchCurrentUserName();
  }, []); // Empty dependency array to ensure this effect runs only once on mount
  

  // // Recursive function to render messages with indentation
  // const renderMessagesWithIndentation = (messages, parentMessageId = null) => {

  //   return (
  //     <ul style={{ listStyleType: 'none', padding: 0 }}>
  //       {messages
  //         .filter((message) => message.parent_message_id === parentMessageId)
  //         .map((message) => (
  //           <li
  //             key={message.message_id}
  //             style={{
  //               marginBottom: '20px', // Increased margin to create more space between messages
  //               border: '2px solid black',
  //               padding: '15px', // Increased padding for better visual appearance
  //             }}
  //           >
  //             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
  //               <div style={{ marginBottom: '10px', width: '100%' }}>
  //                 <strong>{message.username}:</strong> {renderContent(message.content)}
  //               </div>
  //               <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
  //                 <div>
  //                   <button style={{ ...buttonStyle, marginRight: '5px' }} onClick={() => handleVote(message.message_id, 'up')}>👍 {message.thumbsUpCount || 0}</button>
  //                   <button style={buttonStyle} onClick={() => handleVote(message.message_id, 'down')}>👎 {message.thumbsDownCount || 0}</button>
  //                   <button style={buttonStyle} onClick={() => toggleReplyBox(message.message_id)}>Reply</button>
  //                   {currentUserName === 'Admin' && (
  //                     <button style={buttonStyle} onClick={() => handleDeleteMessage(message.message_id)}>
  //                       Delete
  //                     </button>
  //                   )}
  //                   {/* <button style={buttonStyle} onClick={() => handleDeleteMessage(message.message_id)}>Delete</button> */}
  //                 </div>
  //                 {/* Show reply input box if the current message is being replied to */}
  //                 {showReplyBox && replyToMessageId === message.message_id && (
  //                   <div style={{ marginLeft: '10px' }}>
  //                     <input
  //                       type="text"
  //                       placeholder="Type your reply"
  //                       value={replyMessageContent}
  //                       onChange={(e) => setReplyMessageContent(e.target.value)}
  //                     />
  //                     <button style={{ ...buttonStyle, marginLeft: '5px' }} onClick={handleReplySendMessage}>
  //                       Send
  //                     </button>
  //                   </div>
  //                 )}
  //               </div>
  //             </div>
  //             {/* Render child messages recursively */}
  //             {renderMessagesWithIndentation(messages, message.message_id)}
  //           </li>
  //         ))}
  //     </ul>
  //   );
  // };

  const renderMessagesWithIndentation = (messages, parentMessageId = null) => {
    return (
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {messages
          .filter((message) => message.parent_message_id === parentMessageId)
          .map((message) => (
            <li
              key={message.message_id}
              style={{
                marginBottom: '20px',
                border: '2px solid black',
                padding: '15px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ marginBottom: '10px', width: '100%' }}>
                  {/* <strong style={{ color: message.username === 'Admin' ? 'red' : 'inherit' }}>
                    {message.username}{message.username === 'Admin' ? ' [A]:' : ':'}
                  </strong> {renderContent(message.content)} */}
                  <strong style={{
                      color: message.username === 'Admin'
                        ? 'red'
                        : message.username === channelCreator
                        ? 'blue'
                        : 'inherit'
                    }}>
                    {message.username} {message.username === 'Admin' ? ' [A]:' : message.username === channelCreator ? ' [C]:' : ':'}

                  </strong> {renderContent(message.content)}
                </div>
                {/* <div style={{ marginBottom: '10px', width: '100%' }}>
                  <strong style={{
                    color: message.username === 'Admin' ? 'red' :
                      message.username === 'channelcreator' ? 'blue' : 'inherit'
                  }}>
                    {message.username}
                    {message.username === 'Admin' ? ' [A]:' :
                      message.username === 'channelcreator' ? ' [C]:' : ':'}
                  </strong> {renderContent(message.content)}
                </div> */}

                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    {/* Thumbs up and down buttons are always visible */}
                    <button style={{ ...buttonStyle, marginRight: '5px' }} onClick={() => handleVote(message.message_id, 'up')}>👍 {message.thumbsUpCount || 0}</button>
                    <button style={buttonStyle} onClick={() => handleVote(message.message_id, 'down')}>👎 {message.thumbsDownCount || 0}</button>
                    {/* Reply and delete buttons are conditionally visible */}
                    {message.username !== '[deleted]' && (
                      <>
                        <button style={buttonStyle} onClick={() => toggleReplyBox(message.message_id)}>Reply</button>
                        {currentUserName === 'Admin' && (
                          <button style={buttonStyle} onClick={() => handleDeleteMessage(message.message_id)}>
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  {message.username !== '[deleted]' && (
                    <div>
                      {/* Show reply input box if the current message is being replied to */}
                      {showReplyBox && replyToMessageId === message.message_id && (
                        <div style={{ marginLeft: '10px' }}>
                          <input
                            type="text"
                            placeholder="Type your reply"
                            value={replyMessageContent}
                            onChange={(e) => setReplyMessageContent(e.target.value)}
                          />
                          <button style={{ ...buttonStyle, marginLeft: '5px' }} onClick={handleReplySendMessage}>
                            Send
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* Render child messages recursively */}
              {renderMessagesWithIndentation(messages, message.message_id)}
            </li>
          ))}
      </ul>
    );
  };
  
  
  

  // const handleVote = async (messageId, voteType) => {
  //   var username = currentUserName;
  
  //   try {
  //     const response = await fetch('http://localhost:3002/postVote', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         messageId,
  //         username,
  //         voteType,
  //       }),
  //     });
  
  //     const data = await response.json();
  //     console.log(data.message); // Log the server response
  
  //     // Fetch updated messages after voting
  //     await fetchMessages();
  
  //     // Fetch the vote count after voting
  //     const votes = await fetch(`http://localhost:3002/getVotes/${messageId}`);
  //     const votesData = await votes.json();
  
  //     const upVotes = votesData.upVoteCount;
  
  //     alert(upVotes);
  
  //     // Update the state with the new upvote count for the specific message
  //     setMessages((prevMessages) =>
  //       prevMessages.map((message) =>
  //         message.message_id === messageId
  //           ? { ...message, thumbsUpCount: upVotes }
  //           : message
  //       )
  //     );
  
  //     // Handle success or error response as needed
  //   } catch (error) {
  //     console.error('Error during voting:', error);
  //     // Handle error
  //   }
  // };

  // Function to get the vote counts from localStorage
const getVoteCountsFromLocalStorage = (messageId) => {
  try {
    if (localStorage) {
      const storedVotes = localStorage.getItem(`votes_${messageId}`);
      return storedVotes ? JSON.parse(storedVotes) : { upVotes: 0, downVotes: 0 };
    } else {
      console.error('Local storage is not available');
      return { upVotes: 0, downVotes: 0 };
    }
  } catch (error) {
    console.error('Error getting vote counts from local storage:', error);
    return { upVotes: 0, downVotes: 0 };
  }
};

// Function to update the vote counts in localStorage
const updateVoteCountsInLocalStorage = (messageId, upVotes, downVotes) => {
  try {
    if (localStorage) {
      localStorage.setItem(`votes_${messageId}`, JSON.stringify({ upVotes, downVotes }));
    } else {
      console.error('Local storage is not available');
    }
  } catch (error) {
    console.error('Error updating vote counts in local storage:', error);
  }
};


  const handleVote = async (messageId, voteType) => {
    try {
      const username = currentUserName;
  
      // Send vote request
      const response = await fetch('http://localhost:3002/postVote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          username,
          voteType,
        }),
      });
  
      const data = await response.json();
      console.log(data.message); // Log the server response
  
      // Fetch updated messages after voting
      await fetchMessages();
  
      // Fetch the vote count after voting
      const votes = await fetch(`http://localhost:3002/getVotes/${messageId}`);
      const votesData = await votes.json();
  
      // Update the state with the new upvote and downvote counts for the specific message
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.message_id === messageId
            ? {
                ...message,
                thumbsUpCount: votesData.upVoteCount,
                thumbsDownCount: votesData.downVoteCount,
              }
            : message
        )
      );
  
      // Update localStorage with the new vote counts
      updateVoteCountsInLocalStorage(messageId, votesData.upVoteCount, votesData.downVoteCount);
  
      // Handle success or error response as needed
    } catch (error) {
      console.error('Error during voting:', error);
      // Handle error
    }
  };
  
  // Effect to initialize the vote counts from localStorage on component mount
  useEffect(() => {
    setMessages((prevMessages) =>
      prevMessages.map((message) => {
        const { upVotes, downVotes } = getVoteCountsFromLocalStorage(message.message_id);
        return {
          ...message,
          thumbsUpCount: upVotes,
          thumbsDownCount: downVotes,
        };
      })
    );
  }, []);


  //////// bottom handlevote is better  

  // const handleVote = async (messageId, voteType) => {
  //   var username = currentUserName;
  
  //   try {
  //     // Send vote request
  //     const response = await fetch('http://localhost:3002/postVote', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         messageId,
  //         username,
  //         voteType,
  //       }),
  //     });
  
  //     const data = await response.json();
  //     console.log(data.message); // Log the server response
  
  //     // Fetch updated messages after voting
  //     await fetchMessages();
  
  //     // Fetch the vote count after voting
  //     const votes = await fetch(`http://localhost:3002/getVotes/${messageId}`);
  //     const votesData = await votes.json();
  
  //     const upVotes = votesData.upVoteCount;
  //     const downVotes = votesData.downVoteCount;
  
  //     // Update the state with the new upvote count for the specific message
  //     setMessages((prevMessages) =>
  //       prevMessages.map((message) =>
  //         message.message_id === messageId
  //           ? { ...message, thumbsUpCount: upVotes , thumbsDownCount: downVotes}
  //           : message
  //       )
  //     );
  
  //     // Handle success or error response as needed
  //   } catch (error) {
  //     console.error('Error during voting:', error);
  //     // Handle error
  //   }
  // };

  const [channelCreator, setChannelCreator] = useState('');

  const fetchChannelCreator = async () => {
    try {
      const response = await fetch(`http://localhost:3002/getChannelCreator/${channelNameFromUrl}`);
      const data = await response.json();

      if (data.creator) {
        setChannelCreator(data.creator);
      } else {
        setChannelCreator('Unknown'); // You can set a default value or handle this case as needed
      }
    } catch (error) {
      console.error('Error fetching channel creator:', error);
    }
  };

  useEffect(() => {
    // Fetch the channel creator when the component mounts or when the channelNameFromUrl changes
    fetchChannelCreator();
  }, [channelNameFromUrl]);
  
  

  return (
    <div style={containerStyle}>
      <div style={centerContentStyle}>
        {channelExists ? (
          <>
            <Link to="/ChannelsPage">
              <button style={buttonStyle}>Go Back</button>
            </Link>
            <h2>{channelNameFromUrl}</h2>
            <p>
            Created By:{' '}
            <strong style={{ color: channelCreator === 'Admin' ? 'red' : 'blue' }}>
              {channelCreator}
              {channelCreator === 'Admin' && ' [A]'}
              {channelCreator != 'Admin' && ' [C]'}
            </strong>
          </p>
            {/* Display messages */}
            <div>{renderMessagesWithIndentation(messages)}</div>
            {/* <div>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {messages.map((message) => (
                  <li
                    key={message.message_id}
                    style={{
                      marginBottom: '10px',
                      border: '2px solid black',
                      padding: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{message.username}:</strong> {renderContent(message.content)}
                      </div>
                      <div>
                        <button style={{ ...buttonStyle, marginRight: '5px' }}>
                          👍 {message.thumbsUpCount || 0}
                        </button>
                        <button style={buttonStyle}>
                          👎 {message.thumbsDownCount || 0}
                        </button>
                        <button style={buttonStyle} onClick={() => toggleReplyBox(message.message_id)}>
                          Reply
                        </button>
                      </div>
                    </div>
                    
                    {showReplyBox && replyToMessageId === message.message_id && (
                      <div style={{ margin: '10px 0' }}>
                        <input
                          type="text"
                          placeholder="Type your reply"
                          value={replyMessageContent}
                          onChange={(e) => setReplyMessageContent(e.target.value)}
                        />
                        <button
                          style={{ ...buttonStyle, marginLeft: '5px' }}
                          onClick={handleReplySendMessage}
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div> */}
            {/* Message input, Send Message, and Screenshot buttons */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Type your message"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
              <button style={{ ...buttonStyle, marginLeft: '5px' }} onClick={handleSendMessage}>
                Send Message
              </button>
              {/* Add Screenshot button */}
              <button style={{ ...buttonStyle, marginLeft: '5px' }} onClick={() => handleScreenshot()}>
                Screenshot
              </button>
            </div>
          </>
        ) : (
          <p>Channel not available</p>
        )}
      </div>
    </div>
  );
}

export default ChannelPage;
