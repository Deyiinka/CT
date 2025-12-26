import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { startCronJob } from './cron';
import { getTrendingData, fetchTrendingData } from './api';

const app = express();
const port = process.env.PORT || 3002;

let isFetching = false;

app.use(cors());
app.use(express.json());

app.get('/api/trending', async (req, res) => {
  try {
    let data = getTrendingData();
    // If the data is empty and a fetch is not already in progress,
    // trigger a fetch. This is useful for the first load on a new
    // server instance.
    if (data.data.length === 0 && !isFetching) {
      isFetching = true;
      await fetchTrendingData();
      data = getTrendingData();
      isFetching = false;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  startCronJob();
});
