"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaList } from "@/components/features/media/media-list";
import { MemberProfile } from "@/components/features/members/member-profile";
import { useSession } from "@/lib/auth-client";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MembershipPage() {
  const { data: session, isPending } = useSession();
  const [memberData, setMemberData] = React.useState<any>(null);
  const [isLoadingMember, setIsLoadingMember] = React.useState(true);

  React.useEffect(() => {
    if (session?.user) {
      fetchMemberData();
    }
  }, [session]);

  async function fetchMemberData() {
    if (!session?.user?.id) return;

    setIsLoadingMember(true);
    try {
      // Try to get member data, or create if doesn't exist
      const response = await apiClient.getMembers({ search: session.user.id });
      if (response.data.length > 0) {
        setMemberData(response.data[0]);
      } else {
        // Create member profile if doesn't exist
        const newMember = await apiClient.createMember({
          userId: session.user.id,
          role: "member",
        });
        setMemberData(newMember);
      }
    } catch (error) {
      console.error("Error fetching member data:", error);
    } finally {
      setIsLoadingMember(false);
    }
  }

  if (isPending || isLoadingMember) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/sign-in"
              className="text-primary hover:underline"
            >
              Go to login
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Membership & Company Registration
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile, media associations, agencies, and advertisers
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="media">Display Media</TabsTrigger>
          <TabsTrigger value="agencies">Agencies</TabsTrigger>
          <TabsTrigger value="advertisers">Advertisers</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          {memberData ? (
            <MemberProfile
              memberId={memberData.id}
              userId={session.user.id}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p>Loading member profile...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <MediaList />
        </TabsContent>

        <TabsContent value="agencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agencies</CardTitle>
              <CardDescription>
                Manage advertising agencies (Coming Soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Agency management features will be available soon. Similar to
                media management with create, read, update, and delete
                operations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advertisers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advertisers</CardTitle>
              <CardDescription>
                Manage advertisers and their agencies (Coming Soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advertiser management features will be available soon. Includes
                relationship management with agencies.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                View all members and their associations (Admin Only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Member directory and management features for administrators.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
