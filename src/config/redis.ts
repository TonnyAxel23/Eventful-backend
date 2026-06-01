import Redis from 'redis';
import logger from '../utils/logger';

const redisClient = Redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('connect', () => {
  logger.info('Redis connected successfully');
});

redisClient.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redisClient.connect();

export default redisClient;
