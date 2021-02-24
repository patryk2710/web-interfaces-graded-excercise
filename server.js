const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const postings = require('./services/postings');
const users = require('./services/users');
const cloudinary = require('cloudinary').v2
const fs = require('fs')
const Ajv = require('ajv').default

const multer = require('multer')

const app = express();
const upload = multer({ dest: 'uploads/'});
const passport = require('passport');
const { v4: uuidv4 } = require('uuid');
const jsonSchemaUsers = require('./schemas/jsonSchemaUsers.json')
const jsonSchemaPostings = require('./schemas/jsonSchemaPostings.json')

app.set('port', (process.env.PORT || 80))

app.use(express.json());

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

  const ajv = new Ajv();
  const validate = ajv.compile(jsonSchemaUsers);
  const valid = validate(req.body);
  
  if(valid == true) {
    accountname = users.getUserByName(req.body.username)
    console.log(accountname);
    if(accountname != undefined) {
      res.status(400);
      res.json({status: "Username already in use!"})
      return;
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 6);
    console.log(hashedPassword);
    users.addUser(req.body.username, hashedPassword, req.body.firstName, req.body.lastName);
  

    res.status(201).json({ status: "User Created", username: req.body.username});
  } else {
    res.status(400)
    res.send(validate.errors.map(e => e.message))
  }
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

/* 
      POST operation for a new posting for a given user :username, method first checks that the user is who the user says they are
      it then inserts a new posting into that users account
*/
app.post('/users/:username/postings', 
  passport.authenticate('jwt', { session: false }),
  upload.any('images'),
  (req, res) => {
    if(req.user.username != req.params.username) {
      for(i = 0; i < req.files.length; i++) {
        const path = req.files[i].path
        fs.unlinkSync(path)
      }
      return res.sendStatus(403)
    }

    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchemaPostings);
    const valid = validate(req.body);
    
    if(valid == true) {

      if(req.files.length == 0) {
        res.status(400)
        res.json('Missing image(s) from the submission')
        return
      }
      if(req.files.length > 4) {
        res.status(400)
        res.json('Maximum amount of images allowed is 4')
        console.log('testinsidesizechecker')
        for(i = 0; i < req.files.length; i++) {
          const path = req.files[i].path
          fs.unlinkSync(path)
        }
        return
      }
      console.log(req.body);
      for(i = 0; i < req.files.length; i++) {
        console.log(req.files[i]);
      }
      
      var url = 'https://res.cloudinary.com/dvsvon5jp/image/upload/v1614109415/api/'
      var urls = []
      var uniqueFilename = []
      var filetypes = []
      
      // setting up the file naming structure etc.
      for(i = 0; i < req.files.length; i++) {
        console.log(i)
        filetypes[i] = (req.files[i]).mimetype.substr(6)
        console.log((req.files[i]).originalname)
        uniqueFilename[i] = uuidv4()
        console.log(uniqueFilename[i])
        urls[i] = url.concat(uniqueFilename[i],'.',filetypes[i])
        console.log(urls[i])
      }
        
      console.log(urls)

      postings.insertPosting(req.body.title, req.body.description, req.body.category, req.body.location, urls, req.body.askingPrice, req.body.dateofPosting, req.body.deliveryType, 
        req.user.username, req.body.contactInfo);
        console.log('testingssss');
        res.status(201)
        res.json(postings.getAllUserPostings(req.user.username));
      
      // uploading the files to cloudinary service
      for(i = 0; i < req.files.length; i++) {
        cloudinary.config({
          cloud_name: process.env.cloudname,
          api_key: process.env.apikey,
          api_secret: process.env.apisecret
        })
        console.log(i)
        console.log(req.files[i].path)
        const path = req.files[i].path
    
        // uploading the file
        cloudinary.uploader.upload(
          path,
          { public_id: `api/${uniqueFilename[i]}`, tags: `api` }, 
          function() {
            console.log('file uploaded to Cloudinary')
            console.log('')
            // removing the file from local storage
            fs.unlinkSync(path)
          }
        )
      }
    } else {
      for(i = 0; i < req.files.length; i++) {
        const path = req.files[i].path
        fs.unlinkSync(path)
      }
      res.status(400)
      res.send(validate.errors.map(e => e.message))
    }
})

