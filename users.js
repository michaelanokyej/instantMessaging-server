// helper fns for users
const users = [];

const addUser = ({id, name, room}) => {
  // remove all spaces and transform to lowercase

  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // check if name entered is already in the room
  const existingUser = users.find(
    user => (user.room === room) & (user.name === name)
  );

  // Throw error if user exists
  if (existingUser) {
    return { error: "User is already in the room" };
  }

  // create a user object
  const user = { id, name, room };

  // add user to users array
  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex(user => user.id === id);

  // if user exists return user
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => users.find(user => user.id === id);

const getUsersInRoom = (room) => users.find(user => user.room === room);


module.exports = {
  addUser, removeUser, getUser, getUsersInRoom
};