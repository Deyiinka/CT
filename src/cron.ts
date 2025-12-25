import cron from 'node-cron';
import { fetchTrendingData } from './api';

export const startCronJob = () => {
  // Schedule a job to run once per hour
  cron.schedule('0 * * * *', () => {
    console.log('Running cron job to fetch trending data...');
    fetchTrendingData();
  });

  // Fetch data on startup.
  // This is disabled to prevent hitting the rate limit on restarts.
  // The first fetch will happen on the first cron run.
  // setTimeout(fetchTrendingData, 1000);
};
