const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
const todos = require('./services/postings');
const users = require('./services/users');
const port = 3000;
const passport = require('passport');

app.use(express.json());

app.get('/', (req, res) => res.send('This route is not protected'));

/*
      BASIC authentication used in the implementation of the JWT key 
      http basic authentication is used during the login process in order to
      obtain the JSON Web Token
*/
const BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new BasicStrategy(
  function(username, password, done) {

    const user = users.getUserByName(username);
    if(user == undefined) {
      // Username not found
      console.log("HTTP Basic username not found");
      return done(null, false, { message: "HTTP Basic username not found" });
    }

    /* Verify password match */
    if(bcrypt.compareSync(password, user.password) == false) {
      // Password does not match
      console.log("HTTP Basic password not matching username");
      return done(null, false, { message: "HTTP Basic password not found" });
    }
    return done(null, user);
  }
));

// Creating a new user
app.post('/users',
        (req, res) => {

  if('username' in req.body == false ) {
    res.status(400);
    res.json({status: "Missing username from body"})
    return;
  }
  if('password' in req.body == false ) {
    res.status(400);
    res.json({status: "Missing password from body"})
    return;
  }
  if('email' in req.body == false ) {
    res.status(400);
    res.json({status: "Missing email from body"})
    return;
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 6);
  console.log(hashedPassword);
  users.addUser(req.body.username, req.body.email, hashedPassword);

  res.status(201).json({ status: "created" });
});

/*
      JSON Web Token implementation
*/
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtSecretKey = require('./jwt-key.json');


let options = {}

/* Configure the passport-jwt module to expect JWT
   in headers from Authorization field as Bearer token */
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

/* This is the secret signing key.
   You should NEVER store it in code  */
options.secretOrKey = jwtSecretKey.secret;

passport.use(new JwtStrategy(options, function(jwt_payload, done) {
  console.log("Processing JWT payload for token content:");
  console.log(jwt_payload);


  /* Here you could do some processing based on the JWT payload.
  For example check if the key is still valid based on expires property.
  */
  const now = Date.now() / 1000;
  if(jwt_payload.exp > now) {
    done(null, jwt_payload.user);
  }
  else {// expired
    done(null, false);
  }
}));

/*
      Core API functionality
*/
app.get(
  '/jwtProtectedResource',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    console.log("jwt");
    res.json(
      {
        status: "Successfully accessed protected resource with JWT",
        user: req.user
      }
    );
  }
);

app.post('/users/:username/postings', 
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const authorized_user = req.user.username;
    const parameters = req.params.username;
    console.log(authorized_user);
    console.log(parameters);
    if(authorized_user == parameters) {
      res.sendStatus(200);
    } else {
      res.sendStatus(403)
    }
    console.log(req.body);
    // if(('description' in req.body) && ( 'dueDate' in req.body)) {
    //   todos.insertTodo(req.body.description, req.body.dueDate, req.user.id);
    //   res.json(todos.getAllUserTodos(req.user.id));
    // }
    // else {
    //   res.sendStatus(400);
    // }
    
})

/* 
      Logging in with http basic in order to obtain JWT
*/
app.get(
  '/users/login',
  passport.authenticate('basic', { session: false }),
  (req, res) => {
    const body = {
      username: req.user.username,
      email : req.user.email
    };

    const payload = {
      user : body
    };

    const options = {
      expiresIn: '1d'
    }

    /* Sign the token with payload, key and options.
       Detailed documentation of the signing here:
       https://github.com/auth0/node-jsonwebtoken#readme */
    const token = jwt.sign(payload, jwtSecretKey.secret, options);

    return res.json({ token });
})

app.listen(port, () => {
  console.log(`Graded Excercise API listening at http://localhost:${port}`)
})