/*
      GET operation for getting all postings and searching for postings
*/
app.get('/postings/search', (req, res) => {
  
  let category = req.query.category
  let location = req.query.location
  let dateofPosting = req.query.dateofPosting

  if((category == undefined) && (location == undefined) && (dateofPosting == undefined)) {
    const posts = postings.getAllPostings()
    res.status(200)
    res.json(posts)
    return
  }

  if(category != undefined) {
    const posts = postings.getPostingbyCategory(category)
    console.log(posts)
    res.status(200)
    if(posts.length == 0) {
      const responseMessage = "There are no postings with category ".concat(category)
      res.json({ status: responseMessage})
    } else {
      res.json(posts)
    }
    return
  }

  if(location != undefined) {
    const posts = postings.getPostingbyLocation(location)
    console.log(posts)
    res.status(200)
    if(posts.length == 0) {
      const responseMessage = "There are no postings with location ".concat(location)
      res.json({ status: responseMessage})
    } else {
      res.json(posts)
    }
    return
  }

  if(dateofPosting != undefined) {
    const posts = postings.getPostingbyDate(dateofPosting)
    console.log(posts)
    res.status(200)
    if(posts.length == 0) {
      const responseMessage = "There are no postings with date ".concat(dateofPosting)
      res.json({ status: responseMessage})
    } else {
      res.json(posts)
    }
    return
  }
  return res.sendStatus(400)
});
/* 
      Editing a posting and deleting a posting -> empty "postings.getPosting() returns 'undefined'"
*/
app.route('/users/:username/postings/:postId')
    .put(passport.authenticate('jwt', { session: false }), (req,res) => {
      // code for validating the user who makes the request
      if(req.user.username != req.params.username) {
        return res.sendStatus(403)
      }
      console.log(req.params.postId)
      const postget = postings.getPosting(req.params.postId)
      console.log(postget)
      if(postget == undefined) {
        return res.sendStatus(404)
      }
      console.log(postget.username)
      if(postget.username != req.params.username) {
        console.log("username test works")
        return res.sendStatus(403)
      }

      // main editing code
      console.log(req.body)
      console.log(postget)

      let allpostings = postings.getAllPostings()
      const indextobedeleted = allpostings.indexOf(postget)
      
      let upTitle, upDescription, upCategory, upLocation, upAskingprice, upDateofPosting, upDeliverytype, upContactInfo
      if('title' in req.body) {
        upTitle = req.body.title
      } else {
        upTitle = postget.title
      }

      if('description' in req.body) {
        upDescription = req.body.description
      } else {
        upDescription = postget.description
      }

      if('category' in req.body) {
        upCategory = req.body.category
      } else {
        upCategory = postget.category
      }

      if('location' in req.body) {
        upLocation = req.body.location
      } else {
        upLocation = postget.location
      }

      if('askingPrice' in req.body) {
        upAskingprice = req.body.askingPrice
      } else {
        upAskingprice = postget.askingPrice
      }

      if('dateofPosting' in req.body) {
        upDateofPosting = req.body.dateofPosting
      } else {
        upDateofPosting = postget.dateofPosting
      }

      if('deliveryType' in req.body) {
        upDeliverytype = req.body.deliveryType
      } else {
        upDeliverytype = postget.deliveryType
      }

      if('contactInfo' in req.body) {
        upContactInfo = req.body.contactInfo
      } else {
        upContactInfo = postget.contactInfo
      }

      let updatedData = {
        id: postget.id,
        title: upTitle,
        description: upDescription,
        category: upCategory,
        location: upLocation,
        images: postget.images,
        askingPrice: upAskingprice,
        dateofPosting: upDateofPosting,
        deliveryType: upDeliverytype,
        username: req.params.username,
        contactInfo: upContactInfo
      }

      let updated = postings.updatePosting(indextobedeleted, updatedData)
      let userpostings = postings.getAllUserPostings(req.params.username)
      let allallpostings = postings.getAllPostings()

      console.log(updatedData)
      console.log("-----------------------------------------")
      console.log(updated)
      console.log("-----------------------------------------")
      console.log(userpostings)
      console.log("-----------------------------------------")
      console.log(allallpostings)
    
      res.sendStatus(200);
    })
    .delete(passport.authenticate('jwt', { session: false }), (req,res) => {
      // code for validating the user
      if(req.user.username != req.params.username) {
        return res.sendStatus(403)
      }
      
      const postget = postings.getPosting(req.params.postId)
      console.log(postget)
      if(postget == undefined) {
        return res.sendStatus(404)
      }
      console.log(postget.username)
      if(postget.username != req.params.username) {
        return res.sendStatus(403)
      }

      // main deletion code
      let allpostings = postings.getAllPostings()
      const indextobedeleted = allpostings.indexOf(postget)

      let deleted = postings.deletePosting(indextobedeleted)
      const allpostingsafterdeletion = postings.getAllUserPostings(req.params.username)
      const allallpostings = postings.getAllPostings()

      console.log(deleted)
      console.log("-----------------------------------------")
      console.log(allpostingsafterdeletion)
      console.log("-----------------------------------------")
      console.log(allallpostings)
      
      res.sendStatus(200);
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

let serverInstance = null

module.exports = {
    start: function() {
        serverInstance = app.listen(app.get('port'), () => {
            console.log(`Graded Excercise API listening at `, app.get('port'))
        })
    },
    close: function() {
        serverInstance.close()
    }
}