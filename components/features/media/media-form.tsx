"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

const mediaFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.string().min(1, "Type is required"),
  location: z.string().optional(),
  contactInfo: z.string().optional(),
  description: z.string().optional(),
});

type MediaFormValues = z.infer<typeof mediaFormSchema>;

interface MediaFormProps {
  initialData?: Partial<MediaFormValues> & { id?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MEDIA_TYPES = ["TV", "Online", "Print", "Radio", "Outdoor", "Other"];

export function MediaForm({ initialData, onSuccess, onCancel }: MediaFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = !!initialData?.id;

  const form = useForm<MediaFormValues>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "",
      location: initialData?.location || "",
      contactInfo: initialData?.contactInfo || "",
      description: initialData?.description || "",
    },
  });

  async function onSubmit(values: MediaFormValues) {
    setIsSubmitting(true);

    try {
      if (isEditing && initialData?.id) {
        await apiClient.updateMedia(initialData.id, values);
        toast.success("Media updated successfully");
      } else {
        await apiClient.createMedia(values);
        toast.success("Media created successfully");
      }
      onSuccess?.();
    } catch (error) {
      toast.error(
        isEditing ? "Failed to update media" : "Failed to create media"
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Media name" {...field} />
              </FormControl>
              <FormDescription>
                The display name for this media outlet
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select media type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MEDIA_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The type or category of this media outlet
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="City, State or Region" {...field} />
              </FormControl>
              <FormDescription>
                Physical or virtual location (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Information</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Email, phone, or other contact details"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Contact details for this media outlet (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional details about this media outlet"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Additional information (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isEditing
              ? "Update Media"
              : "Create Media"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
