import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-red-900/30 bg-red-950 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row text-xs">
        
        {/* Left Side: Branding & Copyright */}
        <div className="flex items-center gap-3 text-stone-400">
          <span 
            className="font-semibold tracking-wider text-stone-300" 
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            ABJMI
          </span>
          <span className="hidden h-3 w-px bg-red-900/50 md:block"></span>
          <p>© {currentYear} All rights reserved.</p>
        </div>

        {/* Right Side: Inline Quick Links & Legal */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-stone-500 font-medium">
          <Link to="/guidelines" className="hover:text-amber-400 transition-colors">
            Guidelines
          </Link>
          <Link to="/issues" className="hover:text-amber-400 transition-colors">
            Latest Issues
          </Link>
          <Link to="/about" className="hover:text-amber-400 transition-colors">
            Subscription
          </Link>
          <Link to="/contact" className="hover:text-amber-400 transition-colors">
            Contact
          </Link>
          
          <span className="hidden h-3 w-px bg-red-900/50 md:block"></span>
          
          <span className="uppercase tracking-wider opacity-80">
            ISSN: (Pending)
          </span>
        </div>

      </div>
    </footer>
  );
}