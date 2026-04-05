import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md";
}

const Logo = ({ size = "md" }: LogoProps) => {
  return (
    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
      <Image
        src="/logo-header.png"
        alt="Arts&Craft Studio"
        width={200}
        height={60}
        className={size === "sm" ? "h-8 w-auto" : "h-14 w-auto"}
        priority
      />
    </Link>
  );
};

export default Logo;
