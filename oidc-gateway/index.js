const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);

const app = express();
const maxAgeMs = 1000 * 60;
const checkPeriodMs = 1000 * 60 * 60;

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