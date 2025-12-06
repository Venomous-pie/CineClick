import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut, Ticket } from "lucide-react";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/movies", label: "Movies" },
    { href: "/coming-soon", label: "Coming Soon" },
    { href: "/experiences", label: "Experiences" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-gradient-gold">
                CineMax
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative text-sm font-medium transition-colors ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                  {location.pathname === link.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/my-tickets" className="hidden md:flex">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Ticket className="w-4 h-4" />
                      My Tickets
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {user?.firstName && user?.lastName
                              ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                              : user?.email?.[0].toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden lg:inline">
                          {user?.firstName || user?.email?.split("@")[0] || "Account"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.firstName && user?.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : "Account"}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/account" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Account Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/my-tickets" className="flex items-center gap-2">
                          <Ticket className="w-4 h-4" />
                          My Tickets
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={logout}
                        className="text-destructive focus:text-destructive"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link to="/account">
                  <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                    Sign In
                  </Button>
                </Link>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-foreground"
              >
                {isMobileMenuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-20 z-40 bg-background/98 backdrop-blur-lg border-b border-border md:hidden"
          >
            <div className="container mx-auto px-6 py-6">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`py-3 px-4 rounded-lg text-lg font-medium transition-colors ${
                      location.pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-border pt-4 mt-2">
                  {isAuthenticated ? (
                    <>
                      <Link to="/my-tickets">
                        <Button variant="outline" className="w-full mb-2 gap-2">
                          <Ticket className="w-4 h-4" />
                          My Tickets
                        </Button>
                      </Link>
                      <Link to="/account">
                        <Button variant="outline" className="w-full mb-2 gap-2">
                          <User className="w-4 h-4" />
                          Account
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        className="w-full gap-2"
                        onClick={logout}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Link to="/account">
                      <Button variant="gold" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
