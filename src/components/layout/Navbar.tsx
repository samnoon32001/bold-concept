import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Home", path: "/", section: "hero" },
  { name: "About", path: "/", section: "about" },
  { name: "Services", path: "/", section: "services" },
  { name: "Projects", path: "/", section: "projects" },
  { name: "Contact", path: "/contact", section: null },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      if (location.pathname === "/") {
        const sections = ["hero", "services", "projects", "about"];
        for (const section of sections.reverse()) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 150) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isHomePage = location.pathname === "/";
  const isContactPage = location.pathname === "/contact";

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (link: typeof navLinks[0]) => {
    if (link.section) {
      if (isHomePage) {
        scrollToSection(link.section);
      } else {
        // Navigate to home first, then scroll
        window.location.href = `/#${link.section}`;
      }
    }
  };

  // Handle hash on page load
  useEffect(() => {
    if (location.hash && isHomePage) {
      const sectionId = location.hash.replace("#", "");
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
    }
  }, [location.hash, isHomePage]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || !isHomePage
            ? "bg-primary/95 backdrop-blur-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container-custom">
          <nav className="flex items-center justify-between h-20 md:h-24">
            {/* Logo */}
            <Link 
              to="/" 
              className="relative z-10"
              onClick={() => isHomePage && scrollToSection("hero")}
            >
              <div className={`flex items-center gap-3 transition-colors duration-300 ${
                isScrolled || !isHomePage ? "text-primary-foreground" : "text-white"
              }`}>
                <img 
                  src="https://i.pinimg.com/736x/7c/e3/56/7ce3569977d0efd63a9a99a0c7356975.jpg" 
                  alt="BOLD CONCEPTS Logo" 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-current object-cover"
                />
                <div>
                  <h1 className="font-serif text-xl md:text-2xl font-bold tracking-wide">
                    BOLD CONC<span className="text-red-600">E</span>PTS
                  </h1>
                  <p className="text-xs md:text-sm font-normal tracking-wider" style={{ fontFamily: 'Century Gothic, sans-serif' }}>
                    TECHNICAL SERVICES LLC
                  </p>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <ul className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  {link.section ? (
                    <button
                      onClick={() => handleNavClick(link)}
                      className={`link-underline text-sm uppercase tracking-[0.15em] font-medium transition-colors duration-300 ${
                        isScrolled || !isHomePage
                          ? "text-primary-foreground/80 hover:text-primary-foreground"
                          : "text-white/80 hover:text-white"
                      } ${isHomePage && activeSection === link.section ? "text-secondary" : ""}`}
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      to={link.path}
                      className={`link-underline text-sm uppercase tracking-[0.15em] font-medium transition-colors duration-300 ${
                        isScrolled || !isHomePage
                          ? "text-primary-foreground/80 hover:text-primary-foreground"
                          : "text-white/80 hover:text-white"
                      } ${isContactPage ? "text-secondary" : ""}`}
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Link
              to="/contact"
              className={`hidden lg:inline-flex items-center px-6 py-3 text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 border ${
                isScrolled || !isHomePage
                  ? "border-secondary text-secondary hover:bg-secondary hover:text-primary"
                  : "border-white/50 text-white hover:bg-white hover:text-primary"
              }`}
            >
              Get a Quote
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 transition-colors duration-300 ${
                isScrolled || !isHomePage ? "text-primary-foreground" : "text-white"
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-primary lg:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <nav className="flex flex-col items-center gap-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {link.section ? (
                      <button
                        onClick={() => handleNavClick(link)}
                        className={`text-2xl font-serif font-medium text-primary-foreground hover:text-secondary transition-colors ${
                          isHomePage && activeSection === link.section ? "text-secondary" : ""
                        }`}
                      >
                        {link.name}
                      </button>
                    ) : (
                      <Link
                        to={link.path}
                        className={`text-2xl font-serif font-medium text-primary-foreground hover:text-secondary transition-colors ${
                          isContactPage ? "text-secondary" : ""
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    )}
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                >
                  <Link
                    to="/contact"
                    className="mt-8 btn-primary bg-secondary text-secondary-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get a Quote
                  </Link>
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
