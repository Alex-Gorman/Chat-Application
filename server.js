const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const connection = mysql.createConnection({
    host: "mysql1",
    user: "root",
    password: "admin",
    database: "test_db"
});

const PORT = 3002;
const HOST = '0.0.0.0';
const app = express();

var currentUserName = '';
var isUserLoggedIn = false;


app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Welcome to MYSQL with Docker');
});

app.post('/postChannel', (req, res) => {
  console.log('Received a POST request to create a new channel');

  const newChannel = req.body;

  // Insert the new channel data into the 'channels' table
  connection.query(
    'INSERT INTO channels (channel_name, created_by) VALUES (?, ?)',
    [newChannel.channelName, currentUserName],
    (err, result) => {
      if (err) {
        console.error('Error inserting channel:', err);
        res.status(500).json({ message: 'Failed to create a new channel' });
      } else {
        console.log('Channel inserted successfully');
        res.status(200).json({ message: 'Channel created successfully' });
      }
    }
  );
});


app.get('/getChannels', (req, res) => {
  connection.query('SELECT * FROM channels', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to retrieve channels' });
      return;
    }
    console.log("Successfully got the channels");

    res.status(200).json(results);
  });
});


// Create the 'channels' table if it doesn't exist
connection.connect((err) => {
    if (err) throw err;

    connection.query(`
      CREATE TABLE IF NOT EXISTS channels (
        channel_id INT AUTO_INCREMENT PRIMARY KEY,
        channel_name VARCHAR(255) NOT NULL,
        created_by VARCHAR(255) NOT NULL
      )
    `, (err) => {
      if (err) throw err;
      console.log('Table "channels" created or already exists.');
    });

    connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        message_id INT AUTO_INCREMENT PRIMARY KEY,
        channel_name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        parent_message_id INT,
        FOREIGN KEY (parent_message_id) REFERENCES messages(message_id)
      )
    `, (err) => {
        if (err) throw err;
        console.log('Table "messages" created or already exists.');
    });

    connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `, (err) => {
    if (err) throw err;
    console.log('Table "users" created or already exists.');
    });

    // Hardcode one entry into the 'users' table
    connection.query(`
      INSERT INTO users (user_id, username, password)
      VALUES (0, 'Admin', 'Admin')
    `, (err) => {
      if (err) throw err;
      console.log('Default user "Admin" inserted successfully.');
    });


});



app.delete('/deleteChannel/:channelId', (req, res) => {
  const channelId = req.params.channelId;

  console.log("got here with ID"+channelId);

  // Check if the channel ID is a valid integer
  if (isNaN(channelId)) {
    res.status(400).json({ error: 'Invalid channel ID' });
    return;
  }

  // Delete the channel from the 'channels' table
  connection.query(
    'DELETE FROM channels WHERE channel_id = ?',
    [channelId],
    (err, result) => {
      if (err) {
        console.error('Error deleting channel:', err);
        res.status(500).json({ error: 'Failed to delete the channel' });
      } else if (result.affectedRows === 0) {
        // If no rows were affected, the channel with the given ID doesn't exist
        res.status(404).json({ error: 'Channel not found' });
      } else {
        console.log('Channel deleted successfully');
        res.status(200).json({ message: 'Channel deleted successfully' });
      }
    }
  );
});

app.post('/register', (req, res) => {
  console.log('Received a POST request to register a new user');

  const newUser = req.body;

  // Check if the username already exists
  connection.query(
    'SELECT * FROM users WHERE username = ?',
    [newUser.username],
    (err, results) => {
      if (err) {
        console.error('Error checking username:', err);
        res.status(500).json({ message: 'Failed to register a new user' });
      } else if (results.length > 0) {
        // Username already exists
        res.status(400).json({ message: 'Username already exists. Please choose another username.' });
      } else {
        // Username does not exist, proceed with registration
        connection.query(
          'INSERT INTO users (username, password) VALUES (?, ?)',
          [newUser.username, newUser.password],
          (err, result) => {
            if (err) {
              console.error('Error registering user:', err);
              res.status(500).json({ message: 'Failed to register a new user' });
            } else {
              console.log('User registered successfully');
              res.status(200).json({ message: 'User registered successfully' });
            }
          }
        );
      }
    }
  );
});

app.post('/getUser', (req, res) => {
  const { username, password } = req.body;

  // Check if the username and password match a record in the users table
  connection.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (error, results) => {
      if (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      } else {
        if (results.length > 0) {
          // User found in the database
          currentUserName = username;
          isUserLoggedIn = true;
          res.status(200).json({ message: 'Login successful' });

        } else {
          // User not found or invalid credentials
          res.status(401).json({ message: 'Invalid credentials' });
        }
      }
    }
  );
});

app.get('/isUserLoggedIn', (req, res) => {
  if (isUserLoggedIn === true) {
    res.status(200).json({ isLoggedIn: true });
  } else {
    res.status(400).json({ isLoggedIn: false });
  }
});

app.post('/logout', (req, res) => {
  currentUserName = '';
  isUserLoggedIn = false;
  res.status(200).json({ message: 'Logout successful' });
});

app.get('/checkChannel/:channelName', (req, res) => {
  const channelName = req.params.channelName;

  // Check if the channel with the given name exists
  connection.query('SELECT * FROM channels WHERE channel_name = ?', [channelName], (err, results) => {
    if (err) {
      console.error('Error checking channel existence:', err);
      res.status(500).json({ exists: false });
    } else {
      // If there are results, the channel exists; otherwise, it doesn't
      console.log("channel exists");
      const channelExists = results.length > 0;
      res.status(200).json({ exists: channelExists });
    }
  });
});

app.delete('/deleteUser/:username', (req, res) => {
  const usernameToDelete = req.params.username;

  // Delete the user from the 'users' table
  connection.query(
    'DELETE FROM users WHERE username = ?',
    [usernameToDelete],
    (err, result) => {
      if (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete the user' });
      } else if (result.affectedRows === 0) {
        // If no rows were affected, the user with the given username doesn't exist
        res.status(404).json({ error: 'User not found' });
      } else {
        console.log('User deleted successfully');
        res.status(200).json({ message: 'User deleted successfully' });
      }
    }
  );
});

app.get('/getCurrentUserName', (req, res) => {
  res.status(200).json({ currentUserName: currentUserName });
});

app.post('/postMessage', (req, res) => {
  console.log('Received a POST request to create a new message');

  const newMessage = req.body;

  // Insert the new message data into the 'messages' table
  connection.query(
    'INSERT INTO messages (channel_name, username, content, parent_message_id) VALUES (?, ?, ?, ?)',
    [newMessage.channelName, currentUserName, newMessage.content, newMessage.parentMessageId],
    (err, result) => {
      if (err) {
        console.error('Error inserting message:', err);
        res.status(500).json({ message: 'Failed to create a new message' });
      } else {
        console.log('Message inserted successfully');
        res.status(200).json({ message: 'Message created successfully' });
      }
    }
  );
});

app.get('/getMessages/:channelName', (req, res) => {
  const channelName = req.params.channelName;

  // Retrieve messages for the given channel from the 'messages' table
  connection.query('SELECT * FROM messages WHERE channel_name = ?', [channelName], (err, results) => {
    if (err) {
      console.error('Error retrieving messages:', err);
      res.status(500).json({ error: 'Failed to retrieve messages' });
    } else {
      console.log("Successfully got the messages for channel:", channelName);
      res.status(200).json(results);
    }
  });
});



app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});