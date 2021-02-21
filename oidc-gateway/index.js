const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const proxy = require('express-http-proxy');
require('isomorphic-fetch');

const AuthClient = require('./auth')();

const app = express();
const maxAgeMs = 1000 * 60;
const checkPeriodMs = 1000 * 60 * 60;

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};

// Use the session middleware
const sess = session({
    secret: 'keyboard cat',
    cookie: { maxAge: maxAgeMs, secure: false, httpOnly: true },
    store: new MemoryStore({ 
        checkPeriod: checkPeriodMs
    }),
    resave: false,
    saveUninitialized: true
});

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
app.use(sess);


app.use(cors(corsOptions));

// Proxy setup
app.get('/login', async (req, res, next) => {
  console.log(req.session.id);
  req.session.pendingAuth = true;
    const accessTokenUrl = await AuthClient.getAccessTokenUrl();
    res.status(302);
    res.header("Location", accessTokenUrl);
    res.end();
});

app.get('/auth_handler', async (req, res, next) => {
  console.log(req.headers);
  const tokenResponse = await AuthClient.exchangeCodeForToken(req.query.code);
  req.session.tokenState = await tokenResponse.json();
  res.status(302);
  res.header("Location", "http://localhost:3000");
  req.session.save((err) => {
    console.log(req.session);
    console.log(req.session.id);
    console.log("saved session for" + req.sessionID);
    res.end();
  });
});

app.get('/userinfo', async (req, res, next) => {
  console.log(req.headers);
  console.log(req.get('origin'));
  console.log(req.session.id);
  if (req.session.tokenState && req.session.tokenState.access_token) {
    const response = await AuthClient.getUserInfo(req.session.tokenState.access_token);
    res.status(response.status);
    res.json(await response.json());
  } else {
    res.status(302);
    res.header("Location", "http://localhost:8080/login");
    res.end();
  }
});
 
// Access the session as req.session
app.get('/', function(req, res, next) {
  if (req.session.views) {
    req.session.views++;
    res.setHeader('Content-Type', 'text/html');
    res.write('<p>views: ' + req.session.views + '</p>');
    res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>');
    res.end();
  } else {
    req.session.views = 1;
    res.end('welcome to the session demo. refresh!');
  }
});

app.listen(8080, () => {
    console.log(`Example app listening at http://localhost:${8080}`)
})