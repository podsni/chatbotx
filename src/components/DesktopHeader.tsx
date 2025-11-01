import { Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DesktopHeaderProps {
  sessionTitle: string;
}

export const DesktopHeader = ({ sessionTitle }: DesktopHeaderProps) => {
  return (
    <div className="hidden lg:flex border-b border-border px-6 py-3 items-center justify-between bg-card">
      <div className="text-sm text-muted-foreground">
        Session: <span className="text-foreground">{sessionTitle}</span>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="text-xs">
          <Copy className="w-3 h-3 mr-1" />
          Copy All
        </Button>
        <Button variant="ghost" size="sm" className="text-xs">
          <FileText className="w-3 h-3 mr-1" />
          Summarize
        </Button>
      </div>
    </div>
  );
};
