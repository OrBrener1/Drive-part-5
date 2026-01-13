const generateId = () => {
  return `f_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
};

module.exports = {
  generateId
};
