import cron from 'node-cron';
import { fetchTrendingData } from './api';

export const startCronJob = () => {
  console.log('Starting cron job...');
  // Schedule a job to run once per day at 7am
  cron.schedule('0 7 * * *', async () => {
    try {
      console.log('Running cron job to fetch trending data...');
      await fetchTrendingData();
    } catch (error) {
      console.error('Error fetching trending data in cron job:', error);
    }
  });

  // Fetch data on startup.
  // This is disabled to prevent hitting the rate limit on restarts.
  // The first fetch will happen on the first cron run.
  // setTimeout(fetchTrendingData, 1000);
};
