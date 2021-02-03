const { v4: uuidv4 } = require('uuid');

let users = [
  {
    id: 1,
    username: 'tester',
    email: 'tester@mail.com',
    password: '$2y$06$PhZ74dT8/5g6B8SgssFq6ey4ojLxmP6pos2DcevMUGw25Vc9jGEou', // testerpassword
    validApiKey: null
  },
  {
    id: 2,
    username: "johndoe",
    email: 'john@mail.com',
    password: '$2y$06$eQav1OaIyWSUnlvPSaFXRe5gWRqXd.s9vac1SV1GafxAr8hdmsgCy', // johndoepassword
    validApiKey: null
  },
];

module.exports = {
  getUserById: (id) => users.find(u => u.id == id),
  getUserByName: (username) => users.find(u => u.username == username),
  addUser: (username, email, password) => {
    users.push({
      id: uuidv4(),
      username,
      email,
      password
    });
  }

}