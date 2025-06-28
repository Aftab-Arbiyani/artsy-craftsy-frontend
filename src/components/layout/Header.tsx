'use client';

import Link from 'next/link';
import { ShoppingCart, UserCircle, Menu, X, LogOut } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartProvider';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/custom-art', label: 'Custom Art' },
];

const Header = () => {
  const { getItemCount } = useCart();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // This effect runs on the client, so window and localStorage are available
    setCartItemCount(getItemCount());
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, [getItemCount, pathname]);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/login');
  };

  const NavLinkItem = ({ href, label }: { href: string; label: string }) => (
    <Link href={href} passHref>
      <Button variant={pathname === href ? "secondary" : "ghost"} className={`font-body ${pathname === href ? 'font-semibold' : ''}`}>
        {label}
      </Button>
    </Link>
  );

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Logo />
        <nav className="hidden md:flex items-center space-x-2">
          {navLinks.map(link => <NavLinkItem key={link.href} {...link} />)}
          <Link href="/cart" passHref>
            <Button variant="ghost" size="icon" aria-label="Shopping Cart">
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
                <LogOut className="mr-2 h-4 w-4" /> Log Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" passHref>
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/signup" passHref>
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-card shadow-lg py-2 z-40">
          <nav className="flex flex-col items-center space-y-2 px-4">
            {navLinks.map(link => <NavLinkItem key={link.href} {...link} />)}
            <Link href="/cart" passHref className="w-full">
               <Button variant={pathname === "/cart" ? "secondary" : "ghost"} className="w-full relative">
                <ShoppingCart className="mr-2"/> Cart
                {cartItemCount > 0 && (
                  <span className="ml-2 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            {isLoggedIn ? (
              <div className="flex flex-col space-y-2 w-full border-t border-border pt-2 mt-2">
                <Link href="/dashboard" passHref className="w-full">
                  <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} className="w-full"><UserCircle className="mr-2"/> Dashboard</Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Log Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 w-full border-t border-border pt-2 mt-2">
                <Link href="/login" passHref className="w-full">
                  <Button variant="outline" className="w-full">Log In</Button>
                </Link>
                <Link href="/signup" passHref className="w-full">
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
