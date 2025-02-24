import PageTheoForm from "@/components/page-theo-form";
import {
  KV__getAllSubmittedModels,
  KV__getUserFromToken,
  KV__setUserToken,
} from "@/server/db/redis";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";
import { authSchema } from "@/shared/validate-form";
import { submitNewModelAction } from "@/server/actions/submit-new-model";
import { formatDistanceToNow } from "date-fns";

async function authTokenCheck() {
  const cookieStore = await cookies();
  const token = cookieStore.get("page-theo-token")?.value;

  if (!token) {
    throw new Error("you aren't supposed to be here");
  }

  const dataFromKv = await KV__getUserFromToken(token);
  if (!dataFromKv || !dataFromKv.username)
    throw new Error("you aren't supposed to be here");

  return dataFromKv;
}

async function ModelPage() {
  const models = await KV__getAllSubmittedModels();
  return (
    <div className="w-full max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Page Theo
        </h1>
        <p className="mt-2 text-muted-foreground">
          Submit new model drops and Theo will be notified instantly
        </p>
      </div>

      <PageTheoForm
        action={async (formdata) => {
          "use server";
          const userData = await authTokenCheck();
          await submitNewModelAction(formdata, userData.username);
          revalidatePath("/fake-path");
        }}
      />

      <div className="bg-card rounded-lg border shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-6">Recent Submissions</h2>
        <div className="divide-y">
          {models.map((model) => (
            <div
              key={model.model}
              className="py-4 flex items-center justify-between gap-4 group"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{model.model}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span>{model.submitter}</span>
                  {model.submittedAt && (
                    <>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(model.submittedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {models.length === 0 && (
            <p className="py-4 text-center text-muted-foreground">
              No models submitted yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

async function HomeContent() {
  try {
    await authTokenCheck();

    return <ModelPage />;
  } catch (error) {
    console.error(error);
    return (
      <AuthForm
        action={async (formdata) => {
          "use server";

          const { username, passphrase } = authSchema.parse(formdata);

          if (passphrase !== process.env.PASSPHRASE) {
            throw new Error("you aren't supposed to be here");
          }

          // User is authenticated, we can create and store a cookie now
          const token = crypto.randomUUID();

          await KV__setUserToken(token, username);

          const cookieStore = await cookies();
          cookieStore.set("page-theo-token", token);

          // Hack to revalidate without killing caches
          revalidatePath("/fake-path");
        }}
      />
    );
  }
}

export default function Home() {
  return (
    <main className="min-h-screen w-full py-12 px-4 sm:px-6 md:py-16 lg:py-24">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">Loading...</div>
        }
      >
        <HomeContent />
      </Suspense>
    </main>
  );
}
