var express = require('express');
var router = express.Router();
var mongoClient = require('mongodb').MongoClient; // dhsia added
var db ;

// open Mongo DB connection - dhsia

var db_conn = function() {

  mongoClient.connect('mongodb://localhost:27017/test', function(err, database_connection) {
  if (err) {
     throw err;
  }

  console.log("Open Mongo DB successfully");

  db = database_connection;

  //db.collection('mammals').find().toArray(function(err, result) {
  //if (err) {
  //   throw err;
  //}
  //   console.log(result);
  //   });
  });
 
  return db;
} ;

/* Render /db_ado template */
router.get('/', function(req, res, next) {
  res.render('db_ado', { title: 'My DB ADO' });
});

/* Render /db_ado/quotes template, after submit the query */
router.post('/quotes', function(req, res, next) {

  var msg = "Result : " ;

  //db.collection('restaurants').find().toArray(function(err, result) {
  db.collection('restaurants').find({"borough": "Brooklyn"}).sort({"grades.score": -1}).toArray(function(err, result) {

    if (err) {
      throw err;
    }

    //console.log(result);
    res.render('ado_table', { items: result} );

  });


});

module.exports = router;
module.exports.db_conn = db_conn ;
