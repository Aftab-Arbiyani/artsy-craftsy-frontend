"use client";

import Link from "next/link";
import {
  ShoppingCart,
  UserCircle,
  Menu,
  X,
  LogOut,
  PlusSquare,
  Search,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartProvider";
import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/custom-art", label: "Custom Art" },
];

const Header = () => {
  const { getItemCount } = useCart();
  const { toast } = useToast();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Pre-fill search bar if on products page with a search query
    if (pathname === "/products") {
      setSearchTerm(searchParams.get("search") || "");
    } else {
      setSearchTerm(""); // Clear on other pages
    }
  }, [pathname, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push("/products");
    }
    // Close mobile menus on submit
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  useEffect(() => {
    // This effect runs on the client, so window and localStorage are available
    setCartItemCount(getItemCount());
    const token = localStorage.getItem("authToken");
    const userDataString = localStorage.getItem("user");

    setIsLoggedIn(!!token);
    if (userDataString) {
      try {
        const user = JSON.parse(userDataString);
        setUserType(user.type || null);
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        setUserType(null);
      }
    } else {
      setUserType(null);
    }
  }, [getItemCount, pathname]);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserType(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "success",
    });
    router.push("/login");
    router.refresh();
  };

  const NavLinkItem = ({ href, label }: { href: string; label: string }) => (
    <Link href={href} passHref>
      <Button
        variant={pathname === href ? "secondary" : "ghost"}
        className={`font-body ${pathname === href ? "font-semibold" : ""}`}
      >
        {label}
      </Button>
    </Link>
  );

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-2">
        {/* Left Section - Logo */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Middle Section - Desktop Search & Nav */}
        <nav className="hidden md:flex justify-center items-center space-x-1">
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full max-w-sm mr-4"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 w-full"
            />
          </form>
          {navLinks.map((link) => (
            <NavLinkItem key={link.href} {...link} />
          ))}
        </nav>

        {/* Right Section - Desktop Actions */}
        <div className="hidden md:flex flex-shrink-0 justify-end items-center space-x-1">
          <Link href="/cart" passHref>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Shopping Cart"
              className="relative"
            >
              <ShoppingCart />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/dashboard" passHref>
                <Button variant="ghost" size="icon" aria-label="User Dashboard">
                  <UserCircle />
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout} size="sm">
                <LogOut className="mr-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" passHref>
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/signup?type=customer" passHref>
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Right Section - Mobile Nav Trigger */}
        <div className="md:hidden flex-shrink-0 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <Search />
          </Button>
          <Link href="/cart" passHref>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Shopping Cart"
              className="relative"
            >
              <ShoppingCart />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>
          {isLoggedIn && (
            <Link href="/dashboard" passHref>
              <Button variant="ghost" size="icon" aria-label="User Dashboard">
                <UserCircle />
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-card shadow-lg p-2 z-40 animate-in fade-in slide-in-from-top-2 duration-300">
          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2 items-center"
          >
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search artworks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 w-full"
                autoFocus
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
            >
              <X />
            </Button>
          </form>
        </div>
      )}

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-card shadow-lg py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-300">
          <nav className="flex flex-col items-center space-y-2 px-4">
            {navLinks.map((link) => (
              <NavLinkItem key={link.href} {...link} />
            ))}

            {isLoggedIn ? (
              <div className="flex flex-col space-y-2 w-full border-t border-border pt-2 mt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 w-full border-t border-border pt-2 mt-2">
                <Link href="/login" passHref className="w-full">
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup?type=customer" passHref className="w-full">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
