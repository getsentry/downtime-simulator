"use client";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDowntime } from "@/app/actions";

const formSchema = z.object({
  host: z.string({
    required_error: "Host must be selected.",
  }),
  status: z.string({
    required_error: "Status code must be selected.",
  }),
  duration: z.coerce
    .number({
      required_error: "Duration is required",
    })
    .nonnegative()
    .lte(3600),
});

export function SimulatorForm() {
  const hosts = process.env.NEXT_PUBLIC_DOWNTIME_SIMULATOR_HOSTS?.split(",");

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host: hosts?.[0],
      status: "500",
      duration: 60,
    },
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    try {
      const res = await createDowntime({
        host: values.host,
        status: values.status,
        duration: values.duration,
      });

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Downtime created");
    } catch (erro) {
      toast.error("Unable to create downtime");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 w-full max-w-md"
      >
        <FormField
          control={form.control}
          name="host"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Host</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a host" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {hosts?.map((host) => (
                    <SelectItem key={host} value={host}>
                      {host}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status code</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="max-w-32">
                    <SelectValue placeholder="Status code" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="404">404</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input className="max-w-32" placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>In seconds.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isSubmitting && <Button type="submit">Add downtime</Button>}
        {isSubmitting && (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        )}
      </form>
    </Form>
  );
}
