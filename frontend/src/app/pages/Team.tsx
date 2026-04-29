import { motion } from "motion/react";
import { Linkedin, Mail, Loader2, User as UserIcon, Github, Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import { memberService } from "../../services/memberService";
import { supabase } from "../../lib/supabase";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  linkedin?: string;
  email?: string;
}

interface Member {
  member_id: string;
  member_name: string;
  member_postion: string;
  member_profile_picture_key: string;
  member_email: string;
  member_department: string;
  member_semester: number;
  member_club_department: string;
  socials: {
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
}

export function Team() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await memberService.getAllMembers();
        setMembers(data);
      } catch (error) {
        console.error("Failed to fetch members", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const getPublicUrl = (key: string | undefined) => {
    if (!key) return "";
    const { data } = supabase.storage.from('profile_pictures').getPublicUrl(key);
    return data.publicUrl;
  };
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="flex justify-center items-center py-20 w-full col-span-full">
                 <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              </div>
            ) : members.map((member, index) => (
              <motion.div
                key={member.member_id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:shadow-purple-500/20 transition-all hover:-translate-y-2"
              >
                <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {member.member_profile_picture_key ? (
                    <img
                      src={getPublicUrl(member.member_profile_picture_key)}
                      alt={member.member_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <UserIcon className="w-24 h-24 text-gray-400 group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                      {member.member_name}
                    </h3>
                    <p className="text-sm text-purple-300" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      {member.member_postion.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    {member.member_club_department ? member.member_club_department : `Department: ${member.member_department}, Sem: ${member.member_semester}`}
                  </p>
                  <div className="flex gap-3">
                    {member.socials?.linkedin && (
                      <a
                        href={member.socials.linkedin}
                        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-700 flex items-center justify-center transition-all hover:scale-110 group/icon"
                      >
                        <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover/icon:text-white" />
                      </a>
                    )}
                    {member.socials?.github && (
                      <a
                        href={member.socials.github}
                        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-700 flex items-center justify-center transition-all hover:scale-110 group/icon"
                      >
                        <Github className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover/icon:text-white" />
                      </a>
                    )}
                    {member.socials?.instagram && (
                      <a
                        href={member.socials.instagram}
                        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-700 flex items-center justify-center transition-all hover:scale-110 group/icon"
                      >
                        <Instagram className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover/icon:text-white" />
                      </a>
                    )}
                    {member.member_email && (
                      <a
                        href={`mailto:${member.member_email}`}
                        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-900 hover:to-purple-700 flex items-center justify-center transition-all hover:scale-110 group/icon"
                      >
                        <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover/icon:text-white" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
