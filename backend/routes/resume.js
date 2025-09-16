const express = require('express');
const router = express.Router();
const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;

const client = new DocumentProcessorServiceClient();

router.post('/', async (req, res) => {
  try {
    // Document AI processing logic here
    res.status(200).send({ message: 'Resume parsed successfully', data: {} });
  } catch (error) {
    console.error('Error parsing resume:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
