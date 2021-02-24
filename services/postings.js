const { v4: uuidv4 } = require('uuid');

let postings = [
  {
    id: 'be19d484-67e7-43eb-ada7-c6deb49b411e',
    title: 'Lovley duck',
    description: 'Beautiful duck painting',
    category: 'Paintings',
    location: 'Oulu, FI',
    images: 'https://res.cloudinary.com/dvsvon5jp/image/upload/v1614194092/api/be19d484-67e7-43eb-ada7-c6deb49b411e.png',
    askingPrice: '420',
    dateofPosting: '2021-02-24',
    deliveryType: 'pickup',
    username: 'tester',
    contactInfo: 'tester@email.com'
  },
  {
    id: '619a15c8-5a8f-4164-822c-61326ae92201',
    title: 'Winter Bike',
    description: 'Great bike for winter',
    category: 'Bicycles',
    location: 'Helsinki, FI',
    images: 'https://res.cloudinary.com/dvsvon5jp/image/upload/v1614194363/api/619a15c8-5a8f-4164-822c-61326ae92201.jpg',
    askingPrice: '256',
    dateofPosting: '2021-02-24',
    deliveryType: 'pickup',
    username: 'tester',
    contactInfo: 'tester@email.com'
  },
  {
    id: 'e4be2d40-69a3-4a79-8eb4-899e61a1695c',
    title: 'Snow Shover',
    description: 'Great for scooping snow away',
    category: 'Gardening',
    location: 'Oulu, FI',
    images: 'https://res.cloudinary.com/dvsvon5jp/image/upload/v1614194093/api/e4be2d40-69a3-4a79-8eb4-899e61a1695c.jpg',
    askingPrice: '842',
    dateofPosting: '2021-01-14',
    deliveryType: 'delivery',
    username: 'tester',
    contactInfo: 'tester@email.com'
  },
  {
    id: '4e3c79de-8a2b-418f-a655-80e0fc51f518',
    title: 'Animal Painting',
    description: 'Painting with cute animals',
    category: 'Paintings',
    location: 'Oulu, FI',
    images: 'https://res.cloudinary.com/dvsvon5jp/image/upload/v1614194092/api/4e3c79de-8a2b-418f-a655-80e0fc51f518.jpg',
    askingPrice: '353',
    dateofPosting: '2021-02-19',
    deliveryType: 'delivery',
    username: 'tester',
    contactInfo: 'tester@email.com'
  },
  {
    id: 'b8c4f249-1e2a-4302-b28b-7b77ad524ee2',
    title: 'Trophy Case',
    description: 'Large Trophy case fits very big trophies',
    category: 'Furniture',
    location: 'Helsinki, FI',
    images: 'https://res.cloudinary.com/dvsvon5jp/image/upload/v1614194092/api/b8c4f249-1e2a-4302-b28b-7b77ad524ee2.jpg',
    askingPrice: '800',
    dateofPosting: '2021-01-14',
    deliveryType: 'pickup',
    username: 'johndoe',
    contactInfo: 'johndoe@email.com'
  },
];

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
