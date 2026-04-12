import { useState } from "react";
import { Search, Menu, X } from "lucide-react";

const navLinks = [
  { label: "HOME", href: "/", active: true },
  { label: "CRYPTO NEWS", href: "#crypto-news" },
  { label: "BITCOIN NEWS", href: "#bitcoin-news" },
  { label: "AI & WEB3", href: "#ai-web3" },
  { label: "ALTCOIN UPDATES", href: "#altcoin-updates" },
  { label: "PRICE PREDICTIONS", href: "#price-predictions" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="bg-card py-5">
        <div className="container">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl font-semibold tracking-tight text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>
              <span className="text-foreground">Crypto</span>
              <span className="text-foreground">Uptrend</span>
            </span>
          </a>
        </div>
      </header>

      <nav className="sticky top-0 z-50 bg-nav">
        <div className="container flex items-center justify-between">
          <ul className="hidden lg:flex items-center">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={`block px-4 py-4 text-[13px] font-semibold uppercase tracking-wide transition-colors ${
                    link.active
                      ? "bg-primary text-primary-foreground"
                      : "text-nav-foreground/90 hover:text-primary"
                  }`}
                >
                  {link.label}
                </a>
                {link.active && (
                  <div className="h-[3px] bg-nav-foreground mx-4 -mt-[3px]" />
                )}
              </li>
            ))}
          </ul>

          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="hidden lg:flex items-center justify-center w-10 h-10 text-nav-foreground/80 hover:text-primary transition-colors"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          <button
            className="lg:hidden flex items-center justify-center w-12 h-12 text-nav-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {searchOpen && (
          <div className="bg-nav border-t border-nav-foreground/10">
            <div className="container py-3">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-nav-foreground/10 text-nav-foreground text-sm px-4 py-2 outline-none placeholder:text-nav-foreground/50"
                autoFocus
              />
            </div>
          </div>
        )}

        {mobileOpen && (
          <div className="lg:hidden bg-nav border-t border-nav-foreground/10">
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={`block px-4 py-3 text-[13px] font-semibold uppercase border-b border-nav-foreground/10 ${
                      link.active
                        ? "text-primary"
                        : "text-nav-foreground/90 hover:text-primary"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
