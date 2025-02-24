import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL!);

export default redisClient;
