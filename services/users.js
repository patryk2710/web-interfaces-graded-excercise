const { v4: uuidv4 } = require('uuid');

let users = [
  {
    id: 1,
    username: 'tester',
    password: '$2y$06$PhZ74dT8/5g6B8SgssFq6ey4ojLxmP6pos2DcevMUGw25Vc9jGEou', // testerpassword
    firstName: 'tester',
    lastName: 'testing',
    validApiKey: null
  },
  {
    id: 2,
    username: "johndoe",
    firstName: 'john',
    lastName: 'doe',
    password: '$2y$06$eQav1OaIyWSUnlvPSaFXRe5gWRqXd.s9vac1SV1GafxAr8hdmsgCy', // johndoepassword
    validApiKey: null
  },
];

module.exports = {
  getUserById: (id) => users.find(u => u.id == id),
  getUserByName: (username) => users.find(u => u.username == username),
  addUser: (username, password, firstName, lastName) => {
    users.push({
      id: uuidv4(),
      username,
      password,
      firstName,
      lastName
    });
  }
}