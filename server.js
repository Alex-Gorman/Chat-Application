const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


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

// Set up multer storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 } // 10MB limit
}).single('screenshot');


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
      CREATE TABLE IF NOT EXISTS message_votes (
        vote_id INT AUTO_INCREMENT PRIMARY KEY,
        message_id INT,
        username VARCHAR(255) NOT NULL,
        votetype ENUM('up', 'down') NOT NULL
      )
    `, (err) => {
      if (err) throw err;
      console.log('Table "message_votes" created or already exists.');
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

    // Hardcode 'Admin' entry into the 'users' table if it doesn't exist
    connection.query(`
    SELECT * FROM users WHERE username = 'Admin'
    `, (err, results) => {
    if (err) {
      throw err;
    }

    if (results.length === 0) {
      // 'Admin' user doesn't exist, insert it
      connection.query(`
        INSERT INTO users (user_id, username, password)
        VALUES (0, 'Admin', 'Admin')
      `, (err) => {
        if (err) {
          throw err;
        }
        console.log('Default user "Admin" inserted successfully.');
      });
    } else {
      console.log('Default user "Admin" already exists.');
    }
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

        // Update messages in the 'messages' table with [deleted] for the deleted username
        connection.query(
          'UPDATE messages SET username = "[deleted]" WHERE username = ?',
          [usernameToDelete],
          (err, updateResult) => {
            if (err) {
              console.error('Error updating messages:', err);
              res.status(500).json({ error: 'Failed to update messages' });
            } else {
              console.log('Messages updated successfully');
              res.status(200).json({ message: 'User and associated messages deleted/updated successfully' });
            }
          }
        );
      }
    }
  );
});


app.get('/getCurrentUserName', (req, res) => {
  console.log(currentUserName);
  res.status(200).json({ currentUserName: currentUserName });
});

app.post('/postMessage', (req, res) => {
  console.log('Received a POST request to create a new message');

  const newMessage = req.body;

  // Check if the content is an image (base64-encoded)
  const isImage = newMessage.content.startsWith('data:image/');

  if (isImage) {
    try {
      // Extract the base64 data from the content
      const base64Data = newMessage.content.replace(/^data:image\/\w+;base64,/, '');

      // Generate a unique filename for the image
      const filename = `image_${Date.now()}.png`;

      // Save the image to the server directory ../Images
      const imagePath = `./Images/${filename}`;
      console.log(imagePath);
      fs.writeFileSync(imagePath, base64Data, 'base64');


      console.log(newMessage.parentMessageId);

      // Insert the new message data into the 'messages' table with the image path
      connection.query(
        'INSERT INTO messages (channel_name, username, content, parent_message_id) VALUES (?, ?, ?, ?)',
        [newMessage.channelName, currentUserName, imagePath, newMessage.parentMessageId],
        (err, result) => {
          if (err) {
            console.error('Error inserting message with image:', err);
            res.status(500).json({ message: 'Failed to create a new message' });
          } else {
            console.log('Message with image inserted successfully');
            res.status(200).json({ message: 'Message created successfully' });
          }
        }
      );
    } catch (error) {
      console.error('Error handling image:', error);
      res.status(500).json({ message: 'Failed to handle image' });
    }
  } else {
    // If it's not an image, insert the message normally
    console.log(newMessage.parentMessageId);
    console.log(currentUserName);
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
  }
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


app.get('/getImages/:image', (req, res) => {
  const imageName = req.params.image;
  const imagePath = path.join(process.cwd(), 'Images', imageName);

  console.log(imagePath);

  // Check if the file exists
  if (fs.existsSync(imagePath)) {
    // Read the file and send it as a response
    const image = fs.readFileSync(imagePath);
    res.writeHead(200, { 'Content-Type': 'image/png' }); // Adjust content type based on your image type
    res.end(image, 'binary');
  } else {
    // If the file doesn't exist, send a 404 response
    res.status(404).send('Image not found');
  }
});

app.delete('/deleteMessage/:messageId', (req, res) => {
  const messageId = req.params.messageId;

  // Update the message content and username in the 'messages' table
  connection.query(
    'UPDATE messages SET content = "[removed]", username = "[deleted]" WHERE message_id = ?',
    [messageId],
    (err, result) => {
      if (err) {
        console.error('Error updating message:', err);
        res.status(500).json({ error: 'Failed to update the message' });
      } else if (result.affectedRows === 0) {
        // If no rows were affected, the message with the given ID doesn't exist
        res.status(404).json({ error: 'Message not found' });
      } else {
        console.log('Message updated successfully');
        res.status(200).json({ message: 'Message updated successfully' });
      }
    }
  );
});

// Add this endpoint to get the list of users
app.get('/getUsers', (req, res) => {
  connection.query('SELECT * FROM users', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Failed to retrieve users' });
      return;
    }
    console.log("Successfully got the users");
    res.status(200).json(results);
  });
});

// Add this endpoint to perform message search
app.get('/searchMessages/:searchTerm', (req, res) => {
  const searchTerm = req.params.searchTerm;

  // Retrieve messages that contain the search term from the 'messages' table
  connection.query('SELECT * FROM messages WHERE content LIKE ?', [`%${searchTerm}%`], (err, results) => {
    if (err) {
      console.error('Error searching messages:', err);
      res.status(500).json({ error: 'Failed to search messages' });
    } else {
      console.log('Successfully searched messages');
      res.status(200).json(results);
    }
  });
});

// Add this endpoint to perform message search by username
app.get('/searchMessagesByUser/:username', (req, res) => {
  const username = req.params.username;

  console.log("got here 25");

  // Retrieve messages that were created by the specified username from the 'messages' table
  connection.query('SELECT * FROM messages WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('Error searching messages by username:', err);
      res.status(500).json({ error: 'Failed to search messages by username' });
    } else {
      console.log('Successfully searched messages by username');
      res.status(200).json(results);
    }
  });
});

// Add this endpoint to get the top user with the most posts
app.get('/getTopUserWithMostPosts', (req, res) => {
  console.log("test 123");

  connection.query(`
    SELECT username, COUNT(*) AS postCount
    FROM messages
    WHERE username != '[deleted]' AND username != 'Admin'
    GROUP BY username
    ORDER BY postCount DESC
    LIMIT 1
  `, (err, results) => {
    if (err) {
      console.error('Error retrieving top user with most posts:', err);
      console.log(err);
      res.status(500).json({ error: 'Failed to retrieve top user with most posts' });
    } else {
      const topUser = results[0] || null;
      console.log('Successfully got the top user with most posts:', topUser);
      res.status(200).json(topUser);
    }
  });
});

app.post('/postVote', (req, res) => {
  console.log('Received a POST request to record or remove a vote');

  const { messageId, voteType, username } = req.body;

  let oppositeVoteType;

  if (voteType === 'up')
    oppositeVoteType = 'down';
  else
    oppositeVoteType = 'up';

  // Remove opposite vote first
  connection.query(
    'DELETE FROM message_votes WHERE message_id = ? AND username = ? AND voteType = ?',
    [messageId, username, oppositeVoteType],
    (err) => {
      if (err) {
        console.error('Error removing opposite vote:', err);
        res.status(500).json({ message: 'Failed to remove opposite vote' });
      } else {
        console.log('Opposite vote removed successfully');

        // Check if the vote already exists
        connection.query(
          'SELECT * FROM message_votes WHERE message_id = ? AND username = ? AND voteType = ?',
          [messageId, username, voteType],
          (err, rows) => {
            if (err) {
              console.error('Error checking existing vote:', err);
              res.status(500).json({ message: 'Failed to check existing vote' });
            } else {
              // If a vote already exists, remove it
              if (rows.length > 0) {
                connection.query(
                  'DELETE FROM message_votes WHERE message_id = ? AND username = ? AND voteType = ?',
                  [messageId, username, voteType],
                  (err) => {
                    if (err) {
                      console.error('Error removing existing vote:', err);
                      res.status(500).json({ message: 'Failed to remove existing vote' });
                    } else {
                      console.log('Existing vote removed successfully');
                      res.status(200).json({ message: 'Existing vote removed successfully' });
                    }
                  }
                );
              } else {
                // If no vote exists, add the vote
                connection.query(
                  'INSERT INTO message_votes (message_id, username, voteType) VALUES (?, ?, ?)',
                  [messageId, username, voteType],
                  (err) => {
                    if (err) {
                      console.error('Error recording vote:', err);
                      res.status(500).json({ message: 'Failed to record the vote' });
                    } else {
                      console.log('Vote recorded successfully');
                      res.status(200).json({ message: 'Vote recorded successfully' });
                    }
                  }
                );
              }
            }
          }
        );
      }
    }
  );
});

app.get('/getVotes/:messageId', async (req, res) => {
  try {
    const messageId = req.params.messageId;

    // Query to get both upvotes and downvotes for the specified messageId
    const query = `
      SELECT 
        message_id, 
        SUM(CASE WHEN votetype = 'up' THEN 1 ELSE 0 END) as total_up_votes,
        SUM(CASE WHEN votetype = 'down' THEN 1 ELSE 0 END) as total_down_votes
      FROM message_votes
      WHERE message_id = ?
      GROUP BY message_id
    `;

    connection.query(query, [messageId], (error, results) => {
      if (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        // Extract upvote and downvote counts from the results
        const upVoteCount = results.length > 0 ? results[0].total_up_votes : 0;
        const downVoteCount = results.length > 0 ? results[0].total_down_votes : 0;

        console.log("upVoteCount" + upVoteCount);
        console.log("downVoteCount" + downVoteCount);

        // Send both upvote and downvote counts in the response
        res.json({ upVoteCount, downVoteCount });
      }
    });

  } catch (error) {
    console.error('Error getting votes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/getChannelCreator/:channelName', async (req, res) => {
  const channelName = req.params.channelName;

  connection.query('SELECT created_by FROM channels WHERE channel_name = ?', [channelName], (err, results) => {
    if (err) {
      console.error('Error getting channel creator:', err);
      res.status(500).json({ error: 'Failed to get creator' });
    } else {
      const creatorUsername = results[0].created_by;
      console.log('Successfully got username');
      res.json({ creator: creatorUsername });
    }
  })
});

app.get('/userWithMostPosts', (req, res) => {
  connection.query(`
    SELECT username, COUNT(*) AS postCount
    FROM messages
    WHERE username != '[deleted]'
    GROUP BY username
    ORDER BY postCount DESC
    LIMIT 1
  `, (err, results) => {
    if (err) {
      console.error('Error retrieving user with most posts:', err);
      res.status(500).json({ error: 'Failed to retrieve user with most posts' });
    } else {
      const topUser = results[0] || null;
      console.log('Successfully got the user with most posts:', topUser);

      if (topUser) {
        // Send both username and postCount in the response
        res.status(200).json({
          username: topUser.username,
          postCount: topUser.postCount
        });
      } else {
        res.status(404).json({ error: 'No user found with posts' });
      }
    }
  });
});

app.get('/userWithLeastPosts', (req, res) => {
  connection.query(`
    SELECT username, COUNT(*) AS postCount
    FROM messages
    WHERE username != '[deleted]'
    GROUP BY username
    ORDER BY postCount ASC
    LIMIT 1
  `, (err, results) => {
    if (err) {
      console.error('Error retrieving user with least posts:', err);
      res.status(500).json({ error: 'Failed to retrieve user with least posts' });
    } else {
      const bottomUser = results[0] || null;
      console.log('Successfully got the user with least posts:', bottomUser);

      if (bottomUser) {
        // Send both username and postCount in the response
        res.status(200).json({
          username: bottomUser.username,
          postCount: bottomUser.postCount
        });
      } else {
        res.status(404).json({ error: 'No user found with posts' });
      }
    }
  });
});


