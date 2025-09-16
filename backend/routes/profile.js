const express = require('express');
const router = express.Router();
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();

router.post('/', async (req, res) => {
  try {
    const { userId, profileData } = req.body;
    if (!userId || !profileData) {
      return res.status(400).send('Missing userId or profileData');
    }
    const docRef = firestore.collection('profiles').doc(userId);
    await docRef.set(profileData);
    res.status(201).send({ message: 'Profile saved successfully' });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
