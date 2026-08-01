import { motion } from "motion/react";
import { Link } from "react-router";
import { MessageCircle, Target, Lightbulb } from "lucide-react";

export function Home() {
  const missions = [
    { icon: MessageCircle, title: "Communication", description: "Master the art of effective expression" },
    { icon: Target, title: "Confidence", description: "Build self-assurance through practice" },
    { icon: Lightbulb, title: "Creativity", description: "Unlock your creative potential" },
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
      <section className="relative min-h-[calc(100vh-76px)] flex items-center overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 lg:pt-14 lg:pb-32 relative z-10">
          <motion.div
            className="relative w-full mb-8 lg:mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-full aspect-[21/9] md:aspect-[25/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-900">
              <img
                src="/images/group-photo.jpg"
                alt="English Club Group"
                className="w-full h-full object-cover object-[center_60%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent"></div>
            </div>
            
            {/* Decorative blurs */}
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl opacity-50 -z-10"></div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl opacity-50 -z-10"></div>
          </motion.div>

          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              <motion.h1
                className="text-5xl lg:text-8xl text-gray-900 dark:text-white mb-6 leading-tight"
                style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}
              >
                Welcome to the <span className="bg-gradient-to-r from-blue-900 to-purple-700 bg-clip-text text-transparent">English Club</span>
              </motion.h1>
              <motion.p
                className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              >
                Enhancing communication, creativity, and confidence through the power of language
              </motion.p>
              
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              About Our Club
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              The English Club is a vibrant community dedicated to fostering excellence in communication, nurturing creativity, and building confidence among students through engaging activities and meaningful connections.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {missions.map((mission, index) => (
              <motion.div
                key={index}
                variants={item}
                className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10 transition-all hover:-translate-y-2"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <mission.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  {mission.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
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
