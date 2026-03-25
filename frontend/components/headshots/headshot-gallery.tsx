"use client";

import { HeadshotGalleryProps, HeadshotStatus } from "@/lib";
import { Delete, DeleteIcon, Download, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

const HeadshotGallery = ({
  headshots,
  hasMore,
  isLoading,
  onDelete,
  onLoadMore,
  isDeletinghHeadshot
}: HeadshotGalleryProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState(false);
  const [viewingImage, setViewingImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);

  const handleDlete = async (id: string) => {
    if (!onDelete) return;

    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusStyles: Record<HeadshotStatus, string> = {
    completed:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    processing:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading && headshots.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  return (
    <div>
      <Label className="space-y-6">Your Headshots</Label>
      {headshots.map((headshot) => (
        <div
          key={headshot._id}
          className="space-y-3 p-3 border border-border rounded-md"
        >
          {/* header */}
          <div className="flex items-center justify-between">
            {/* date and style */}
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-foreground">
                {formatDate(headshot.processingCompletedAt)}
              </p>
              <p className="text-xs text-muted-foreground">{`${headshot.selectedStyles.length} ${headshot.selectedStyles.length == 0 ? "style" : "styles"}`}</p>
            </div>

            {/* actions */}
            <div className="flex items-center justify-end">
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                  statusStyles[headshot.status],
                )}
              >
                {headshot.status}
              </span>
              <Button onClick={()=>handleDlete(headshot._id)} variant={"outline"} size={"icon"}>
                
                {
                  isDeletinghHeadshot?(
                    <>
                    <Loader2 className="w-8 h-8 animate-spin"/>
                    </>
                  ):(
                    <>
                    <Trash2 className="w-8 h-8 hover:text-primary" />
                    </>
                  )
                }
              </Button>
            </div>
          </div>
          {/* Original photo */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Original Photo</p>
            <div className="h-32 w-32 cursor-pointer overflow-hidden rounded-md border border-border transition-opacity hover:opacity-80">
              <Image
              width={500} 
                      height={500}
                src={headshot.originalPhotoUrl}
                alt="Original"
                className="w-full h-full object-cover"
                unoptimized 
              />
            </div>
          </div>

          {/* generated headshots */}
          {headshot.generatedHeadshots.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                Generated headshots
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {headshot.generatedHeadshots.map((generated, index) => (
                  <div
                    key={generated.key}
                    className="group relative cursor-pointer overflow-hidden rounded-md border border-border "
                    onClick={() => {
                      setViewingImage({
                        url: generated.url,
                        alt: `${generated.style} headshot`,
                      });
                      setViewImage(true);
                    }}
                  >
                    <div className=" aspect-square">
                      <Image
                       width={640}
  height={640}
  unoptimized 
                        src={generated.url}
                        alt="Original"
                        className="w-full h-full object-cover transition-opacity hover:opacity-80 group-hover:opacity-80"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100:">
                      <p className="text-sm text-muted-foreground font-medium capitalize">
                        {generated.style}
                      </p>
                      <Button
                        size={"sm"}
                        variant={"secondary"}
                        onClick={() => {
                          handleDownload(
                            generated.url,
                            `Headshot-${generated.style}-${index + 1}.png`,
                          );
                        }}
                      >
                        <Download className="w-4 h-4" />
                        <span className="ml-2">Download</span>
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Failed reasons */}
                {headshot.status === "failed" && headshot.failureReason && (
                  <div className="mt-4 rounded-md bg-red-50 p-3">
                    <p className="text-xs text-red-700">
                      {headshot.failureReason}
                    </p>
                  </div>
                )}

                {/* has load more */}
                {hasMore && onLoadMore && (
                  <div className="text-center">
                    <Button
                      variant={"outline"}
                      onClick={onLoadMore}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>"Load More"</>
                      )}
                    </Button>
                  </div>
                )}
                <AlertDialog onOpenChange={setViewImage} open={viewImage}>
                  <AlertDialogTrigger asChild>
                    {/* <Button variant="outline" onClick={()=>{
      setViewImage(true)}}>View image</Button> */}
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <Image
                      className="w-full h-full object-cover"
                      src={viewingImage?.url as any}
                      alt={viewingImage?.alt as any}
                        width={640}
  height={640}
  unoptimized 
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => {
                          setViewingImage(null);
                          setViewImage(false);
                        }}
                      >
                        Cancel
                      </AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </div>
      ))}

      {
        headshots.length===0&&(
          <div className="py-8 flex items-center justify-center">
            <p className="text-sm text-primary/40">There are no headshots to display.</p>
          </div>
        )
      }
    </div>
  );
};

export default HeadshotGallery;
