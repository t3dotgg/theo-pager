"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { authSchema } from "@/shared/validate-form";
import Image from "next/image";
import { FaLock, FaUser } from "react-icons/fa";

export default function AuthForm(props: {
  action: (values: z.infer<typeof authSchema>) => Promise<void>;
}) {
  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      passphrase: "",
    },
  });

  async function onSubmit(values: z.infer<typeof authSchema>) {
    props.action(values);
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-32 h-32">
            <Image
              src="https://pbs.twimg.com/profile_images/1799982162831396865/Fnol01I1_400x400.jpg"
              alt="Theo's avatar"
              fill
              className="rounded-full object-cover shadow-lg ring-4 ring-purple-600/20"
              priority
            />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Page Theo
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          You need to have a passphrase from Theo to continue
        </p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-xl border shadow-lg p-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FaUser className="text-purple-600" />
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-white/50 dark:bg-gray-950/50"
                      placeholder="How you want to be identified"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passphrase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FaLock className="text-purple-600" />
                    Passphrase
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="bg-white/50 dark:bg-gray-950/50"
                      placeholder="Theo should have given this to you"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Authenticate
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
