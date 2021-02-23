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
  getPosting: (postingId) => postings.find(p => p.id == postingId),
  deletePosting: (index) => postings.splice(index, 1),
  updatePosting: (index, newPost) => postings.splice(index, 1, newPost),
  getPostingbyCategory: (category) => postings.filter(c => c.category == category),
  getPostingbyLocation: (location) => postings.filter(l => l.location == location),
  getPostingbyDate: (dateofPosting) => postings.filter(d => d.dateofPosting == dateofPosting)
}

