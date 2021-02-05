const { v4: uuidv4 } = require('uuid');

let postings = [];

module.exports = {
  insertPosting: (title, description,  category, location, images, askingPrice, dateofPosting, deliveryType, username, contactInfo ) => {
    postings.push({
      id: uuidv4(),
      title,
      description,
      category,
      location,
      images,
      askingPrice,
      dateofPosting,
      deliveryType,
      username,
      contactInfo
    });
  },
  getAllPostings: () => postings,
  getAllUserPostings: (username) => postings.filter(p => p.username == username),
  getPosting: (postingId) => postings.find(p => p.id == postingId)
}

//req.body.title, req.body.description, req.body.location, req.body.images, req.body.askingPrice, req.body.dateofPosting, req.body.deliveryType, 
//req.user.username, req.body.contactInfo
/*todos.push({
      id: uuidv4(),
      userId,
      description,
      dueDate,
      status: "open"
    });
*/