import { motion } from "motion/react";

export function Resources() {
  return (
    <div className="bg-white dark:bg-gray-950 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl lg:text-6xl text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>
            Learning Resources
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Curated materials to enhance your English language skills
          </p>
        </motion.div>

        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="relative inline-block mt-4 mb-8 group w-full max-w-2xl mx-auto"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-[2.5rem] blur-xl opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative px-8 py-16 sm:px-16 sm:py-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl ring-1 ring-gray-200 dark:ring-gray-800 rounded-[2rem] shadow-2xl flex flex-col items-center justify-center space-y-8 overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
              <div className="absolute top-0 left-0 -ml-16 -mt-16 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
              
              <motion.div 
                animate={{ y: [0, -15, 0] }} 
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="text-7xl drop-shadow-2xl z-10"
              >
                🚀
              </motion.div>
              
              <div className="space-y-4 text-center z-10">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-purple-700 dark:from-blue-400 dark:to-purple-400" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>
                  Don't worry, mate.
                </h2>
                <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 font-medium flex items-center justify-center flex-wrap gap-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  We are coming soon <span className="inline-block animate-bounce text-3xl">✨</span>
                </p>
              </div>

              <div className="flex gap-3 pt-6 z-10">
                <motion.div className="w-3 h-3 rounded-full bg-blue-500" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} />
                <motion.div className="w-3 h-3 rounded-full bg-purple-500" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} />
                <motion.div className="w-3 h-3 rounded-full bg-blue-700" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} />
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.section
          className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-blue-900 to-purple-700 text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Applied Science Department Resources
            </h2>
            <p className="text-lg mb-6" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Access specialized English learning materials designed specifically for Applied Science students, including technical writing guides, scientific vocabulary, and academic communication resources.
            </p>
            <button
              className="px-8 py-3 rounded-xl bg-white text-blue-900 hover:bg-gray-100 transition-all"
              style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
            >
              Access Department Resources
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
