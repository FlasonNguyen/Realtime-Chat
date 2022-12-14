const User = require("../models/User");
const users = [];

function userJoin(id, username, room) {
  const user = { id, username, room };
  users.push(user);

  return user;
}

function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

function leaveChat(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1);
  }
}

function getRoomUsers(room) {
  return users.filter((user) => user.id === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  leaveChat,
  getRoomUsers,
};
