module.exports = {
  getAllItems: (req, res) => {
    res.send('All items');
  },
  getSingleItem: (req, res) => {
    res.send('Single item');
  },
  getAvailableItems: (req, res) => {
    res.send('Available items');
  },
  getFilteredItems: (req, res) => {
    res.send('Filtered items');
  },
  updateItem: (req, res) => {
    res.send('Item with the specified ID has been updated');
  },
  addItem: (req, res) => {
    res.send('New item has been added');
  },
  deleteItem: (req, res) => {
    res.send('Item with the specified ID has been deleted');
  },
};
