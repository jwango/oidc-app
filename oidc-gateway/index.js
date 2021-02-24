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
const APP_URL = process.env.APP_URL || "http://localhost:3000"

const corsOptions = {
  origin: APP_URL,
  optionsSuccessStatus: 200,
  credentials: true
};

const CSRF_MIDDLEWARE = (req, res, next) => {
  console.log("check for CSRF");
  console.log(req.headers);
  next();
};

const LOG_MIDDLEWARE = (req, res, next) => {
  console.log(`${req.path}: ${req.session.id}`);
  next();
}

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

// Pre-route middleware
app.use(sess);
app.use([CSRF_MIDDLEWARE, LOG_MIDDLEWARE]);
app.use(cors(corsOptions));

// Proxy setup
app.get('/login', async (req, res, next) => {
  let loggedIn = false;
  if (req.session.tokenState) {
    try {
      await AuthClient.verifyToken(req.session.tokenState.id_token);
      loggedIn = true;
    } catch (err) {
      const decoded = AuthClient.decodeToken(req.session.tokenState.id_token);
      console.log(`Previous login session invalid for subject ${decoded.sub}`);
      loggedIn = false;
    }
  }

  if (!loggedIn) {
    req.session.loginCorrelation = await uidSafe(30);
    req.session.nonce = await uidSafe(30);
    req.session.state = req.session.loginCorrelation + "." + req.query.state;
    const accessTokenUrl = await AuthClient.getAccessTokenUrl(req.session.state, req.session.nonce);
    req.session.save((err) => {
      if (err) { next(err); }
      else { res.redirect(302, accessTokenUrl); }
    });
  } else {
    res.redirect(302, req.query.state || APP_URL);
  }
});

app.get('/auth_handler', async (req, res, next) => {
  if (req.query.state != req.session.state) {
    res.status(400);
    res.end("Invalid redirect. Did not match original auth request.");
  }
  const tokenResponse = await AuthClient.exchangeCodeForToken(req.query.code);
  const tokenState = AuthClient.TokenState(await tokenResponse.json());
  try {
    // clear the nonce to prevent replay attack
    const nonceToCheck = req.session.nonce + "";
    req.session.nonce = undefined;
    const savePromise = new Promise((resolve, reject) => {
      req.session.save(err => err ? reject(err) : resolve());
    });
    await savePromise;

    // verify the token 
    const decoded = await AuthClient.verifyToken(tokenState.id_token, nonceToCheck);

    // correlate the token to the user session
    const originalState = req.session.state.split(".", 2)[1];
    const redirectUrl = originalState || APP_URL;
    req.session.tokenState = tokenState;
    req.session.save(err => {
      if (err) { next(err); }
      else { res.redirect(302, redirectUrl); }
    })
  } catch (err) {
    res.status(400);
    console.log(err);
    res.end("Could not verify the token's identity.");
  }
});

app.get('/userinfo', async (req, res, next) => {
  if (req.session.tokenState && req.session.tokenState.access_token) {
    const response = await AuthClient.getUserInfo(req.session.tokenState.access_token);
    res.status(response.status);
    res.json(await response.json());
  } else {
    res.status(401);
    res.end('Unauthorized');
  }
});

app.listen(8080, () => {
    console.log(`Gateway listening at http://localhost:${8080}`)
})