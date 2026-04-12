import { Link } from "react-router";
import { Instagram, Youtube, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const quickLinks = [
    { path: "/", label: "Home" },
    { path: "/events", label: "Events" },
    { path: "/join", label: "Join Us" },
    { path: "/resources", label: "Resources" },
    { path: "/team", label: "Team" },
    { path: "/submit", label: "Submit Us" },
  ];

  return (
    <footer className="bg-gray-950 dark:bg-black text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center">
                <span className="text-white text-xl" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>EC</span>
              </div>
              <span className="text-xl text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>English Club</span>
            </div>
            <p className="text-sm mb-6" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Enhancing communication, creativity, and confidence through the power of language.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-700 flex items-center justify-center transition-all hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-700 flex items-center justify-center transition-all hover:scale-110">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-700 flex items-center justify-center transition-all hover:scale-110">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-purple-400 transition-colors"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>englishclub@college.edu</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>+1 234 567 8900</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>Applied Science Department<br />College Campus</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Join Our Community</h3>
            <p className="text-sm mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Be part of something amazing. Enhance your skills and build lasting connections.
            </p>
            <Link
              to="/join"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all text-sm"
              style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
            >
              Join Now
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            © 2026 English Club. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
