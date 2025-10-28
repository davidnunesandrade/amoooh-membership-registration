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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { X } from "lucide-react";

const memberProfileSchema = z.object({
  phone: z.string().optional(),
  position: z.string().optional(),
  bio: z.string().optional(),
  companyId: z.coerce.number().optional().nullable(),
  role: z.string().default("member"),
});

type MemberProfileValues = z.infer<typeof memberProfileSchema>;

interface MemberProfileProps {
  memberId: number;
  userId: string;
}

export function MemberProfile({ memberId, userId }: MemberProfileProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [memberData, setMemberData] = React.useState<any>(null);
  const [availableMedia, setAvailableMedia] = React.useState<any[]>([]);
  const [selectedMedia, setSelectedMedia] = React.useState<number[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = React.useState(false);

  const form = useForm<MemberProfileValues>({
    resolver: zodResolver(memberProfileSchema),
  });

  React.useEffect(() => {
    fetchMemberData();
    fetchAvailableMedia();
  }, [memberId]);

  async function fetchMemberData() {
    try {
      const data = await apiClient.getMemberById(memberId);
      setMemberData(data);
      form.reset({
        phone: data.phone || "",
        position: data.position || "",
        bio: data.bio || "",
        companyId: data.companyId || null,
        role: data.role || "member",
      });

      // Fetch associated media
      const media = await apiClient.getMemberMedia(memberId);
      setSelectedMedia(media.map((m: any) => m.id));
    } catch (error) {
      toast.error("Failed to load member data");
      console.error(error);
    }
  }

  async function fetchAvailableMedia() {
    setIsLoadingMedia(true);
    try {
      const response = await apiClient.getMedia({ limit: 100 });
      setAvailableMedia(response.data);
    } catch (error) {
      toast.error("Failed to load media options");
      console.error(error);
    } finally {
      setIsLoadingMedia(false);
    }
  }

  async function onSubmit(values: MemberProfileValues) {
    setIsSubmitting(true);

    try {
      await apiClient.updateMember(memberId, values);
      toast.success("Profile updated successfully");
      fetchMemberData();
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMediaSelection(mediaId: number, checked: boolean) {
    try {
      if (checked) {
        await apiClient.addMemberMedia(memberId, [mediaId]);
        setSelectedMedia([...selectedMedia, mediaId]);
        toast.success("Media association added");
      } else {
        await apiClient.removeMemberMedia(memberId, [mediaId]);
        setSelectedMedia(selectedMedia.filter((id) => id !== mediaId));
        toast.success("Media association removed");
      }
    } catch (error) {
      toast.error("Failed to update media associations");
      console.error(error);
    }
  }

  if (!memberData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Member Profile</CardTitle>
          <CardDescription>
            Manage your profile information and media associations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div>
              <span className="text-sm font-medium">Name:</span>{" "}
              <span className="text-sm">{memberData.userName}</span>
            </div>
            <div>
              <span className="text-sm font-medium">Email:</span>{" "}
              <span className="text-sm">{memberData.userEmail}</span>
            </div>
            <div>
              <span className="text-sm font-medium">Role:</span>{" "}
              <Badge variant="secondary">{memberData.role}</Badge>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Your job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Associated Media</CardTitle>
          <CardDescription>
            Select the display media you are associated with
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMedia ? (
            <div>Loading media options...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableMedia.map((media) => (
                  <div
                    key={media.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`media-${media.id}`}
                      checked={selectedMedia.includes(media.id)}
                      onCheckedChange={(checked) =>
                        handleMediaSelection(media.id, checked as boolean)
                      }
                    />
                    <div className="flex-1 space-y-1">
                      <label
                        htmlFor={`media-${media.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {media.name}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {media.type} {media.location && `• ${media.location}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {availableMedia.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No media outlets available. Please add some media outlets first.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
