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
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { usePageTransition } from "@/context/PageTransitionProvider";

interface SearchProduct {
  id: string;
  title: string;
  media: { id: string; file_path: string }[];
}

interface SearchCategory {
  id: string;
  name: string;
  image: string;
}

interface SearchUser {
  id: string;
  name: string;
  profile_picture: string;
}

interface SearchResults {
  products: SearchProduct[];
  categories: SearchCategory[];
  users: SearchUser[];
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/custom-art", label: "AI Studio" },
];

const NavLinkItem = ({
  href,
  label,
  pathname,
  onClick,
}: {
  href: string;
  label: string;
  pathname: string;
  onClick: (e: React.MouseEvent, href: string) => void;
}) => {
  return (
    <Link href={href} passHref onClick={(e) => onClick(e, href)}>
      <Button
        variant={pathname === href ? "secondary" : "ghost"}
        className={`font-body ${pathname === href ? "font-semibold" : ""}`}
      >
        {label}
      </Button>
    </Link>
  );
};

const SearchDropdown = ({
  searchTerm,
  results,
  isLoading,
  onClose,
}: {
  searchTerm: string;
  results: SearchResults | null;
  isLoading: boolean;
  onClose?: () => void;
}) => {
  if (!searchTerm) return null;

  const imageBase = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  const hasResults =
    results &&
    (results.products.length > 0 ||
      results.categories.length > 0 ||
      results.users.length > 0);

  return (
    <div className="ml-auto w-full max-w-lg md:max-w-2xl bg-background border border-border/50 shadow-2xl rounded-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 text-left">
      <div className="max-h-[75vh] overflow-y-auto w-full pb-2">
        {isLoading && (
          <div className="px-4 py-6 text-sm text-muted-foreground text-center">
            Searching...
          </div>
        )}

        {!isLoading && !hasResults && (
          <div className="px-4 py-6 text-sm text-muted-foreground text-center">
            No results found for &ldquo;{searchTerm}&rdquo;
          </div>
        )}

        {!isLoading && results && results.products.length > 0 && (
          <>
            <div className="bg-muted/80 px-4 py-1.5 text-sm font-semibold text-muted-foreground">
              Artworks
            </div>
            <div className="p-4 flex gap-3 overflow-x-auto items-center">
              {results.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={onClose}
                  className="relative h-14 w-14 bg-muted shrink-0 rounded overflow-hidden border hover:opacity-80 transition-opacity"
                  title={product.title}
                >
                  {product.media[0] ? (
                    <img
                      src={`${imageBase}${product.media[0].file_path}`}
                      className="object-cover h-full w-full"
                      alt={product.title}
                    />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground p-1 text-center">
                      {product.title}
                    </div>
                  )}
                </Link>
              ))}
              <div className="ml-auto pl-4 shrink-0">
                <Link
                  href={`/products?search=${encodeURIComponent(searchTerm)}`}
                  onClick={onClose}
                  className="text-red-500 text-xs hover:underline uppercase tracking-wider font-semibold"
                >
                  See More
                </Link>
              </div>
            </div>
          </>
        )}

        {!isLoading && results && results.categories.length > 0 && (
          <>
            <div className="bg-muted/80 px-4 py-1.5 text-sm font-semibold text-muted-foreground">
              Categories
            </div>
            <div className="p-2 space-y-0.5">
              {results.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  onClick={onClose}
                  className="px-3 py-2 text-sm hover:bg-muted cursor-pointer rounded-md flex items-center gap-3"
                >
                  {category.image && (
                    <div className="h-7 w-7 rounded overflow-hidden shrink-0 bg-muted border">
                      <img
                        src={`${imageBase}${category.image}`}
                        className="object-cover h-full w-full"
                        alt={category.name}
                      />
                    </div>
                  )}
                  {category.name}
                </Link>
              ))}
            </div>
          </>
        )}

        {!isLoading && results && results.users.length > 0 && (
          <>
            <div className="bg-muted/80 px-4 py-1.5 text-sm font-semibold text-muted-foreground">
              Artists
            </div>
            <div className="p-2 space-y-0.5">
              {results.users.map((user) => (
                <Link
                  key={user.id}
                  href={`/artist/${user.id}`}
                  onClick={onClose}
                  className="px-3 py-2 text-sm hover:bg-muted cursor-pointer rounded-md flex items-center gap-3"
                >
                  <div className="h-7 w-7 rounded-full overflow-hidden shrink-0 bg-muted border">
                    {user.profile_picture ? (
                      <img
                        src={`${imageBase}${user.profile_picture}`}
                        className="object-cover h-full w-full"
                        alt={user.name}
                      />
                    ) : (
                      <UserCircle className="h-full w-full text-muted-foreground" />
                    )}
                  </div>
                  {user.name}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Header = () => {
  const { getItemCount } = useCart();
  const { toast } = useToast();
  const { startTransition } = usePageTransition();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearchLoading(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/search?search=${encodeURIComponent(searchTerm.trim())}`
        );
        const json = await res.json();
        if (json.status === 1) {
          setSearchResults(json.data);
        } else {
          setSearchResults(null);
        }
      } catch {
        setSearchResults(null);
      } finally {
        setIsSearchLoading(false);
      }
    }, 400);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchTerm]);

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
    startTransition();
    const newPath = searchTerm.trim()
      ? `/products?search=${encodeURIComponent(searchTerm.trim())}`
      : "/products";
    router.push(newPath);
    // Close mobile menus on submit
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    if (pathname === "/products" && searchParams.get("search")) {
      startTransition();
      router.push("/products");
    }
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

  const handleLogout = async () => {
    startTransition();
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // We can proceed with client-side logout even if API fails,
        // as the token will be invalid anyway.
      } catch (error) {
        console.error("Logout API call failed:", error);
      }
    }

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

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (pathname === href) {
      e.preventDefault();
      return;
    }
    startTransition();
  };

  return (
    <>
      <header className="sticky top-4 z-50 w-full flex justify-center mb-6 px-4 relative">
        <div className="w-full max-w-4xl bg-background/60 backdrop-blur-xl border border-border/50 shadow-lg rounded-full px-6 py-3 flex justify-between items-center gap-4 transition-all duration-300">
          {/* Left Section - Logo */}
          <div className={`flex-shrink-0 flex items-center ${isMobileSearchOpen ? 'hidden lg:flex' : ''}`}>
            <Logo />
          </div>

          {/* Middle Section - Desktop Nav */}
          <nav className="hidden lg:flex justify-center items-center space-x-2">
            {navLinks.map((link) => (
              <NavLinkItem key={link.href} {...link} pathname={pathname} onClick={handleNavClick} />
            ))}
          </nav>

          {/* Right Section - Desktop Actions */}
          <div className="hidden lg:flex flex-shrink-0 justify-end items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="flex items-center bg-transparent border border-transparent hover:border-border/50 rounded-full transition-all overflow-hidden w-9 hover:w-48 group-focus-within:w-48 group-focus-within:border-border/50">
                <Button type="button" variant="ghost" size="icon" className="shrink-0 h-9 w-9 rounded-full">
                  <Search className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="bg-transparent border-0 focus-visible:ring-0 px-2 h-9 w-full min-w-[100px]"
                />
                {searchTerm && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-transparent"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
            </form>

            <Link href="/cart" passHref onClick={(e) => handleNavClick(e, "/cart")}>
              <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative rounded-full">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center translate-x-1 -translate-y-1 shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/dashboard" passHref onClick={(e) => handleNavClick(e, "/dashboard")}>
                  <Button variant="ghost" size="icon" aria-label="User Dashboard" className="rounded-full">
                    <UserCircle className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout} size="icon" aria-label="Log Out" className="rounded-full">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-border/40">
                <Link href="/login" passHref onClick={(e) => handleNavClick(e, "/login")}>
                  <Button variant="ghost" size="sm" className="rounded-full font-medium">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup?type=customer" passHref onClick={(e) => handleNavClick(e, "/signup?type=customer")}>
                  <Button size="sm" className="rounded-full font-medium px-4">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Nav Trigger */}
          <div className={`lg:hidden flex-shrink-0 items-center gap-1 ${isMobileSearchOpen ? 'hidden' : 'flex'}`}>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchOpen(true)} className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
            <Link href="/cart" passHref onClick={(e) => handleNavClick(e, "/cart")}>
              <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative rounded-full">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shrink-0">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="rounded-full">
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Inline Mobile Search */}
          {isMobileSearchOpen && (
            <form onSubmit={handleSearchSubmit} className="flex lg:hidden w-full gap-2 items-center animate-in fade-in duration-200">
              <Search className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />
              <div className="relative flex-grow flex items-center">
                <Input
                  placeholder="Search artworks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="bg-transparent border-0 focus-visible:ring-0 px-2 h-9 w-full pr-8"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 text-muted-foreground hover:text-foreground outline-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button variant="ghost" size="icon" type="button" onClick={() => setIsMobileSearchOpen(false)} className="rounded-full shrink-0">
                <X className="h-5 w-5" />
              </Button>
              
            </form>
          )}
        </div>

        {/* Search dropdown rendered outside the blurred pill so it has an opaque background */}
        {isSearchFocused && searchTerm && (
          <div className="absolute top-full left-0 right-0 flex justify-center px-4 mt-2 z-[100]">
            <div className="w-full max-w-4xl relative">
              <SearchDropdown searchTerm={searchTerm} results={searchResults} isLoading={isSearchLoading} onClose={() => setIsSearchFocused(false)} />
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-20 left-4 right-4 bg-background/90 backdrop-blur-xl border border-border/50 shadow-xl rounded-3xl py-4 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col items-center space-y-1 px-4">
            {navLinks.map((link) => (
              <NavLinkItem key={link.href} {...link} pathname={pathname} onClick={handleNavClick} />
            ))}

            <div className="w-full h-px bg-border/40 my-3" />

            {isLoggedIn ? (
              <div className="flex flex-col space-y-2 w-full">
                <Link href="/dashboard" passHref onClick={(e) => { handleNavClick(e, "/dashboard"); setIsMobileMenuOpen(false); }} className="w-full">
                  <Button variant="ghost" className="w-full justify-start rounded-full">
                    <UserCircle className="mr-3 h-5 w-5 text-muted-foreground" /> Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start rounded-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => { handleLogout(); setIsMobileMenuOpen(false); }}>
                  <LogOut className="mr-3 h-5 w-5" /> Log Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 w-full pt-1">
                <Link href="/login" passHref className="w-full" onClick={(e) => handleNavClick(e, "/login")}>
                  <Button variant="ghost" className="w-full rounded-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup?type=customer" passHref className="w-full" onClick={(e) => handleNavClick(e, "/signup?type=customer")}>
                  <Button className="w-full rounded-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
