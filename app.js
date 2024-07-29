const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000;

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images'); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Create MySQL connection
const connection = mysql.createConnection({
  // host: 'localhost',
  // user: 'root',
  // password: '',
  // database: 'food_for_gains'
  host: 'pro.freedb.tech',
  user: 'teamfour',
  password:'*wauWdA985W3rA?',
  database:'teamfourdb'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.set('view engine', 'ejs');

// Read main pages
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/menus', (req, res) => {
  const sql = 'SELECT * FROM menus';
  connection.query(sql, (err, results) => {
    if (err) {
      throw err;
    }
    res.render('menus', { menus: results });
  });
});

app.get('/reserve', (req, res) => {
  res.render('reserve');
});

app.get('/feedback', (req, res) => {
  res.render('feedback');
});

// Admin page
app.get('/admin', (req, res) => {
  connection.query('SELECT * FROM reservations', (err, results) => {
    if (err) {
      console.error('Error fetching reservations:', err);
      return res.status(500).send('Error fetching reservations.');
    }
    res.render('admin', { reservations: results });
  });
});

// Update reservation
app.post('/editreservation/:id', (req, res) => {
  const reserve_id = req.params.id;
  const { name, email, contact, pax, datetime } = req.body;

  const sql = 'UPDATE reservations SET name = ?, email = ?, contact = ?, pax = ?, datetime = ? WHERE reserve_id = ?';
  connection.query(sql, [name, email, contact, pax, datetime, reserve_id], (error) => {
    if (error) {
      console.error("Error updating reservation:", error);
      return res.status(500).send('Error updating reservation');
    }
    res.redirect('/admin'); // Redirect to admin page after update
  });
});

// GET route for editing a reservation
app.get('/editreservation/:id', (req, res) => {
  const reserve_id = req.params.id;
  connection.query('SELECT * FROM reservations WHERE reserve_id = ?', [reserve_id], (err, results) => {
    if (err) {
      console.error('Error fetching reservation:', err);
      return res.status(500).send('Error fetching reservation.');
    }
    if (results.length === 0) {
      return res.status(404).send('Reservation not found.');
    }
    res.render('editreservation', { reservation: results[0] });
  });
});


// Delete reservation
app.post('/deletereservation/:id', (req, res) => {
  const reserve_id = req.params.id;
  const sql = 'DELETE FROM reservations WHERE reserve_id = ?';
  connection.query(sql, [reserve_id], (error) => {
    if (error) {
      console.error("Error deleting reservation:", error);
      return res.status(500).send('Error deleting reservation');
    }
    res.redirect('/admin'); // Redirect to admin page after deletion
  });
});

// Create reservation
app.post('/submit', (req, res) => {
  const { name, email, contact, pax, date, time } = req.body;
  const html = `
    <html>
      <head>
        <style>
          body {
            background-image: url("https://wallpapers.com/images/hd/restaurant-background-ua09rq3u85yphzt4.jpg");
            background-size: cover;
            height: 100vh;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .container {
            color: #ffffff;
            font-family: 'Times New Roman', serif;
            text-align: center;
            font-size: 24px;
          }
          h1 {
            font-size: 50px;
          }
          h2 {
            font-size: 30px;
          }
          .booking-details {
            text-align: left;
            margin: 0 auto;
            width: 50%; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Thank you for your reservation, ${name}!</h1>
          <p>We look forward to serving you.</p>
          <h2>Booking Details:</h2>
          <div class="booking-details">
            <ul>
              <li>Email: ${email}</li>
              <li>Contact: ${contact}</li>
              <li>Number of Pax: ${pax}</li>
              <li>Date: ${date}</li>
              <li>Time: ${time}</li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  `;
  res.send(html);
});

// Submit feedback
app.post('/submitfeedback', (req, res) => {
  const { name } = req.body;
  const html = `
    <html>
      <head>
        <style>
          body {
            background-image: url("https://wallpapers.com/images/hd/restaurant-background-ua09rq3u85yphzt4.jpg");
            background-size: cover;
            height: 100vh;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .container {
            color: #ffffff;
            font-family: 'Times New Roman', serif;
            text-align: center;
            font-size: 24px;
          }
          h1 {
            font-size: 50px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Thank you for your feedback, ${name}!</h1>
        </div>
      </body>
    </html>
  `;
  res.send(html);
});

// Error handling middleware
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).send('Error: ' + err.message);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
