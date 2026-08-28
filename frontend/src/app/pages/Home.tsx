import { motion } from "motion/react";
import { Link } from "react-router";
import { MessageCircle, Target, Lightbulb, Eye, Compass, CheckCircle2, Sparkles } from "lucide-react";

export function Home() {
  const missions = [
    { icon: MessageCircle, title: "Communication", description: "Master the art of effective expression" },
    { icon: Target, title: "Confidence", description: "Build self-assurance through practice" },
    { icon: Lightbulb, title: "Creativity", description: "Unlock your creative potential" },
  ];

  const missionPoints = [
    "Develop excellence in speaking, writing, presentation, and interpersonal communication.",
    "Build confidence to express ideas with clarity, professionalism, and conviction.",
    "Foster leadership, ethical values, critical thinking, and lifelong learning."
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-white dark:bg-gray-950">
      <section className="relative lg:min-h-[calc(100vh-76px)] flex items-center overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8 sm:pt-8 sm:pb-16 lg:pt-14 lg:pb-32 relative z-10 w-full">
          <motion.div
            className="relative w-full mb-6 sm:mb-8 lg:mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-full aspect-[21/9] sm:aspect-[21/9] md:aspect-[22/9] rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-2 sm:border-4 border-white dark:border-gray-900">
              <img
                src="/images/group-photo.jpg"
                alt="English Club Group"
                className="w-full h-full object-cover object-[center_20%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>
            </div>
            
            {/* Decorative blurs */}
            <div className="absolute -bottom-10 -left-10 w-48 sm:w-64 h-48 sm:h-64 bg-blue-600/20 rounded-full blur-3xl opacity-50 -z-10"></div>
            <div className="absolute -top-10 -right-10 w-48 sm:w-64 h-48 sm:h-64 bg-purple-600/20 rounded-full blur-3xl opacity-50 -z-10"></div>
          </motion.div>

          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-8xl text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight tracking-tight font-extrabold"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Welcome to the <br className="sm:hidden" />
                <span className="bg-gradient-to-r from-blue-900 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent inline-block sm:inline mt-1 sm:mt-0">
                  English Club
                </span>
              </motion.h1>
              <motion.p
                className="text-base sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-10 max-w-2xl mx-auto"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              >
                Enhancing communication, creativity, and confidence through the power of language
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-12 sm:py-20 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-10 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" /> Driven by Purpose
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Vision & Mission
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Guiding principles that define our goals and shape our journey towards student excellence.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 items-stretch">
            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-between p-6 sm:p-8 lg:p-10 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group hover:border-blue-500/50 transition-all"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
              
              <div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mb-6 sm:mb-8 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <Eye className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>

                <h3 className="text-2xl sm:text-3xl text-gray-900 dark:text-white mb-4 sm:mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                  Our Vision
                </h3>

                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic border-l-4 border-blue-600 pl-4 py-1 mb-6" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  "To empower students to become confident communicators, principled leaders, and lifelong learners who express their ideas with clarity, lead with integrity, and create meaningful impact in their careers, communities, and society."
                </p>
              </div>

              <div className="pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-800/80">
                <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
                  Empowering Future Leaders
                </span>
              </div>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-between p-6 sm:p-8 lg:p-10 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group hover:border-purple-500/50 transition-all"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

              <div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-700 flex items-center justify-center mb-6 sm:mb-8 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>

                <h3 className="text-2xl sm:text-3xl text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                  Our Mission
                </h3>

                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  The English Club of Guru Nanak Dev Engineering College, under the Department of Applied Sciences, is committed to empowering students with the communication, confidence, and character needed for success beyond graduation. We strive to:
                </p>

                <ul className="space-y-3 sm:space-y-4 mb-8">
                  {missionPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50">
                <p className="text-xs sm:text-sm font-medium text-purple-900 dark:text-purple-200 italic" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  Together, we aspire to shape individuals who communicate with purpose, lead with integrity, and create a meaningful impact in their careers and society.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-10 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4 sm:mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              About Our Club
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              The English Club is a vibrant community dedicated to fostering excellence in communication, nurturing creativity, and building confidence among students through engaging activities and meaningful connections.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6 sm:gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {missions.map((mission, index) => (
              <motion.div
                key={index}
                variants={item}
                className="group p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10 transition-all hover:-translate-y-2"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <mission.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  {mission.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  {mission.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  );
}
