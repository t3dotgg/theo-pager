import { submitNewModelSchema } from "@/shared/validate-form";
import twilio from "twilio";
import { z } from "zod";
import { KV__submitModel } from "../db/redis";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!;
const theoPhoneNumber = process.env.THEO_PHONE_NUMBER!;

const client = twilio(accountSid, authToken);

export async function submitNewModelAction(
  input: z.infer<typeof submitNewModelSchema>,
  submitter: string
) {
  console.log("[SUBMISSION]", input, submitter);

  await KV__submitModel(input, submitter);

  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say(
    `New model alert! ${input.model} just dropped. Submitted by ${submitter}.`
  );

  try {
    const call = await client.calls.create({
      twiml: twiml.toString(),
      to: theoPhoneNumber,
      from: twilioPhoneNumber,
    });

    console.log("Call created", call);
    // TODO: redo call until it goes through

    return { success: true };
  } catch (error) {
    console.error("Error making Twilio call:", error);
    return { success: false, error };
  }
}
