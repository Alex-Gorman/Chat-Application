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

  const selectStyle = {
    padding: '5px',
    fontSize: '16px',
    marginRight: '10px',
  };

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState('content'); // Default search type

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

  const handleSearch = async () => {
    try {
      let url;
      if (searchType === 'username') {
        url = `http://localhost:3002/searchMessagesByUser/${searchTerm}`;
      } else {
        url = `http://localhost:3002/searchMessages/${searchTerm}`;
      }
  
      const response = await fetch(url);
  
      if (response.ok) {
        const searchResults = await response.json();
        setSearchResults(searchResults);
      } else {
        console.error('Failed to search messages.');
      }
    } catch (error) {
      console.error('Error during message search:', error);
    }
  };

  const [topUserWithMostPosts, setTopUserWithMostPosts] = useState(null);

  useEffect(() => {
    // Fetch the top user with most posts when the component mounts
    const fetchTopUserWithMostPosts = async () => {
      try {
        const response = await fetch('http://localhost:3002/getTopUserWithMostPosts');
        
        if (response.ok) {
          const topUser = await response.json();
          setTopUserWithMostPosts(topUser);
        } else {
          console.error('Failed to fetch top user with most posts.');
        }
      } catch (error) {
        console.error('Error during top user fetch:', error);
      }
    };

    fetchTopUserWithMostPosts();
  }, []); // Empty dependency array ensures this effect runs only once on mount
  

  return (
    <div style={containerStyle}>
      <h1>Search List</h1>
  
      {isUserLoggedIn ? (
        <>
          {searchType === 'userWithMostPosts' ? (
            <div>
              <h2>Top User with Most Posts</h2>
              {topUserWithMostPosts ? (
                <p>
                  <strong>Username:</strong> {topUserWithMostPosts.username}<br />
                  <strong>Number of Posts:</strong> {topUserWithMostPosts.postCount}
                </p>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          ) : (
            <>
              <form style={formStyle}>
                <label style={labelStyle} htmlFor="searchType">
                  Search Type:
                </label>
                <select
                  style={selectStyle}
                  id="searchType"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="content">Content</option>
                  <option value="username">Username</option>
                  <option value="userWithMostPosts">User with Most Posts</option>
                  <option value="userWithLeastPosts">User with Least Posts</option>
                  <option value="mostLikedPost">Most Liked Post</option>
                  <option value="postWithMostReplies">Post with Most Replies</option>
                </select>
  
                <button style={buttonStyle} type="button" onClick={handleSearch}>
                  Search
                </button>
              </form>
  
              {/* Display search results as a list */}
              <div>
                <h2>Search Results</h2>
                <ul>
                  {searchResults.map((result) => (
                    <li key={result.message_id}>
                      <strong>Content:</strong> {result.content}<br />
                      <strong>Username:</strong> {result.username}<br />
                      <strong>Channel:</strong> {result.channel_name}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
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


// {searchType === 'userWithMostPosts' || searchType === "userWithLeastPosts" || searchType === "mostLikedPost"  
//           || searchType === "postWithMostReplies" ?(
//             <div>
//               <form style={formStyle}>
//                 <label style={labelStyle} htmlFor="searchType">
//                   Search Type:
//                 </label>
//                 <select
//                   style={selectStyle}
//                   id="searchType"
//                   value={searchType}
//                   onChange={(e) => setSearchType(e.target.value)}
//                 >
//                   <option value="content">Content</option>
//                   <option value="username">Username</option>
//                   <option value="userWithMostPosts">User with Most Posts</option>
//                   <option value="userWithLeastPosts">User with Least Posts</option>
//                   <option value="mostLikedPost">Most Liked Post</option>
//                   <option value="postWithMostReplies">Post with Most Replies</option>
//                 </select>
  
//                 {searchType !== 'userWithMostPosts' || searchType != "userWithLeastPosts" || searchType != "mostLikedPost"
//                 || searchType != "postWithMostReplies"  && (
//                   <>
//                     <label style={labelStyle} htmlFor="searchTerm">
//                       Search Term:
//                     </label>
//                     <input
//                       style={inputStyle}
//                       type="text"
//                       id="searchTerm"
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                   </>
//                 )}
  
//                 <button style={buttonStyle} type="button" onClick={handleSearch}>
//                   Search
//                 </button>
//               </form>

//               <h2>Top 3 Users with Most Posts</h2>

//             </div>