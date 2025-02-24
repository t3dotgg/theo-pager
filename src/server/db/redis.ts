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

export async function submitNewModel(
  model: string,
  resourceLink: string,
  submitter: string
) {
  await redisClient.set(
    `model:${model}`,
    JSON.stringify({ model, resourceLink, submitter })
  );
}

export async function getAllSubmittedModels() {
  const models = await redisClient.keys("model:*");
  return models.map(async (model) => {
    const data = await redisClient.get(model);
    if (!data) return null;
    return JSON.parse(data) as {
      model: string;
      resourceLink: string;
      submitter: string;
    };
  });
}
