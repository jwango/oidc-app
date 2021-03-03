const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const proxy = require('express-http-proxy');
const uidSafe = require('uid-safe');
require('isomorphic-fetch');

const app = express();
const COOKIE_SECRET = process.env.COOKIE_SECRET || "secret";
const maxAgeMs = process.env.COOKIE_MAX_AGE_MS || 1000 * 60 * 30; // 30 min
const checkPeriodMs = process.env.COOKIE_CHECK_PERIOD_MS || 1000 * 60 * 60; // 60 min
const PORT = process.env.PORT || 8080;
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const HOST_URL = process.env.HOST_URL || `http://localhost:${PORT}`;
const ALLOWED_ORIGINS = [APP_URL];
const ALLOWED_REFERER_ORIGINS = [APP_URL, HOST_URL];
const PROXY_URL = process.env.PROXY_URL || "localhost:8000";
const DEBUG_OIDC = (process.env.DEBUG_OIDC === "true") || (process.env.DEBUG_OIDC === true) || false;

const AuthClient = require('./auth')(HOST_URL);
const HttpUtils = require('./http');

const corsOptions = {
  origin: APP_URL,
  optionsSuccessStatus: 200,
  credentials: true
};

const CSRF_MIDDLEWARE = (req, res, next) => {
  const origin = req.get("Origin");
  const referer = req.get("Referer");
  let failedCsrf = false;
  if (origin) {
    if (!ALLOWED_ORIGINS.some(allowedOrigin => HttpUtils.urlExactlyMatches(origin, allowedOrigin))) {
      failedCsrf = true;
      res.status(401);
      res.send("Unauthorized");
      console.log(`Origin ${origin} did not match allowed origins ${ALLOWED_ORIGINS}`);
    }
  } else if (referer) {
    if (!ALLOWED_REFERER_ORIGINS.some(allowedReferer => HttpUtils.urlStartsWith(referer, allowedReferer))) {
      failedCsrf = true;
      res.status(401);
      res.send("Unauthorized");
      console.log(`Referer ${referer} did not match allowed origins ${ALLOWED_REFERER_ORIGINS}`);
    }
  } else {
    failedCsrf = true;
    res.status(401);
    res.send("Unauthorized");
    console.log("No origin or referer header found.")
  }
  if (!failedCsrf) { next(); }
};

const LOG_MIDDLEWARE = (req, res, next) => {
  console.log(`${req.path}: ${req.session.id}`);
  if (DEBUG_OIDC) {
    console.log(req.headers);
  }
  next();
}

// Use the session middleware
const store = new MemoryStore({ 
  checkPeriod: checkPeriodMs
});

const sessionOpts = {
  secret: COOKIE_SECRET,
  cookie: { maxAge: maxAgeMs, secure: false, httpOnly: true, sameSite: 'lax', path: '/' },
  store,
  resave: false,
  saveUninitialized: true
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sessionOpts.cookie.secure = true // serve secure cookies
  sessionOpts.cookie.sameSite = 'none'
}

// Pre-route middleware
app.use(session(sessionOpts));
app.use(LOG_MIDDLEWARE);
app.use(cors(corsOptions));

app.get('/', CSRF_MIDDLEWARE, (req, res, next) => {
  res.send('Hello world');
});

// Proxy setup
app.get('/login', CSRF_MIDDLEWARE, async (req, res, next) => {
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
    res.send("Invalid redirect. Did not match original auth request.");
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
    console.log(tokenState.access_token);
    console.log(tokenState.expires_in);
    const decoded = await AuthClient.verifyToken(tokenState.id_token, nonceToCheck);

    // correlate the token to the user session
    const originalState = req.session.state.split(".").slice(1).join(".");
    const redirectUrl = originalState || APP_URL;
    console.log(`Redirecting to ${redirectUrl}`);
    req.session.tokenState = tokenState;
    req.session.save(err => {
      if (err) { next(err); }
      else { res.redirect(302, redirectUrl); }
    })
  } catch (err) {
    res.status(400);
    console.log(err);
    res.send("Could not verify the token's identity.");
  }
});

app.get('/userinfo', CSRF_MIDDLEWARE, async (req, res, next) => {
  if (req.session.tokenState && req.session.tokenState.access_token) {
    const response = await AuthClient.getUserInfo(req.session.tokenState.access_token);
    res.status(response.status);
    res.json(await response.json());
  } else {
    res.status(401);
    res.send('Unauthorized');
  }
});

app.use('/api', CSRF_MIDDLEWARE, proxy(`${PROXY_URL}`, {
  proxyReqPathResolver: function(req) {
    return `/api${req.url}`;
  },
  proxyReqOptDecorator: function(proxyReqOpts, req) {
    if (req.session.tokenState && req.session.tokenState.access_token) {
      proxyReqOpts.headers['Authorization'] = `Bearer ${req.session.tokenState.access_token}`
    } else {
      console.log("No access token found for session to proxy with");
    }
    return proxyReqOpts
  }
}));

app.listen(PORT, () => {
    console.log(`Gateway listening at http://localhost:${PORT}`);
})