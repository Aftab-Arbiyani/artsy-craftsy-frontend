import { Skeleton } from "@/components/ui/skeleton";
import Logo from "../shared/Logo";

export default function HeaderSkeleton() {
    return (
        <header className="bg-card shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Logo />
                <div className="hidden md:flex items-center space-x-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <div className="md:hidden">
                    <Skeleton className="h-10 w-10" />
                </div>
            </div>
        </header>
    );
}
