import type { submitNewModelSchema } from "@/shared/validate-form";
import Redis from "ioredis";
import type { z } from "zod";

const redisClient = new Redis(process.env.REDIS_URL!);

export default redisClient;

export async function KV__getUserFromToken(token: string) {
  const dataFromKv = await redisClient.get(`token:${token}`);

  if (!dataFromKv) return null;

  const parsed = JSON.parse(dataFromKv) as { username: string };
  if (!parsed || !parsed.username) return null;

  return parsed;
}

export async function KV__setUserToken(token: string, username: string) {
  await redisClient.set(`token:${token}`, JSON.stringify({ username }));
}

export async function KV__submitModel(
  input: z.infer<typeof submitNewModelSchema>,
  submitter: string
) {
  await redisClient.set(
    `model:${input.model}:${submitter}`,
    JSON.stringify({
      ...input,
      submitter,
      submittedAt: new Date().toISOString(),
    })
  );
}

export async function KV__getAllSubmittedModels() {
  const models = await redisClient.keys("model:*");
  if (models.length === 0) return [];
  const data = await redisClient.mget(...models);

  return data.map((item) => {
    if (!item) throw new Error("Model not found");
    return JSON.parse(item) as {
      model: string;
      resourceLink: string;
      submitter: string;
      submittedAt: string;
    };
  });
}
