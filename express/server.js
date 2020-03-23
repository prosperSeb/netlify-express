'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const {PORT} = require('./constants');
const mongodb = require('./app');

const router = express.Router();
router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});


router.get('/movies/:id', async(request, response) => {
  const res = request.params.id;
  const result = await mongodb.getmovie_id(res);
  response.send(result);
});

router.get('/movies/:search?', async(request, response) => {
  const param = request.params;
  //response.send(limit==null );

  const limit = request.query.limit;
  const metascore= request.query.metascore;
  if(limit>58 || metascore>100)
  {
    response.send("limit can't be higher than 58 and metascore can't be higher than 100");
  }

  if(param.search==null)
  {
    const movies = await mongodb.getrandom();
    response.send(movies);
  }else if(param.search=="search" && limit==null&& metascore==null)
  {
    const movies = await mongodb.getmovie_list(5,0);
    response.send(movies);
  }else if(param.search=="search" && limit!=null&& metascore==null)
  {
    const movies = await mongodb.getmovie_list(limit,0);
    response.send(movies);
  }else if(param.search=="search" && limit!=null&& metascore!=null)
  {
    const movies = await mongodb.getmovie_list(limit,metascore);
    response.send(movies);
  }else if(param.search=="search" && limit==null&& metascore!=null)
  {
    const movies = await mongodb.getmovie_list(5,metascore);
    response.send(movies);
  }else{
    response.send("error in the url")
  }
  
});

router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
