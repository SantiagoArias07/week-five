const getTest = (req, res) => {
  res.json({ message: 'API working', status: 'ok', version: '1.0.0' });
};

module.exports = { getTest };
