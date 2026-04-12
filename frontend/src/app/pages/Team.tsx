import { motion } from "motion/react";
import { Linkedin, Mail } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  linkedin?: string;
  email?: string;
}

export function Team() {
  const faculty: TeamMember[] = [
    {
      name: "Dr. Sarah Johnson",
      role: "Faculty Mentor",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      bio: "Professor of English Literature with 15 years of teaching experience. Passionate about nurturing young talent.",
      email: "sarah.johnson@college.edu",
    },
    {
      name: "Prof. Michael Chen",
      role: "Faculty Advisor",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      bio: "Specializes in communication studies and public speaking. Guides students in developing presentation skills.",
      email: "michael.chen@college.edu",
    },
  ];

  const coreTeam: TeamMember[] = [
    {
      name: "Emily Rodriguez",
      role: "President",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      bio: "Leading the club with vision and dedication. Passionate about creative writing and poetry.",
      linkedin: "#",
      email: "emily.r@student.edu",
    },
    {
      name: "Alex Turner",
      role: "Vice President",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      bio: "Coordinates events and manages team operations. Enthusiast of debate and public speaking.",
      linkedin: "#",
      email: "alex.t@student.edu",
    },
    {
      name: "Priya Sharma",
      role: "Event Coordinator",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
      bio: "Organizes engaging events and workshops. Loves storytelling and creative expression.",
      linkedin: "#",
      email: "priya.s@student.edu",
    },
    {
      name: "James Wilson",
      role: "Creative Head",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      bio: "Leads creative initiatives and content development. Award-winning writer and poet.",
      linkedin: "#",
      email: "james.w@student.edu",
    },
    {
      name: "Aisha Patel",
      role: "Social Media Manager",
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop",
      bio: "Manages online presence and community engagement. Expert in digital communication.",
      linkedin: "#",
      email: "aisha.p@student.edu",
    },
    {
      name: "David Kim",
      role: "Treasurer",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      bio: "Handles finances and resource management. Ensures smooth operation of club activities.",
      linkedin: "#",
      email: "david.k@student.edu",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

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
            Meet Our Team
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Dedicated individuals working together to create an inspiring community
          </p>
        </motion.div>

        <section className="mb-20">
          <motion.h2
            className="text-3xl lg:text-4xl text-center text-gray-900 dark:text-white mb-12"
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Faculty Mentors
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {faculty.map((member, index) => (
              <motion.div
                key={index}
                variants={item}
                className="group relative rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:shadow-purple-500/20 transition-all"
              >
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="relative flex-shrink-0">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-24 h-24 rounded-2xl object-cover"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-900/20 to-purple-700/20"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                        {member.name}
                      </h3>
                      <p className="text-sm text-purple-700 dark:text-purple-400 mb-3" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        {member.role}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        {member.bio}
                      </p>
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="inline-flex items-center gap-2 text-sm text-blue-900 dark:text-purple-400 hover:underline"
                          style={{ fontFamily: 'Open Sans, sans-serif' }}
                        >
                          <Mail className="w-4 h-4" />
                          Contact
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section>
          <motion.h2
            className="text-3xl lg:text-4xl text-center text-gray-900 dark:text-white mb-12"
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Core Team
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {coreTeam.map((member, index) => (
              <motion.div
                key={index}
                variants={item}
                className="group relative rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:shadow-purple-500/20 transition-all hover:-translate-y-2"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                      {member.name}
                    </h3>
                    <p className="text-sm text-purple-300" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      {member.role}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    {member.bio}
                  </p>
                  <div className="flex gap-3">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-700 flex items-center justify-center transition-all hover:scale-110 group/icon"
                      >
                        <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover/icon:text-white" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-700 flex items-center justify-center transition-all hover:scale-110 group/icon"
                      >
                        <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover/icon:text-white" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>
    </div>
  );
}
