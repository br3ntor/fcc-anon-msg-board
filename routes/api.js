/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
const CONNECTION_STRING = process.env.DB;

module.exports = function(app) {
  MongoClient.connect(CONNECTION_STRING, function(err, db) {
    if (err) throw err;
    console.log('Connected successfully to db server');

    const collection = db.collection('msg-board');

    // Threads route
    app
      .route('/api/threads/:board')

      // Get all threads on a board
      .get((req, res) => {
        collection.find({ board: req.params.board }, { limit: 10, sort: { bumped_on: -1 } }).toArray((err, docs) => {
          if (err) throw err;
          res.json(
            docs.map(el => {
              return {
                _id: el._id,
                text: el.text,
                created_on: el.created_on,
                replies: el.replies.slice(0, 3),
                replycount: el.replies.length
              };
            })
          );
        });
      })

      // Create new thread
      .post((req, res) => {
        collection.insertOne(
          {
            board: req.params.board,
            text: req.body.text,
            delete_password: req.body.delete_password,
            created_on: req.requestTime,
            bumped_on: req.requestTime,
            reported: false,
            replies: []
          },
          (err, r) => {
            if (err) throw err;            
            res.redirect('/b/' + req.params.board);
          }
        );
      })

      // Report thread
      .put((req, res) => {        
        collection.updateOne({ _id: ObjectID(req.body.thread_id) }, { $set: { reported: true } }, (err, r) => {
          if (err) throw err;          
          if (r.modifiedCount) {
            res.send('success');
          } else {
            res.send('already reported');
          }
        });
      })

      // Delete thread
      .delete((req, res) => {
        collection.deleteOne({ _id: ObjectID(req.body.thread_id) }, (err, r) => {
          if (err) throw err;
          if (r.deletedCount) {
            res.send('success');
          } else {
            res.send("Thread doesn't exist");
          }
        });
      });

    // Replies route
    app
      .route('/api/replies/:board')

      // Get all replies to a thread
      .get((req, res) => {
        collection.findOne({ _id: ObjectID(req.query.thread_id) }, (err, doc) => {
          if (err) throw err;
          if (doc) {
            res.json({
              _id: doc._id,
              text: doc.text,
              created_on: doc.created_on,
              replies: doc.replies.map(el => {
                return {
                  _id: el._id,
                  text: el.text,
                  created_on: el.created_on
                };
              })
            });
          } else {
            res.send('Something went wrong.');
          }
        });
      })

      // Post reply to a thread
      .post((req, res) => {        
        collection.updateOne(
          { _id: ObjectID(req.body.thread_id) },
          {
            $set: { bumped_on: req.requestTime },
            $push: {
              replies: {
                _id: new ObjectID(),
                text: req.body.text,
                created_on: req.requestTime,
                delete_password: req.body.delete_password,
                reported: false
              }
            }
          },
          (err, r) => {
            if (err) throw err;            
            res.redirect(`/b/${req.params.board}/${req.body.thread_id}`);
          }
        );
      })
      
      // Report reply
      .put((req, res) => {        
        collection.updateOne({ _id: ObjectID(req.body.thread_id), 'replies._id': ObjectID(req.body.reply_id) }, { $set: { 'replies.$.reported': true } }, (err, r) => {
          if (err) throw err;          
          if (r.modifiedCount) {
            res.send('success');
          } else {
            res.send('already reported');
          }          
        });
      })
    
      // Delete reply
      .delete((req, res) => {
        collection.updateOne({ _id: ObjectID(req.body.thread_id), 'replies._id': ObjectID(req.body.reply_id) }, { $set: { 'replies.$.text': '[deleted]' } }, (err, r) => {
          if (err) throw err;          
          if (r.modifiedCount) {
            res.send('success');
          } else {
            res.send("already deleted");
          }
        });
      });

    app.use(function(req, res, next) {
      res
        .status(404)
        .type('text')
        .send('Not Found');
    });
  });
};
