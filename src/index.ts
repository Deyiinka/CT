import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { startCronJob } from './cron';
import { getTrendingData } from './api';

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/api/trending', async (req, res) => {
  try {
    const data = getTrendingData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  startCronJob();
});
