import * as z from "zod";

export const formSchema = z.object({
  model: z.string().min(1, "Model is required"),
  resourceLink: z.string().optional(),
  passphrase: z.string().min(1, "Passphrase is required"),
});
