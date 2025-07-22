import Link from "next/link";
import { Palette } from "lucide-react";

const Logo = () => {
  return (
    <Link
      href="/"
      className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
    >
      <Palette size={32} />
      <span className="font-headline text-xl sm:text-2xl md:text-3xl font-bold">
        ArtsyCraftsy
      </span>
    </Link>
  );
};

export default Logo;
