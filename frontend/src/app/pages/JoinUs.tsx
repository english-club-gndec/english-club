import { motion } from "motion/react";
import { useState } from "react";
import { MessageCircle, Users, TrendingUp, CheckCircle } from "lucide-react";

export function JoinUs() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    skills: "",
    reason: "",
  });

  const benefits = [
    {
      icon: MessageCircle,
      title: "Improve Communication",
      description: "Develop exceptional verbal and written communication skills through regular practice and workshops.",
    },
    {
      icon: Users,
      title: "Build Confidence",
      description: "Overcome stage fright and build self-assurance through public speaking and group activities.",
    },
    {
      icon: TrendingUp,
      title: "Networking Opportunities",
      description: "Connect with like-minded individuals, mentors, and professionals in the field.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", skills: "", reason: "" });
      setIsSubmitted(false);
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-6xl text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>
              Become a Part of <span className="bg-gradient-to-r from-blue-900 to-purple-700 bg-clip-text text-transparent">Our Community</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Join a vibrant community of passionate learners and communicators
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={item}
                className="group p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all hover:-translate-y-2"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Ready to Join?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Fill out the form below and start your journey with us
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=800&fit=crop"
                  alt="Join our community"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-purple-700/40"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-900 to-purple-700 rounded-3xl blur-3xl opacity-50"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                </div>

                <div>
                  <label htmlFor="skills" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Skills / Interests
                  </label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Writing, Public Speaking, Debate"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Why do you want to join?
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105"
                  style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
                >
                  Submit Application
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {isSubmitted && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-3xl p-12 max-w-md text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-3xl text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Application Submitted!
            </h3>
            <p className="text-gray-600 dark:text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Thank you for your interest. We'll review your application and get back to you soon!
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
