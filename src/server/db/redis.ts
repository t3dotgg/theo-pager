import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL!);

export default redisClient;

export async function getUserFromToken(token: string) {
  const dataFromKv = await redisClient.get(`token:${token}`);

  if (!dataFromKv) return null;

  const parsed = JSON.parse(dataFromKv) as { username: string };
  if (!parsed || !parsed.username) return null;

  return parsed;
}

export async function setUserToken(token: string, username: string) {
  await redisClient.set(`token:${token}`, JSON.stringify({ username }));
}
