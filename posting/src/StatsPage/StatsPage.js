import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StatsPage() {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '20px', // Add padding at the top
  };

  const dropdownContainerStyle = {
    display: 'flex',
    flexDirection: 'row', // Make it horizontal
    alignItems: 'center',
    marginBottom: '20px', // Add some space between the dropdown and the button
  };

  const selectStyle = {
    marginRight: '10px', // Add margin to separate the select and the button
    padding: '10px',
    fontSize: '16px',
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  };

  const [selectedOption, setSelectedOption] = useState('mostPosts');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();
  const [userWithMostPosts, setUserWithMostPosts] = useState('');
  const [userWithMostPostsCount, setUserWithMostPostsCount] = useState('');
  const [userWithLeastPosts, setUserWithLeastPosts] = useState('');
  const [userPostCount, setUserPostCount] = useState('');

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const fetchUserWithMostPosts = async () => {
    try {
      setLoading(true); // Set loading to true before starting the fetch
      const response = await fetch(`http://localhost:3002/userWithMostPosts`);
      const data = await response.json();

      if (data.username) {
        setUserWithMostPosts(data.username);
        setUserPostCount(data.postCount);
        setSearchResult(`User: ${data.username}\nPosts: ${data.postCount}`);
      } else {
        setUserWithMostPosts('Unknown');
        setUserPostCount('Unknown');
        setSearchResult('Unknown');
      }
    } catch (error) {
      console.error('Error fetching user with most posts:', error);
      setSearchResult(null);
    } finally {
      setLoading(false); // Set loading to false after the fetch is complete
    }
  };

  const fetchUserWithLeastPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3002/userWithLeastPosts`);
      const data = await response.json();

      if (data.username) {
        setUserWithLeastPosts(data.username);
        setUserPostCount(data.postCount);
        setSearchResult(`User: ${data.username}\nPosts: ${data.postCount}`);
      } else {
        setUserWithLeastPosts('Unknown');
        setUserPostCount('Unknown');
        setSearchResult('Unknown');
      }
    } catch (error) {
      console.error('Error fetching user with least posts:', error);
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Add an effect that triggers the search when selectedOption changes
  useEffect(() => {
    handleSearch(); // Automatically trigger the search
  }, [selectedOption]); // Execute the effect when selectedOption changes

  const handleSearch = async () => {
    try {
      setSearchResult(null); // Clear searchResult before starting the new fetch
      setUserWithMostPosts(''); // Clear userWithMostPosts
      setUserWithLeastPosts(''); // Clear userWithLeastPosts
      setUserPostCount(''); // Clear userPostCount

      switch (selectedOption) {
        case 'mostPosts':
          await fetchUserWithMostPosts();
          break;
        case 'leastPosts':
          await fetchUserWithLeastPosts();
          break;
        case 'highestRanking':
          // Implement logic for highest ranking
          break;
        case 'lowestRanking':
          // Implement logic for lowest ranking
          break;
        default:
          setSearchResult(null);
      }
    } catch (error) {
      console.error('Error handling search:', error);
      setSearchResult(null);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={dropdownContainerStyle}>
        <select value={selectedOption} onChange={handleOptionChange} style={selectStyle}>
          <option value="mostPosts">User with most posts</option>
          <option value="leastPosts">User with least posts</option>
          <option value="highestRanking">User with highest message ranking</option>
          <option value="lowestRanking">User with lowest message ranking</option>
        </select>

        {/* <button style={buttonStyle} onClick={handleSearch} disabled={loading}>
          Search
        </button> */}
      </div>

      {loading && <p>Loading...</p>}
      {searchResult && (
        <div>
          <p>User: {selectedOption === 'mostPosts' ? userWithMostPosts : userWithLeastPosts}</p>
          <p>Posts: {userPostCount}</p>
        </div>
      )}
    </div>
  );
}

export default StatsPage;

