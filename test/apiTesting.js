const chai = require('chai')
const expect = require('chai').expect
chai.use(require('chai-http'))
chai.use(require('chai-json-schema-ajv'))
const server = require('../server')
const { assert } = require('chai')
const api = 'http://localhost:3000'
const jsonwebtoken = require('jsonwebtoken');
const userSuccessSchema = require('./schemas/userSuccessSchema.json')
const userloggedinSchema = require('./schemas/userloggedinSchema.json')
const fs = require('fs')

function createNewUser() {
  return chai.request(api)
  .post('/users')
  .set('Content-Type', 'application/json')
  .send({
    username: "david",
    password: "davidpassword",
    firstName: "david",
    lastName: "Davidson"
  })
}

describe('Testing the API', async function() {

  let JWT = null
  let decodeJWT = null

  before(async function() {
    server.start()

    // logging in correctly to acquire valid Json web token
    await chai.request(api)
      .get('/users/login')
      .auth('tester', 'testerpassword')
      .then(response => {
        JWT = response.body.token
        decodeJWT = jsonwebtoken.decode(JWT, {complete: true})
        console.log(response.body)
        console.log(JWT)
        console.log(decodeJWT)
      }) 
  })

  after(function() {
    server.close()
  })

  describe('Testing route /users', function() {

    it("Should create new user successfully", async function() {
      await createNewUser()
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(201)
          expect(response.body).to.be.jsonSchema(userSuccessSchema)
        })
        .catch(error => {
          assert.fail(error)
        })
    })

    it("Should return 400 if username already exists", async function() {
      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          username: "tester",
          password: "testing1234",
          firstName: "tester",
          lastName: "testing"
        })
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })

    it("Should return 400 if username is missing", async function() {
      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          password: "testing1234",
          firstName: "tester",
          lastName: "testing"
        })
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })

    it("Should return 400 if password is missing", async function() {
      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          username: "tester",
          firstName: "tester",
          lastName: "testing"
        })
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })

    it("Should return 400 if firstName is missing", async function() {
      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          username: "tester",
          password: "testing1234",
          lastName: "testing"
        })
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })

    it("Should return 400 if lastName is missing", async function() {
      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          username: "tester",
          password: "testing1234",
          firstName: "tester"
        })
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })

    it("Should return 400 if username is a number", async function() {
      await chai.request(api)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({
          username: 124124,
          password: "testing1234",
          firstName: "tester",
          lastName: "testing"
        })
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })
  })

  describe('Testing route /users/login', function() {
    
    it("Should pass with correct credentials", async function() {
      await chai.request(api)
      .get('/users/login')
      .auth('tester', 'testerpassword')
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(200)
        expect(response.body).to.be.jsonSchema(userloggedinSchema)
      })
    })

    it("Should return 401 when the username is wrong", async function() {
      await chai.request(api)
      .get('/users/login')
      .auth('te', 'testerpassword')
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(401)
      })
    })

    it("Should return 401 when the password is wrong", async function() {
      await chai.request(api)
      .get('/users/login')
      .auth('tester', 'testerpass')
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(401)
      })
    })
  }) 

  describe('Testing route /users/:username/postings', function() {
    
    it('Should create a new posting', async function() {
      await chai.request(api)
        .post('/users/tester/postings')
        .set('Authorization', 'Bearer ' + JWT)
        .set('Content-Type', 'application/form-data')
        .field('title','Duckling')
        .field('description','Painting with duck')
        .field('category','Paintings')
        .field('location','Helsinki, FI')
        .field('askingPrice','999')
        .field('dateofPosting','2021-02-24')
        .field('deliveryType', 'pickup')
        .field('contactInfo','david@email.com')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/firekaczka.png", 'firekaczka.png')
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(201)
        })
        .catch(error => {
          throw error
        })
    })
    
    it('Should return 401 due to missing JWT', async function() {
      await chai.request(api)
        .post('/users/tester/postings')
        .set('Authorization', 'Bearer ')
        .set('Content-Type', 'application/form-data')
        .field('title','Lovley duck')
        .field('description','Beautiful duck painting')
        .field('category','Paintings')
        .field('location','Oulu, FI')
        .field('askingPrice','420')
        .field('dateofPosting','2021-02-24')
        .field('deliveryType', 'pickup')
        .field('contactInfo','david@email.com')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/firekaczka.png", 'firekaczka.png')
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(401)
        })
        .catch(error => {
          throw error
        })
    })

    it('Should return 403 due to wrong account', async function() {
      await chai.request(api)
        .post('/users/johndoe/postings')
        .set('Authorization', 'Bearer ' + JWT)
        .set('Content-Type', 'application/form-data')
        .field('title','Lovley duck')
        .field('description','Beautiful duck painting')
        .field('category','Paintings')
        .field('location','Oulu, FI')
        .field('askingPrice','420')
        .field('dateofPosting','2021-02-24')
        .field('deliveryType', 'pickup')
        .field('contactInfo','david@email.com')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/firekaczka.png", 'firekaczka.png')
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(403)
        })
        .catch(error => {
          throw error
        })
    })

    it('Should return 400 due to missing title', async function() {
      await chai.request(api)
        .post('/users/tester/postings')
        .set('Authorization', 'Bearer ' + JWT)
        .set('Content-Type', 'application/form-data')
        .field('description','Beautiful duck painting')
        .field('category','Paintings')
        .field('location','Oulu, FI')
        .field('askingPrice','420')
        .field('dateofPosting','2021-02-24')
        .field('deliveryType', 'pickup')
        .field('contactInfo','david@email.com')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/firekaczka.png", 'firekaczka.png')
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })

    it('Should return 400 due to missing description', async function() {
      await chai.request(api)
        .post('/users/tester/postings')
        .set('Authorization', 'Bearer ' + JWT)
        .set('Content-Type', 'application/form-data')
        .field('title','Lovley duck')
        .field('category','Paintings')
        .field('location','Oulu, FI')
        .field('askingPrice','420')
        .field('dateofPosting','2021-02-24')
        .field('deliveryType', 'pickup')
        .field('contactInfo','david@email.com')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/firekaczka.png", 'firekaczka.png')
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })

    it('Should return 400 due to missing category', async function() {
      await chai.request(api)
        .post('/users/tester/postings')
        .set('Authorization', 'Bearer ' + JWT)
        .set('Content-Type', 'application/form-data')
        .field('title','Lovley duck')
        .field('description','Beautiful duck painting')
        .field('location','Oulu, FI')
        .field('askingPrice','420')
        .field('dateofPosting','2021-02-24')
        .field('deliveryType', 'pickup')
        .field('contactInfo','david@email.com')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/firekaczka.png", 'firekaczka.png')
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })

    it('Should return 400 due to missing location', async function() {
      await chai.request(api)
        .post('/users/tester/postings')
        .set('Authorization', 'Bearer ' + JWT)
        .set('Content-Type', 'application/form-data')
        .field('title','Lovley duck')
        .field('description','Beautiful duck painting')
        .field('category','Paintings')
        .field('askingPrice','420')
        .field('dateofPosting','2021-02-24')
        .field('deliveryType', 'pickup')
        .field('contactInfo','david@email.com')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/firekaczka.png", 'firekaczka.png')
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })

    it('Should return 400 due to missing askingPrice', async function() {
      await chai.request(api)
        .post('/users/tester/postings')
        .set('Authorization', 'Bearer ' + JWT)
        .set('Content-Type', 'application/form-data')
        .field('title','Lovley duck')
        .field('description','Beautiful duck painting')
        .field('category','Paintings')
        .field('location','Oulu, FI')
        .field('dateofPosting','2021-02-24')
        .field('deliveryType', 'pickup')
        .field('contactInfo','david@email.com')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/firekaczka.png", 'firekaczka.png')
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })

    it('Should return 400 due to missing dateofPosting', async function() {
      await chai.request(api)
        .post('/users/tester/postings')
        .set('Authorization', 'Bearer ' + JWT)
        .set('Content-Type', 'application/form-data')
        .field('title','Lovley duck')
        .field('description','Beautiful duck painting')
        .field('category','Paintings')
        .field('location','Oulu, FI')
        .field('askingPrice','420')
        .field('deliveryType', 'pickup')
        .field('contactInfo','david@email.com')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/firekaczka.png", 'firekaczka.png')
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })

    it('Should return 400 due to missing deliveryType', async function() {
      await chai.request(api)
        .post('/users/tester/postings')
        .set('Authorization', 'Bearer ' + JWT)
        .set('Content-Type', 'application/form-data')
        .field('title','Lovley duck')
        .field('description','Beautiful duck painting')
        .field('category','Paintings')
        .field('location','Oulu, FI')
        .field('askingPrice','420')
        .field('dateofPosting','2021-02-24')
        .field('contactInfo','david@email.com')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/firekaczka.png", 'firekaczka.png')
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })

    it('Should return 400 due to wrong deliveryType', async function() {
      await chai.request(api)
        .post('/users/tester/postings')
        .set('Authorization', 'Bearer ' + JWT)
        .set('Content-Type', 'application/form-data')
        .field('title','Lovley duck')
        .field('description','Beautiful duck painting')
        .field('category','Paintings')
        .field('location','Oulu, FI')
        .field('askingPrice','420')
        .field('dateofPosting','2021-02-24')
        .field('deliveryType', 'pick')
        .field('contactInfo','david@email.com')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/firekaczka.png", 'firekaczka.png')
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })

    it('Should return 400 due to missing contactInfo', async function() {
      await chai.request(api)
        .post('/users/tester/postings')
        .set('Authorization', 'Bearer ' + JWT)
        .set('Content-Type', 'application/form-data')
        .field('title','Lovley duck')
        .field('description','Beautiful duck painting')
        .field('category','Paintings')
        .field('location','Oulu, FI')
        .field('askingPrice','420')
        .field('dateofPosting','2021-02-24')
        .field('deliveryType', 'pickup')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/firekaczka.png", 'firekaczka.png')
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })

    it('Should return 400 due to missing image(s)', async function() {
      await chai.request(api)
        .post('/users/tester/postings')
        .set('Authorization', 'Bearer ' + JWT)
        .set('Content-Type', 'application/form-data')
        .field('title','Lovley duck')
        .field('description','Beautiful duck painting')
        .field('category','Paintings')
        .field('location','Oulu, FI')
        .field('askingPrice','420')
        .field('dateofPosting','2021-02-24')
        .field('deliveryType', 'pickup')
        .field('contactInfo','david@email.com')
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })

    it('Should return 400 due to too many images', async function() {
      await chai.request(api)
        .post('/users/tester/postings')
        .set('Authorization', 'Bearer ' + JWT)
        .set('Content-Type', 'application/form-data')
        .field('title','Lovley duck')
        .field('description','Beautiful duck painting')
        .field('category','Paintings')
        .field('location','Oulu, FI')
        .field('askingPrice','420')
        .field('dateofPosting','2021-02-24')
        .field('deliveryType', 'pickup')
        .field('contactInfo','david@email.com')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/firekaczka.png", 'firekaczka.png')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/20150312_180342.jpg", '20150312_180342.jpg')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/20210121_101433.jpg", '20210121_101433.jpg')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/20210223_210230.jpg", '20210223_210230.jpg')
        .attach('images', "D:/Project/web-interfaces-graded-excercise/uploads/image1.png", 'image1.png')
        .then(response => {
          expect(response).to.have.property('status')
          expect(response.status).to.equal(400)
        })
        .catch(error => {
          throw error
        })
    })


  })
  describe('Testing route /postings/search', function() {
    
    it("Should return all postings and code 200 when nothing is selected", async function() {
      await chai.request(api)
      .get('/postings/search')
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(200)
      })
    })

    it("Should return 200 when category is selected", async function() {
      await chai.request(api)
      .get('/postings/search')
      .query({category: 'Paintings'})
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(200)
      })
    })

    it("Should return 200 when location is selected", async function() {
      await chai.request(api)
      .get('/postings/search')
      .query({location: 'Oulu, FI'})
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(200)
      })
    })

    it("Should return 200 when date is selected", async function() {
      await chai.request(api)
      .get('/postings/search')
      .query({dateofPosting: '2021-02-24'})
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(200)
      })
    })
  })

  describe('testing route DELETE METHOD /users/:username/postings/:postId', function() {

    it("Should successfully DELETE listing and return code 200", async function() {
      await chai.request(api)
      .delete('/users/tester/postings/4e3c79de-8a2b-418f-a655-80e0fc51f518')
      .set('Authorization', 'Bearer ' + JWT)
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(200)
      })
      .catch(error => {
        assert.fail(error)
      })
    })

    it("Should return 403 due to wrong username", async function() {
      await chai.request(api)
      .delete('/users/johndoe/postings/4e3c79de-8a2b-418f-a655-80e0fc51f518')
      .set('Authorization', 'Bearer ' + JWT)
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(403)
      })
      .catch(error => {
        assert.fail(error)
      })
    })

    it("Should return 403 due to attempting to access a different users post", async function() {
      await chai.request(api)
      .delete('/users/tester/postings/b8c4f249-1e2a-4302-b28b-7b77ad524ee2')
      .set('Authorization', 'Bearer ' + JWT)
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(403)
      })
      .catch(error => {
        assert.fail(error)
      })
    })

    it("Should return 401 due to missing JWT", async function() {
      await chai.request(api)
      .delete('/users/tester/postings/4e3c79de-8a2b-418f-a655-80e0fc51f518')
      .set('Authorization', 'Bearer ')
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(401)
      })
      .catch(error => {
        assert.fail(error)
      })
    })

    it("Should return 404 due to missing posting", async function() {
      await chai.request(api)
      .delete('/users/tester/postings/b8c4f249-1e22-77ad524ee2')
      .set('Authorization', 'Bearer ' + JWT)
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(404)
      })
      .catch(error => {
        assert.fail(error)
      })
    })
  })

  describe('testing route PUT METHOD /users/:username/postings/:postId', function() {
    
    it("Should successfully edit the listing title and return code 200", async function() {
      await chai.request(api)
      .put('/users/tester/postings/be19d484-67e7-43eb-ada7-c6deb49b411e')
      .set('Authorization', 'Bearer ' + JWT)
      .send({
        "title": "Small Duck Painting"
      })
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(200)
      })
      .catch(error => {
        assert.fail(error)
      })
    })

    it("Should return 401 due to missing JWT", async function() {
      await chai.request(api)
      .put('/users/tester/postings/be19d484-67e7-43eb-ada7-c6deb49b411e')
      .set('Authorization', 'Bearer ')
      .send({
        "title": "Small Duck Painting"
      })
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(401)
      })
      .catch(error => {
        assert.fail(error)
      })
    })

    it("Should return 403 due to wrong username", async function() {
      await chai.request(api)
      .put('/users/johndoe/postings/be19d484-67e7-43eb-ada7-c6deb49b411e')
      .set('Authorization', 'Bearer ' + JWT)
      .send({
        "title": "Small Duck Painting"
      })
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(403)
      })
      .catch(error => {
        assert.fail(error)
      })
    })

    it("Should return 403 due to trying to access a different users post", async function() {
      await chai.request(api)
      .put('/users/tester/postings/b8c4f249-1e2a-4302-b28b-7b77ad524ee2')
      .set('Authorization', 'Bearer ' + JWT)
      .send({
        "title": "Small Duck Painting"
      })
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(403)
      })
      .catch(error => {
        assert.fail(error)
      })
    })

    it("Should return 404 due to posting not existing", async function() {
      await chai.request(api)
      .put('/users/tester/postings/b8c4f249-1e2a-4302-')
      .set('Authorization', 'Bearer ' + JWT)
      .send({
        "title": "Small Duck Painting"
      })
      .then(response => {
        expect(response).to.have.property('status')
        expect(response.status).to.equal(404)
      })
      .catch(error => {
        assert.fail(error)
      })
    })
  })
})