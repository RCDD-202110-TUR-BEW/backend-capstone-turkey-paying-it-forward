const { ObjectId } = require('mongoose').Types;
const requestModel = require('../models/request');

module.exports = {
  getAllRequests: async (req, res) => {
    try {
      const requests = await requestModel.find();
      if (requests.length <= 0) throw new Error('No requests found');
      res.json(requests);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  createRequest: async (req, res) => {
    try {
      req.body.owner = req.user._id;
      await requestModel.create(req.body);
      res.status(201).json({ message: 'Request created successfully' });
    } catch (err) {
      res.status(422).json({ message: err.message });
    }
  },
  getRequestById: async (req, res) => {
    try {
      const requestId = req.params.id;
      if (String(new ObjectId(requestId)) !== requestId.toString())
        throw new Error('Requested request ID is not valid!');
      const request = await requestModel.findById(requestId);
      if (!request)
        throw new Error('The request with the specified ID was not found.');
      res.json(request);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  updateRequest: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedRequest = await requestModel.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );
      if (!updatedRequest) {
        throw new Error('The request with the specified ID was not found.');
      }
      res.json(updatedRequest);
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
  deleteRequest: async (req, res) => {
    const { id } = req.params;
    try {
      const request = await requestModel.findByIdAndDelete(id);
      if (!request) {
        throw new Error('The request with the specified ID was not found.');
      }
      res.status(204).end();
    } catch (err) {
      res.status(422).json({ message: err.message ?? err });
    }
  },
};
