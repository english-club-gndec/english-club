import { motion } from "motion/react";
import { Linkedin, Mail, Github, Instagram, Heart, Code2, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

interface Developer {
  name: string;
  role: string;
  image: string;
  email: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  bio?: string;
  zoomScale?: number;
  originX?: number;
  originY?: number;
}

export function Developers() {
  const developers: Developer[] = [
    {
      name: "Jasdeep Singh",
      role: "Lead Developer",
      image: "/developers/jasdeep.jpg",
      email: "davjasdeepsinghji9e17@gmail.com",
      linkedin: "https://www.linkedin.com/in/jasdeep-singh-54ab0423a/",
      instagram: "https://www.instagram.com/j.s.a.studios",
      github: "https://github.com/codebyjsa",
      bio: "Crafted core full-stack architecture, backend API systems, and interactive UI experiences for English Club.",
      zoomScale: 2.1,
      originX: 50,
      originY: 13,
    },
    {
      name: "Ekampreet Kaur",
      role: "Developer",
      image: "/developers/ekampreet.jpg",
      email: "bwalia247@gmail.com",
      github: "https://github.com/from-ekampreet-kaur",
      linkedin: "https://www.linkedin.com/in/from-ekampreet-kaur-ahluwalia21/",
      bio: "Contributed to frontend development, UI design components, and platform features for English Club.",
      zoomScale: 2,
      originX: 50,
      originY: 40,
    },
  ];

  function DeveloperCard({ dev, index }: { dev: Developer; index: number }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative rounded-3xl overflow-hidden bg-white dark:bg-gray-900/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2 flex flex-col h-full w-full sm:w-[320px]"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <img
            src={dev.image}
            alt={dev.name}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{
              transform: `scale(${dev.zoomScale ?? 1})`,
              transformOrigin: `${dev.originX ?? 50}% ${dev.originY ?? 50}%`,
            }}
          />
        </div>

        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-purple-600 dark:text-purple-400 mb-2">
            {dev.role}
          </span>
          <h3
            className="text-xl text-gray-900 dark:text-white mb-2"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}
          >
            {dev.name}
          </h3>
          {dev.bio && (
            <p
              className="text-xs text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-3"
              style={{ fontFamily: "Open Sans, sans-serif" }}
            >
              {dev.bio}
            </p>
          )}

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
            <a
              href={`mailto:${dev.email}`}
              className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact</span>
            </a>

            <div className="flex items-center gap-2">
              {dev.github && (
                <a
                  href={dev.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label={`${dev.name} GitHub`}
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {dev.linkedin && (
                <a
                  href={dev.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label={`${dev.name} LinkedIn`}
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {dev.instagram && (
                <a
                  href={dev.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-500 transition-colors"
                  aria-label={`${dev.name} Instagram`}
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-12 sm:py-20 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/team"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Team</span>
          </Link>
        </div>

        {/* Header Section */}
        <motion.div
          className="text-center mb-12 sm:mb-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Built by Genconians</span>
          </div>

          <h1
            className="text-3xl sm:text-5xl lg:text-6xl text-gray-900 dark:text-white mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 font-extrabold"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Meet the Developers
          </h1>

          <p
            className="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            style={{ fontFamily: "Open Sans, sans-serif" }}
          >
            The dedicated minds and engineers behind the design, architecture, and technology powering the English Club platform.
          </p>
        </motion.div>

        {/* Developers Cards Grid */}
        <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto mb-20">
          {developers.map((dev, index) => (
            <DeveloperCard key={dev.name} dev={dev} index={index} />
          ))}
        </div>

        {/* Appreciation Card / Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center p-8 rounded-3xl bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 border border-purple-500/20 dark:border-purple-500/20 backdrop-blur-md shadow-xl"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 dark:bg-purple-400/10 flex items-center justify-center mx-auto mb-4 text-purple-600 dark:text-purple-400">
            <Code2 className="w-6 h-6" />
          </div>
          <h3
            className="text-xl font-bold text-gray-900 dark:text-white mb-2"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Crafted with Passion & Precision
          </h3>
          <p
            className="text-sm text-gray-600 dark:text-gray-300 mb-4"
            style={{ fontFamily: "Open Sans, sans-serif" }}
          >
            Designed and built for Guru Nanak Dev Engineering College. Continuous innovation, modern user experiences, and seamless community engagement.
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 inline animate-pulse" />
            <span>by Genconians</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
