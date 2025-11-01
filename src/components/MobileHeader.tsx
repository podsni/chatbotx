import { Menu, Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  onMenuClick: () => void;
  sessionTitle: string;
}

export const MobileHeader = ({ onMenuClick, sessionTitle }: MobileHeaderProps) => {
  return (
    <div className="lg:hidden border-b border-border px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between bg-card flex-shrink-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
      >
        <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      
      <div className="flex-1 mx-2 sm:mx-3 min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
          <span className="text-foreground">{sessionTitle}</span>
        </p>
      </div>
      
      <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
};
