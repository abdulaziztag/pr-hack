"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";

interface PolicyViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  text: string;
  onAccept?: () => void;
}

export function PolicyViewer({
  open,
  onOpenChange,
  title,
  text,
  onAccept,
}: PolicyViewerProps) {
  const handleAccept = () => {
    if (onAccept) onAccept();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Please review the following policy document.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto rounded-md border p-4">
          <div className="whitespace-pre-wrap text-sm">{text}</div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onAccept && (
            <Button onClick={handleAccept}>Accept & Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

