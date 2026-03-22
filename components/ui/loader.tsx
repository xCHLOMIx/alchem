import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type LoaderProps = {
    className?: string;
};

export function Loader({ className }: LoaderProps) {
    return <LoaderCircle className={cn("size-8 animate-spin text-primary", className)} />;
}
