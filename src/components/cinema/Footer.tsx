import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-gradient-gold">
                CineMax
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Experience cinema like never before. Premium theaters, cutting-edge technology, 
              and unforgettable moments await.
            </p>
            <div className="flex gap-3">
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {["Now Showing", "Coming Soon", "Experiences", "Gift Cards", "Promotions"].map((link) => (
                <li key={link}>
                  <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Experiences */}
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Experiences</h3>
            <ul className="space-y-3">
              {["ULTRAMAX", "3D Cinema", "VIP Lounge", "Standard", "Private Screening"].map((exp) => (
                <li key={exp}>
                  <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {exp}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-muted-foreground text-sm">
                  123 Cinema Boulevard, Metro Manila, Philippines
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm">+63 2 8888 9999</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm">hello@cinemax.ph</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 CineMax. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link) => (
              <Link
                key={link}
                to="#"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
