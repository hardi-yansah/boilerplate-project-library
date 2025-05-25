/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

/**
 * Define book schemas for Mongoose
 */
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] },
  commentcount: { type: Number, default: 0 },
});

/**
 * Define book models for Mongoose
 */
const Book = mongoose.model("Book", bookSchema);

/**
 * This module exports a function that sets up API routes for a library application.
 * The routes are defined using Express.js and Mongoose for MongoDB operations.
 *
 * @param {Express.Application} app - The Express application instance.
 */
module.exports = function (app) {
  app
    .route("/api/books")
    .get(async function (req, res) {
      /**
       * GET request to retrieve all books.
       *
       * @name GET /api/books
       * @returns {Array} An array of book objects. Each object contains "_id", "title", and "commentcount".
       * @response {200} - Array of book objects.
       * @response {500} - Server error.
       */
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]

      try {
        // find all books and return with comments count
        const books = await Book.find({});
        const booksWithCommentCount = books.map((book) => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length,
        }));
        res.status(200).json(booksWithCommentCount);
      } catch (err) {
        res.status(500).json({ error: "Internal server error" });
      }
    })

    .post(async function (req, res) {
      /**
       * POST request to add a new book.
       *
       * @name POST /api/books
       * @param {string} req.body.title - The title of the book.
       * @returns {Object} The newly created book object. It includes at least "_id" and "title".
       * @response {201} - New book object.
       * @response {400} - Bad request (missing title).
       * @response {500} - Server error.
       */
      let title = req.body.title;
      //response will contain new book object including atleast _id and title

      if (!title) {
        return res.status(400).send("missing required field title");
      }

      try {
        const newBook = new Book({ title });
        await newBook.save();
        res.status(200).json({ _id: newBook._id, title: newBook.title });
      } catch (err) {
        res.status(500).json({ error: "Internal server error" });
      }
    })

    .delete(async function (req, res) {
      /**
       * DELETE request to delete all books.
       *
       * @name DELETE /api/books
       * @returns {string} A success message.
       * @response {200} - "Complete delete successful".
       * @response {500} - Server error.
       */
      //if successful response will be 'complete delete successful'

      try {
        await Book.deleteMany({});
        res.status(200).json({ message: "complete delete successful" });
      } catch (err) {
        res.status(500).json({ error: "Internal server error" });
      }
    });

  app
    .route("/api/books/:id")
    .get(async function (req, res) {
      /**
       * GET request to retrieve a specific book by its ID.
       *
       * @name GET /api/books/:id
       * @param {string} req.params.id - The ID of the book.
       * @returns {Object} The requested book object. It includes "_id", "title", and "comments".
       * @response {200} - Book object.
       * @response {404} - Book not found.
       * @response {500} - Server error.
       */
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.status(400).send("no book exists");
      }

      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.status(400).send("no book exists");
        }
        res.status(200).json({
          _id: book._id,
          title: book.title,
          comments: book.comments,
        });
      } catch (err) {
        res.status(500).json({ error: "Internal server error" });
      }
    })

    .post(async function (req, res) {
      /**
       * POST request to add a comment to a specific book.
       *
       * @name POST /api/books/:id
       * @param {string} req.params.id - The ID of the book.
       * @param {string} req.body.comment - The comment to add.
       * @returns {Object} The updated book object. It includes "_id", "title", and "comments".
       * @response {200} - Updated book object.
       * @response {404} - Book not found.
       * @response {400} - Bad request (missing comment).
       * @response {500} - Server error.
       */
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      if (!comment) {
        return res.status(400).send("missing required field comment");
      }

      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.status(400).send("no book exists");
      }

      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.status(400).send("no book exists");
        }

        book.comments.push(comment);
        book.commentcount = book.comments.length;
        await book.save();
        res.status(200).json({
          _id: book._id,
          title: book.title,
          comments: book.comments,
        });
      } catch (err) {
        res.status(500).json({ error: "Internal server error" });
      }
    })

    .delete(async function (req, res) {
      /**
       * DELETE request to delete a specific book by its ID.
       *
       * @name DELETE /api/books/:id
       * @param {string} req.params.id - The ID of the book.
       * @returns {string} A success message.
       * @response {200} - "Delete successful".
       * @response {404} - Book not found.
       * @response {500} - Server error.
       */
      let bookid = req.params.id;
      //if successful response will be 'delete successful'

      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.status(400).send("no book exists");
      }

      try {
        const book = await Book.findByIdAndDelete(bookid);
        if (!book) {
          return res.status(400).send("no book exists");
        }
        res.status(200).json({ message: "delete successful" });
      } catch (err) {
        res.status(500).json({ error: "Internal server error" });
      }
    });
};
