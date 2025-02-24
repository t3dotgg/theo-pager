import * as z from "zod";

export const submitNewModelSchema = z.object({
  model: z.string().min(1, "Model is required"),
});

export const authSchema = z.object({
  username: z.string(),
  passphrase: z.string(),
});
