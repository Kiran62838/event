// event-db.js

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('eventDB');

db.serialize(function () {
  db.run("CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, time TEXT, date TEXT, location TEXT)");
  db.run("DELETE FROM events");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Birthday Party", "6:00 PM", "2023-12-25", "123 Main Street");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Conference", "9:00 AM", "2024-03-15", "Conference Center");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Wedding Anniversary Occasion", "8.30PM", "2024-01-18", "Royal King Hotel");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Product Launch", "2:00 PM", "2024-01-26", "Tech Expo Hall");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Family Picnic", "11:00 AM", "2024-05-20", "City Park");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Tech Workshop", "3:30 PM", "2023-09-08", "Innovation Hub");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Charity Gala", "7:00 PM", "2024-02-28", "Community Center");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Book Club Meeting", "6:30 PM", "2023-10-05", "Library");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Fitness Bootcamp", "5:30 AM", "2024-06-12", "Fitness Center");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Movie Night", "8:00 PM", "2023-11-28", "Home Theater");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Art Exhibition", "10:00 AM", "2024-04-15", "Art Gallery");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Cooking Class", "1:00 PM", "2023-12-10", "Culinary School");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Community Cleanup", "9:30 AM", "2024-03-05", "Local Park");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Game Night", "7:30 PM", "2023-10-20", "Friend's House");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Fashion Show", "6:00 PM", "2024-05-02", "Fashion Mall");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Coding Bootcamp", "12:00 PM", "2023-09-18", "Tech Academy");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Yoga Retreat", "8:00 AM", "2024-01-08", "Mountain Resort");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Dance Workshop", "4:00 PM", "2023-11-15", "Dance Studio");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Science Fair", "11:00 AM", "2024-04-02", "School Auditorium");
  db.run("INSERT INTO events (name, time, date, location) VALUES (?, ?, ?, ?)", "Gardening Club", "3:00 PM", "2023-10-30", "Botanical Garden");
});

module.exports = db;

// api-events.js

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');


const app = express();
app.use(bodyParser.json());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Store uploaded files in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Rename uploaded files with timestamp
  }
});

const upload = multer({ storage: storage });

/**
 * @api {get} /events Get all events
 * @apiName GetEvents
 * @apiGroup Events
 *
 * @apiSuccess {Object[]} events List of events.
 */
app.get('/events', function (req, res) {
  db.all("SELECT * FROM events", function (err, rows) {
    res.json(rows);
  });
});

/**
 * @api {get} /events/:id Get a specific event by ID
 * @apiName GetEvent
 * @apiGroup Events
 *
 * @apiParam {Number} id Event's unique ID.
 *
 * @apiSuccess {Object} event Event information.
 */
app.get('/events/:id', function (req, res) {
  const eventId = req.params.id;
  db.get("SELECT * FROM events WHERE id = ?", eventId, function (err, row) {
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  });
});

/**
 * @api {post} /events Add a new event
 * @apiName AddEvent
 * @apiGroup Events
 *
 * @apiParam {String} name Event name.
 * @apiParam {String} date Event date (YYYY-MM-DD).
 * @apiParam {String} time Event time (HH:MM AM/PM).
 * @apiParam {String} location Event location.
 *
 * @apiSuccess {Object} event Added event information.
 */
app.post('/events', function (req, res) {
  const { name, date, time, location } = req.body;
  db.run("INSERT INTO events (name, date, time, location) VALUES (?, ?, ?, ?)", name, date, time, location, function (err) {
    if (err) {
      res.status(500).json({ error: 'Failed to add event' });
    } else {
      res.status(201).json({ id: this.lastID, name, date, time, location });
    }
  });
});

/**
 * @api {put} /events/:id Update an event by ID
 * @apiName UpdateEvent
 * @apiGroup Events
 *
 * @apiParam {Number} id Event's unique ID.
 * @apiParam {String} name Updated event name.
 * @apiParam {String} date Updated event date (YYYY-MM-DD).
 * @apiParam {String} time Updated event time (HH:MM AM/PM).
 * @apiParam {String} location Updated event location.
 *
 * @apiSuccess {Object} event Updated event information.
 */
app.put('/events/:id', function (req, res) {
  const eventId = req.params.id;
  const { name, date, time, location } = req.body;
  db.run("UPDATE events SET name = ?, date = ?, time = ?, location = ? WHERE id = ?", name, date, time, location, eventId, function (err) {
    if (err) {
      res.status(500).json({ error: 'Failed to update event' });
    } else {
      res.json({ id: eventId, name, date, time, location });
    }
  });
});

/**
 * @api {delete} /events/:id Delete an event by ID
 * @apiName DeleteEvent
 * @apiGroup Events
 *
 * @apiParam {Number} id Event's unique ID.
 *
 * @apiSuccess {Object} event Deleted event information.
 */
app.delete('/events/:id', function (req, res) {
  const eventId = req.params.id;
  db.run("DELETE FROM events WHERE id = ?", eventId, function (err) {
    if (err) {
      res.status(500).json({ error: 'Failed to delete event' });
    } else {
      res.json({ id: eventId, message: 'Event deleted' });
    }
  });
});

const PORT = 4004;
app.listen(PORT, function () {
  console.log("API server is running ....");
});



