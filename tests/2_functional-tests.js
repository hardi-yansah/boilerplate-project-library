/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("#example Test GET /api/books", function (done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        if (res.body.length > 0) {
          assert.property(
            res.body[0],
            "commentcount",
            "Books in array should contain commentcount"
          );
          assert.property(
            res.body[0],
            "title",
            "Books in array should contain title"
          );
          assert.property(
            res.body[0],
            "_id",
            "Books in array should contain _id"
          );
        }
        done();
      });
  });

  suite("Routing tests", function () {
    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("Test POST /api/books with title", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "Book Title Test" })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.isObject(res.body, "response should be an object");
              assert.property(res.body, "_id", "Book should contain _id");
              assert.property(res.body, "title", "Book should contain title");
              done();
            });
        });

        test("Test POST /api/books with no title given", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .send({})
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "missing required field title");
              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .get("/api/books")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, "response should be an array");
            if (res.body.length > 0) {
              assert.property(
                res.body[0],
                "commentcount",
                "Books should contain commentcount"
              );
              assert.property(
                res.body[0],
                "title",
                "Books should contain title"
              );
              assert.property(res.body[0], "_id", "Books should contain _id");
            }
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .get(`/api/books/testID`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        // Create a book first to get a valid id
        chai
          .request(server)
          .post("/api/books")
          .send({ title: "Valid Book" })
          .end(function (err, res) {
            const bookId = res.body._id;
            chai
              .request(server)
              .get("/api/books/" + bookId)
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isObject(res.body, "response should be an object");
                assert.property(res.body, "title", "Book should contain title");
                assert.property(res.body, "_id", "Book should contain _id");
                assert.property(
                  res.body,
                  "comments",
                  "Book should contain comments"
                );
                done();
              });
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("Test POST /api/books/[id] with comment", function (done) {
          // Create a book first to get a valid id
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "Book to Comment" })
            .end(function (err, res) {
              const bookId = res.body._id;
              chai
                .request(server)
                .post("/api/books/" + bookId)
                .send({ comment: "This is a comment" })
                .end(function (err, res) {
                  assert.equal(res.status, 200);
                  assert.isObject(res.body, "response should be an object");
                  assert.property(res.body, "_id", "Book should contain _id");
                  assert.property(
                    res.body,
                    "title",
                    "Book should contain title"
                  );
                  assert.property(
                    res.body,
                    "comments",
                    "Book should contain comments"
                  );
                  assert.include(
                    res.body.comments,
                    "This is a comment",
                    "Comments should include the submitted comment"
                  );
                  done();
                });
            });
        });

        test("Test POST /api/books/[id] without comment field", function (done) {
          // Create a book first to get a valid id
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "Book to Comment No Field" })
            .end(function (err, res) {
              const bookId = res.body._id;
              chai
                .request(server)
                .post("/api/books/" + bookId)
                .send({})
                .end(function (err, res) {
                  assert.equal(res.status, 200);
                  assert.equal(res.text, "missing required field comment");
                  done();
                });
            });
        });

        test("Test POST /api/books/[id] with comment, id not in db", function (done) {
          chai
            .request(server)
            .post("/api/books/invalidID")
            .send({ comment: "This is a comment" })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "no book exists");
              done();
            });
        });
      }
    );

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("Test DELETE /api/books/[id] with valid id in db", function (done) {
        // Create a book first to get a valid id
        chai
          .request(server)
          .post("/api/books")
          .send({ title: "Book to Delete" })
          .end(function (err, res) {
            const bookId = res.body._id;
            chai
              .request(server)
              .delete("/api/books/" + bookId)
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, "delete successful");
                done();
              });
          });
      });

      test("Test DELETE /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .delete("/api/books/testID")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          });
      });
    });
  });
});
