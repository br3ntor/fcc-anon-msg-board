/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('API ROUTING FOR /api/threads/:board', function() {
    let thread_id = '';

    suite('POST', function() {
      test('Create a new thread', done => {
        chai
          .request(server)
          .post('/api/threads/test')
          .type('form')
          .send({
            board: 'test',
            text: 'some test text',
            delete_password: 'pass',
            created_on: new Date().toISOString(),
            bumped_on: new Date().toISOString(),
            reported: false,
            replies: []
          })
          .end((err, res) => {
            if (err) throw err;
            assert.equal(res.status, 200);
            assert.equal(res.redirects[0].split('/')[4], 'test');
            done();
          });
      });
    });

    suite('GET', function() {
      test('Get all threads on a board', done => {
        chai
          .request(server)
          .get('/api/threads/test')
          .end((err, res) => {
            if (err) throw err;
            thread_id = res.body[0]._id;
            assert.equal(res.status, 200);
            assert.isAtLeast(res.body.length, 1);
            done();
          });
      });
    });

    suite('PUT', function() {
      test('Report a thread', done => {
        chai
          .request(server)
          .put('/api/threads/test')
          .send({ thread_id: thread_id })
          .end((err, res) => {
            if (err) throw err;
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });
    });

    suite('DELETE', function() {
      test('Delete a thread', done => {
        chai
          .request(server)
          .delete('/api/threads/test')
          .send({ thread_id: thread_id })
          .end((err, res) => {
            if (err) throw err;
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });
    });
  });

  suite('API ROUTING FOR /api/replies/:board', function() {
    // Id from manually created test thread at route /b/dbtest
    const testThread = '5ddda86edb8fce2481bd76d8';
    let reply_id = '';

    suite('POST', function() {
      test('Post reply', done => {
        chai
          .request(server)
          .post('/api/replies/dbtest')
          .send({ thread_id: testThread, text: 'A test reply', delete_password: 'd' })
          .end((err, res) => {
            if (err) throw err;            
            assert.equal(res.status, 200);
            assert.equal(res.redirects[0].split('/')[5], testThread);            
            done();
          });
      });
    });

    suite('GET', function() {
      test('Get thread replies', done => {
        chai
          .request(server)
          .get('/api/replies/dbtest')
          .query({ thread_id: testThread })
          .end((err, res) => {
            if (err) throw err;
            const lastReplyId = res.body.replies[res.body.replies.length - 1]._id;
            reply_id = lastReplyId;
            assert.equal(res.status, 200);
            assert.isAtLeast(res.body.replies.length, 1);                        
            done();
          });
      });
    });

    suite('PUT', function() {
      test('Report reply', done => {
        chai
          .request(server)
          .put('/api/replies/dbtest')
          .send({ thread_id: testThread, reply_id: reply_id })
          .end((err, res) => {
            if (err) throw err;
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });
      });
    });

    suite('DELETE', function() {
      test('Delete reply', done => {
        chai
          .request(server)
          .delete('/api/replies/dbtest')
          .send({ thread_id: testThread, reply_id: reply_id })
          .end((err, res) => {
            if (err) throw err;
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');          
            done();
          });
      });
    });
  });
});
