import { formSchema } from "@/shared/validate-form";
import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!;
const theoPhoneNumber = process.env.THEO_PHONE_NUMBER!;
const passphrase = process.env.PASSPHRASE!;

const client = twilio(accountSid, authToken);

export async function POST(request: Request) {
  const body = await request.json();

  const validated = formSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const data = validated.data;

  if (data.passphrase !== passphrase) {
    return NextResponse.json({ error: "Invalid passphrase" }, { status: 403 });
  }

  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say(
    `New model alert! ${data.model} just dropped. Check out ${data.resourceLink} for more information.`
  );

  try {
    const call = await client.calls.create({
      twiml: twiml.toString(),
      to: theoPhoneNumber,
      from: twilioPhoneNumber,
    });

    return NextResponse.json({ message: "Call initiated", callSid: call.sid });
  } catch (error) {
    console.error("Error making Twilio call:", error);
    return NextResponse.json(
      { error: "Failed to initiate call" },
      { status: 500 }
    );
  }
}
