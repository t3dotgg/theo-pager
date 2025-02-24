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
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Page Theo
        </h1>
        <p className="text-muted-foreground">
          You need to have a passphrase from Theo to continue
        </p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full max-w-md mx-auto"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
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
                  <FormLabel>Passphrase</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Theo should have given this to you"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Authenticate
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
