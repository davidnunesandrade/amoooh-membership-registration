"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, Filter, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

export default function ReportsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [mediaData, setMediaData] = React.useState<any[]>([]);
  const [agencyData, setAgencyData] = React.useState<any[]>([]);
  const [advertiserData, setAdvertiserData] = React.useState<any[]>([]);
  const [memberData, setMemberData] = React.useState<any[]>([]);

  // Filters
  const [dateRange, setDateRange] = React.useState("all");
  const [mediaType, setMediaType] = React.useState("all");
  const [industry, setIndustry] = React.useState("all");

  React.useEffect(() => {
    fetchAllData();
  }, [dateRange, mediaType, industry]);

  async function fetchAllData() {
    setIsLoading(true);
    try {
      const [media, agencies, advertisers, members] = await Promise.all([
        apiClient.getMedia({ limit: 100 }),
        apiClient.getAgencies({ limit: 100 }),
        apiClient.getAdvertisers({ limit: 100 }),
        apiClient.getMembers({ limit: 100 }),
      ]);

      setMediaData(media.data);
      setAgencyData(agencies.data);
      setAdvertiserData(advertisers.data);
      setMemberData(members.data);
    } catch (error) {
      toast.error("Failed to load report data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Calculate statistics
  const stats = React.useMemo(() => {
    const mediaByType = mediaData.reduce((acc: any, media) => {
      acc[media.type] = (acc[media.type] || 0) + 1;
      return acc;
    }, {});

    const membersByRole = memberData.reduce((acc: any, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {});

    const advertisersByIndustry = advertiserData.reduce((acc: any, adv) => {
      const ind = adv.industry || "Other";
      acc[ind] = (acc[ind] || 0) + 1;
      return acc;
    }, {});

    return {
      totalMedia: mediaData.length,
      totalAgencies: agencyData.length,
      totalAdvertisers: advertiserData.length,
      totalMembers: memberData.length,
      mediaByType: Object.entries(mediaByType).map(([name, value]) => ({
        name,
        value,
      })),
      membersByRole: Object.entries(membersByRole).map(([name, value]) => ({
        name,
        value,
      })),
      advertisersByIndustry: Object.entries(advertisersByIndustry).map(
        ([name, value]) => ({ name, value })
      ),
    };
  }, [mediaData, agencyData, advertiserData, memberData]);

  const handleExport = () => {
    const csvContent = [
      ["Report Type", "Count"],
      ["Total Media", stats.totalMedia],
      ["Total Agencies", stats.totalAgencies],
      ["Total Advertisers", stats.totalAdvertisers],
      ["Total Members", stats.totalMembers],
      [""],
      ["Media by Type"],
      ...stats.mediaByType.map((item: any) => [item.name, item.value]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amooh-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Loading Reports...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive view of membership, media, and company data
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAllData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleExport} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Customize your report view with filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Media Type</Label>
              <Select value={mediaType} onValueChange={setMediaType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="TV">TV</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Print">Print</SelectItem>
                  <SelectItem value="Radio">Radio</SelectItem>
                  <SelectItem value="Outdoor">Outdoor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Media Outlets</CardDescription>
            <CardTitle className="text-3xl">{stats.totalMedia}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Active display media channels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Agencies</CardDescription>
            <CardTitle className="text-3xl">{stats.totalAgencies}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Registered agencies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Advertisers</CardDescription>
            <CardTitle className="text-3xl">{stats.totalAdvertisers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Active advertisers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Members</CardDescription>
            <CardTitle className="text-3xl">{stats.totalMembers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Registered members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="media" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="media">Media Distribution</TabsTrigger>
          <TabsTrigger value="members">Member Roles</TabsTrigger>
          <TabsTrigger value="advertisers">Advertiser Industries</TabsTrigger>
        </TabsList>

        <TabsContent value="media" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Media by Type (Bar Chart)</CardTitle>
                <CardDescription>Distribution of media outlets by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.mediaByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media by Type (Pie Chart)</CardTitle>
                <CardDescription>Percentage distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.mediaByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.mediaByType.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Members by Role</CardTitle>
              <CardDescription>Distribution of member roles</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.membersByRole}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advertisers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advertisers by Industry</CardTitle>
              <CardDescription>Industry breakdown of advertisers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.advertisersByIndustry}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#FFBB28" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Lists */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest additions across all categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mediaData.slice(0, 5).map((media) => (
              <div key={media.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{media.name}</p>
                  <p className="text-sm text-muted-foreground">
                    <Badge variant="secondary">{media.type}</Badge>
                    {media.location && ` • ${media.location}`}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(media.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
