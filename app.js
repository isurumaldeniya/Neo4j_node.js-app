var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver').v1;

var app = express();

//view Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.unsubscribe(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'iamrock'))
var session = driver.session();

app.get('/', function(req, res) {
    session
        .run('MATCH (a:Movies) return a')
        .then(function(result) {
            var movieArr = [];
            result.records.forEach(function(record) {
                movieArr.push({
                    id: record._fields[0].identity.low,
                    title: record._fields[0].properties.title,
                    year: record._fields[0].properties.year
                });
            });
            res.render('index', {
                movies: movieArr
            });
        })
        .catch(function(err) {
            console.log(err);
        });

});


app.post('/movie/add', function(req, res) {
    var title = req.body.title;
    var year = req.body.year;

    session
        .run('CREATE(n:Movies {title:{titleParam}, year:{yearParam}}) return n.title', { titleParam: title, yearParam: year })
        .then(function(result) {
            res.redirect('/');
            session.close();
        })
        .catch(function(err) {
            console.log(err);
        });

    res.redirect('/');
});

app.listen(3000);
console.log('server statered');

module.exports = app;