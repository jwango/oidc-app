const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const proxy = require('express-http-proxy');
const uidSafe = require('uid-safe');
require('isomorphic-fetch');

const AuthClient = require('./auth')();

const app = express();
const maxAgeMs = 1000 * 60;
const checkPeriodMs = 1000 * 60 * 60;

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true
};

// Use the session middleware
const store = new MemoryStore({ 
  checkPeriod: checkPeriodMs
});
const sess = session({
    secret: 'keyboard cat',
    cookie: { maxAge: maxAgeMs, secure: false, httpOnly: true, sameSite: 'lax', path: '/' },
    store,
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
app.get('/prelogin', async (req, res, next) => {
  console.log(req.session);
  console.log(req.session.id);
  req.session.loginCorrelation = await uidSafe(30);
  res.status(200);
  res.end(req.session.loginCorrelation);
});

app.get('/login', async (req, res, next) => {
  store.all(async (err, sessionsMap) => {
    const matchingSession = Object.keys(sessionsMap).find(key => sessionsMap[key].loginCorrelation == req.query.correlationId);
    req.session.originalSessionID = matchingSession;
    const accessTokenUrl = await AuthClient.getAccessTokenUrl(req.query.correlationId);
    req.session.save((err) => {
      console.log("saved session for " + req.session.id);
      res.redirect(302, accessTokenUrl);
    });
  });
});

app.get('/auth_handler', async (req, res, next) => {
  const tokenResponse = await AuthClient.exchangeCodeForToken(req.query.code);
  const tokenState = await tokenResponse.json();
  console.log(req.session.originalSessionID);
  store.get(req.session.originalSessionID, (err, s) => {
    console.log("gotten");
    store.set(req.session.originalSessionID, {
      ...s,
      tokenState
    }, () => {
      console.log("set");
      res.redirect(302, "http://localhost:3000");
    });
  });
});

app.get('/userinfo', async (req, res, next) => {
  console.log(req.session);
  console.log(req.session.id);
  if (req.session.tokenState && req.session.tokenState.access_token) {
    const response = await AuthClient.getUserInfo(req.session.tokenState.access_token);
    res.status(response.status);
    res.json(await response.json());
  } else {
    res.status(200);
    res.json({});
  }
});
 
// Access the session as req.session
app.get('/', function(req, res, next) {
  console.log(req.session.id);
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