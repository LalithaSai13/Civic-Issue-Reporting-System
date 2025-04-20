import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { franc } from 'franc';
import langs from 'langs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  // Step 1: Detect the language
  const langCode = franc(message);
  let langName = 'English'; // fallback

  if (langCode !== 'und') {
    const lang = langs.where('3', langCode);
    if (lang) {
      langName = lang.name;
    }
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an expert in Indian civic rights. Always answer in very simple, easy-to-understand ${langName}. Avoid legal jargon. Use examples if needed. Answer like you are helping someone with no education understand their rights.`
          },
          { role: 'user', content: message }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error('Chatbot Error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch chatbot reply' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
