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
module.exports = function (app) {
  app
    .route("/api/books")
    .get(async function (req, res) {
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
      let title = req.body.title;
      //response will contain new book object including atleast _id and title

      if (!title) {
        return res.send("missing required field title");
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
      //if successful response will be 'complete delete successful'

      try {
        await Book.deleteMany({});
        res.status(200).send("complete delete successful");
      } catch (err) {
        res.status(500).json({ error: "Internal server error" });
      }
    });

  app
    .route("/api/books/:id")
    .get(async function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.send("no book exists");
      }

      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.send("no book exists");
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
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      if (!comment) {
        return res.send("missing required field comment");
      }

      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.send("no book exists");
      }

      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.send("no book exists");
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
      let bookid = req.params.id;
      //if successful response will be 'delete successful'

      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.send("no book exists");
      }

      try {
        const book = await Book.findByIdAndDelete(bookid);
        if (!book) {
          return res.send("no book exists");
        }
        res.status(200).send("delete successful");
      } catch (err) {
        res.status(500).json({ error: "Internal server error" });
      }
    });
};
