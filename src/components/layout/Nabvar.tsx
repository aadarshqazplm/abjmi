import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { role, logoutUser } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Issues", path: "/issues" },
    { name: "Guidelines", path: "/guidelines" },
    { name: "Editorial Board", path: "/editorial-board" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-red-900/30 bg-red-950/95 backdrop-blur-md">
      {/* Admin Warning Banner - Adjusted to fit the darker theme seamlessly */}
      {role === "admin" && (
        <div className="flex items-center justify-center gap-2 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold tracking-[0.15em] text-amber-400">
          <ShieldAlert size={14} className="text-amber-400" />
          ADMINISTRATOR MODE ACTIVE
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Branding - Using the Cinzel font to match your Login header */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex flex-col justify-center">
              <span className="text-xl font-semibold tracking-wide text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                ABJMI
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400">
                Editorial Portal
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-all duration-300 ${
                    isActive(link.path) 
                      ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" 
                      : "text-stone-300 hover:text-white"
                  }`}
                >
                  {link.name}
                  {/* Subtle underline indicator for active state */}
                  {isActive(link.path) && (
                    <div className="mt-1 h-[2px] w-full rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                  )}
                </Link>
              ))}

              {/* Logout Button for Admin */}
              {role === "admin" && (
                <button
                  onClick={() => logoutUser()}
                  className="ml-4 flex items-center gap-2 rounded-lg border border-red-800/50 bg-red-900/50 px-3.5 py-1.5 text-sm font-medium text-stone-200 transition-all hover:bg-red-900 hover:text-white"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-stone-300 hover:bg-red-900 hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {isOpen && (
        <div className="md:hidden border-t border-red-900/30 bg-red-950">
          <div className="space-y-1 px-3 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-red-900/50 text-amber-400"
                    : "text-stone-300 hover:bg-red-900/30 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {role === "admin" && (
              <button
                onClick={() => {
                  logoutUser();
                  setIsOpen(false);
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-400 transition hover:bg-amber-500/20"
              >
                <LogOut size={18} />
                End Admin Session
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}