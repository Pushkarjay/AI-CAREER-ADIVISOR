const express = require('express');
const router = express.Router();
const { DiscussServiceClient } = require("@google-ai/generativelanguage").v1beta2;
const { GoogleAuth } = require("google-auth-library");

const MODEL_NAME = "models/chat-bison-001";
const API_KEY = process.env.GEMINI_API_KEY;

const client = new DiscussServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;
    const result = await client.generateMessage({
      model: MODEL_NAME,
      prompt: {
        context: context,
        messages: [{ content: message }],
      },
    });
    res.status(200).send(result);
  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
