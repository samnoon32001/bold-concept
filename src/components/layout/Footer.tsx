import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-custom py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <h2 className="font-serif text-2xl font-medium">
                BOLD<span className="text-secondary">CONCEPT</span>
              </h2>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              Premium interior fit-out, renovation, and design execution. 
              Transforming spaces with precision and excellence.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center border border-primary-foreground/20 hover:border-secondary hover:text-secondary transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center border border-primary-foreground/20 hover:border-secondary hover:text-secondary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center border border-primary-foreground/20 hover:border-secondary hover:text-secondary transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-label text-secondary mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {["About", "Services", "Projects", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-label text-secondary mb-6">Services</h3>
            <ul className="space-y-3">
              {[
                "Interior Fit-Out",
                "Design & Build",
                "Renovation",
                "Project Management",
                "Joinery Solutions",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="/services"
                    className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-label text-secondary mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-secondary mt-1 flex-shrink-0" />
                <span className="text-primary-foreground/70 text-sm">
                  Business Bay, Dubai, UAE
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-secondary flex-shrink-0" />
                <a
                  href="tel:+97144567890"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                >
                  +971 4 456 7890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-secondary flex-shrink-0" />
                <a
                  href="mailto:info@boldconcept.ae"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                >
                  info@boldconcept.ae
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/50 text-xs">
            © {new Date().getFullYear()} BOLD CONCEPT Technical Service. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-primary-foreground/50 hover:text-secondary text-xs transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-primary-foreground/50 hover:text-secondary text-xs transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
