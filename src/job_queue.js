module.exports = {
  enqueue(token, user, month) {
    return Promise.resolve(token, user, month);
  },

  dequeue() {
    return Promise.resolve();
  },
};
