const tokenBlacklist = new Set();
exports.addToken = (token) => {
  tokenBlacklist.add(token);
};
exports.clear = () => {
  tokenBlacklist.clear();
};
module.exports = tokenBlacklist;
