# passport-simple

*THIS MODULE HAS NOT BEEN DISTRIBUTED. IT HAS NO UNIT TESTS.*
*IT IS FOR PROPRIETARY USE ONLY.*

[Passport](http://passportjs.org/) strategy for authenticating with a username
and password.

This module lets you authenticate using a username and password in your Node.js
applications.  By plugging into Passport, local authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-simple

## Usage

#### Configure Strategy

The local authentication strategy authenticates users using a username and
password.  The strategy requires a `verify` callback, which accepts these
credentials and calls `done` providing a user.

  const callbackFunction=
      function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (!user.verifyPassword(password)) { return done(null, false); }
          return done(null, user);
        });
      };

    passport.use(new LocalStrategy(callbackFunction));
    
Or

If the credentials are in the request body (reg.body.specialusernamefieldname or
req.query.specialuserfieldname), this works...
  
    passport.use(new LocalStrategy({
      usernameField: 'specialusernamefieldname',
      passwordField: 'specialpasswordfieldname'
      
    },
    callbackFunction));

Or

if the credentials are in any other part of the request object,
(req.body.headers.specialusernamefieldname), you can use this...

    passport.use(new LocalStrategy({
      usernameField: 'headers.specialusernamefieldname',
      passwordField: 'headers.specialpasswordfieldname'
      
    },
    callbackFunction));

This works for any part of the request object you can describe with a dotted path.
    

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'simple'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.post('/login', 
      passport.authenticate('simple', { failureRedirect: '/login' }),
      function(req, res) {
        res.redirect('/');
      });



## Credits

  Based on excellent work in 'passport-local' by [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

MIT License

Copyright (c) Microsoft Corporation.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE

