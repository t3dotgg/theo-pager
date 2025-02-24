"use client";

import { useState } from "react";
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
import type { z } from "zod";

import { useToast } from "@/hooks/use-toast";
import { submitNewModelSchema } from "@/shared/validate-form";

export default function PageTheoForm(props: {
  action: (values: z.infer<typeof submitNewModelSchema>) => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof submitNewModelSchema>>({
    resolver: zodResolver(submitNewModelSchema),
    defaultValues: {
      model: "",
    },
  });

  async function onSubmit(values: z.infer<typeof submitNewModelSchema>) {
    setIsLoading(true);
    try {
      await props.action(values);

      toast({
        title: "Success",
        description: "Theo has been paged!",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        // className="w-full bg-card p-6 rounded-lg border shadow-sm"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model that just dropped</FormLabel>
                <FormControl>
                  <Input className="bg-card" placeholder="Enter the model name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full mt-6">
          {isLoading ? "Paging..." : "Page Theo"}
        </Button>
      </form>
    </Form>
  );
}
