// event-db.js

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('eventDB');



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
  console.log("API server is running .....");
});



