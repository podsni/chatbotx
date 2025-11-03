import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
    onMenuClick: () => void;
    sessionTitle: string;
}

export const MobileHeader = ({
    onMenuClick,
    sessionTitle,
}: MobileHeaderProps) => {
    return (
        <div className="border-b border-border bg-card">
            <div className="px-4 py-3 flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuClick}
                    className="h-9 w-9"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <div className="flex-1 mx-3 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                        {sessionTitle}
                    </p>
                </div>
            </div>
        </div>
    );
};
