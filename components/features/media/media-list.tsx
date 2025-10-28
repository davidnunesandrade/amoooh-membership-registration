"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EntityTable } from "../shared/entity-table";
import { MediaForm } from "./media-form";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface Media {
  id: number;
  name: string;
  type: string;
  location: string | null;
  contactInfo: string | null;
  description: string | null;
  createdAt: string;
}

export function MediaList() {
  const [data, setData] = React.useState<Media[]>([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedMedia, setSelectedMedia] = React.useState<Media | null>(null);
  const [deleteMedia, setDeleteMedia] = React.useState<Media | null>(null);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getMedia({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
      });
      setData(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error("Failed to load media");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (media: Media) => {
    try {
      await apiClient.deleteMedia(media.id);
      toast.success("Media deleted successfully");
      setDeleteMedia(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete media");
      console.error(error);
    }
  };

  const columns: ColumnDef<Media>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => row.getValue("location") || "—",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const desc = row.getValue("description") as string;
        return desc ? (
          <span className="truncate max-w-xs block">{desc}</span>
        ) : (
          "—"
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const media = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedMedia(media);
                  setIsFormOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteMedia(media)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Display Media</h2>
          <p className="text-muted-foreground">
            Manage your media outlets and channels
          </p>
        </div>
        <Button onClick={() => {
          setSelectedMedia(null);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Media
        </Button>
      </div>

      <EntityTable
        columns={columns}
        data={data}
        searchPlaceholder="Search media..."
        onSearch={setSearchQuery}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        isLoading={isLoading}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMedia ? "Edit Media" : "Add New Media"}
            </DialogTitle>
            <DialogDescription>
              {selectedMedia
                ? "Update the media outlet details"
                : "Create a new media outlet"}
            </DialogDescription>
          </DialogHeader>
          <MediaForm
            initialData={selectedMedia || undefined}
            onSuccess={() => {
              setIsFormOpen(false);
              setSelectedMedia(null);
              fetchData();
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedMedia(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteMedia}
        onOpenChange={() => setDeleteMedia(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteMedia?.name}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMedia && handleDelete(deleteMedia)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
