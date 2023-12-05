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
    'INSERT INTO channels (channel_name) VALUES (?)',
    [newChannel.channelName],
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
   connection.query('SELECT * FROM', (err, results) => {
    if (err) {
      res.status(500).json({error: 'Failed to retrieve channels'});
      return;
    }
    console.log("got here 4");

    res.status(200).json(results);
   })
})


// Create the 'channels' table if it doesn't exist
connection.connect((err) => {
    if (err) throw err;

    connection.query(`
      CREATE TABLE IF NOT EXISTS channels (
        channel_id INT AUTO_INCREMENT PRIMARY KEY,
        channel_name VARCHAR(255) NOT NULL
      )
    `, (err) => {
      if (err) throw err;
      console.log('Table "channels" created or already exists.');
    });
});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});