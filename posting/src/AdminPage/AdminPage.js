import React, { useState, useEffect } from 'react';

function AdminPage() {
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

  const userContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    width: '300px', // Adjust the width as needed
    padding: '8px', // Add padding for the black box
    border: '1px solid black', // Add border for the black box
  };

  const usernameStyle = {
    marginRight: '10px', // Adjust margin as needed
  };

  const buttonStyle = {
    padding: '5px 10px',
    fontSize: '16px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  };

  // const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  useEffect(() => {
    // Fetch the list of users when the component mounts
    handleSearch();
  }, []); // The empty dependency array ensures that this effect runs only once, similar to componentDidMount

  const handleSearch = async () => {
    try {
      // Fetch the list of users from the server
      const response = await fetch('http://localhost:3002/getUsers');
      const data = await response.json();

      // Update the state with the list of users
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDeleteUser = async (username) => {
    try {
      // Make a DELETE request to delete the user with the given userId
      const response = await fetch(`http://localhost:3002/deleteUser/${username}`, {
        method: 'DELETE',
      });
  
      if (response.status === 200) {
        // User deleted successfully, update the local state
        setUsers((prevUsers) => prevUsers.filter((user) => user.username !== username));
      } else {
        console.error('Error deleting user:', response.statusText);
        alert('Failed to delete user. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  return (
    <div style={containerStyle}>
      <h1>Users List</h1>

      {isUserAdmin ? (
        <>

          <h1>Search bar</h1>

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

          <h1>Users List</h1>

          {/* Display the list of users with delete buttons */}
          <div>
            {users && users.map((user) => (
              <div key={user.user_id} style={userContainerStyle}>
                <p style={usernameStyle}>{user.username}</p>
                {user.username !== 'Admin' && ( // Exclude "Admin" user from having a delete button
                  <button
                    style={buttonStyle}
                    type="button"
                    onClick={() => handleDeleteUser(user.username)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>

        </>
      ) : (
        <div>
          <p>Must be an Admin to access.</p>
        </div>
      )}
    </div>
  );
}

export default AdminPage;