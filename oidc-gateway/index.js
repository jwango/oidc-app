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
    })
});

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
app.use(sess);


app.use(cors(corsOptions));

// Proxy setup
app.get('/login', async (req, res, next) => {
    await AuthClient.authenticateUser();
    req.session.authenticated = true;
    res.json(AuthClient.openIdConfig);
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