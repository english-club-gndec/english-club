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

  const convenors = members
    .filter(m => m.member_postion === 'CONVENOR' || m.member_postion === 'CO-CONVENOR')
    .sort((a, b) => {
      const order = ['CONVENOR', 'CO-CONVENOR'];
      return order.indexOf(a.member_postion) - order.indexOf(b.member_postion);
    });

  const techTeam = members
    .filter(m => m.member_postion === 'TECH_HEAD' || m.member_postion === 'CO-TECH_HEAD')
    .sort((a, b) => {
      const order = ['TECH_HEAD', 'CO-TECH_HEAD'];
      return order.indexOf(a.member_postion) - order.indexOf(b.member_postion);
    });

  const creativeTeam = members
    .filter(m => m.member_postion === 'CREATIVE_HEAD' || m.member_postion === 'CO-CREATIVE_HEAD')
    .sort((a, b) => {
      const order = ['CREATIVE_HEAD', 'CO-CREATIVE_HEAD'];
      return order.indexOf(a.member_postion) - order.indexOf(b.member_postion);
    });

  const executives = members.filter(m => m.member_postion === 'EXECUTIVE_MEMBER');

  function MemberCard({ member, index }: { member: Member; index: number }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className="group relative rounded-3xl overflow-hidden bg-white dark:bg-gray-900/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2 flex flex-col h-full w-full sm:w-[280px]"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {member.member_profile_picture_key ? (
            <img
              src={getPublicUrl(member.member_profile_picture_key)}
              alt={member.member_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <UserIcon className="w-20 h-20 text-gray-400 group-hover:scale-105 transition-transform duration-500" />
          )}

          {/* Socials Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
            <div className="flex justify-center gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              {member.socials?.linkedin && (
                <a
                  href={member.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-purple-600 border border-white/20 flex items-center justify-center transition-all hover:scale-110"
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              )}
              {member.socials?.github && (
                <a
                  href={member.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-purple-600 border border-white/20 flex items-center justify-center transition-all hover:scale-110"
                >
                  <Github className="w-5 h-5 text-white" />
                </a>
              )}
              {member.socials?.instagram && (
                <a
                  href={member.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-purple-600 border border-white/20 flex items-center justify-center transition-all hover:scale-110"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
              )}
              {member.member_email && (
                <a
                  href={`mailto:${member.member_email}`}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-purple-600 border border-white/20 flex items-center justify-center transition-all hover:scale-110"
                >
                  <Mail className="w-5 h-5 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-purple-600 dark:text-purple-400 mb-2">
            {member.member_postion.replace(/_/g, ' ')}
          </span>
          <h3 className="text-xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
            {member.member_name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            {member.member_club_department ? member.member_club_department : `${member.member_department} · Sem ${member.member_semester}`}
          </p>
        </div>
      </motion.div>
    );
  }

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

        <section className="mb-24">
          <motion.h2
            className="text-4xl lg:text-5xl text-center text-gray-900 dark:text-white mb-16"
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Faculty Mentors
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {faculty.map((member, index) => (
              <motion.div
                key={index}
                variants={item}
                className="group relative rounded-3xl overflow-hidden bg-white dark:bg-gray-900/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300"
              >
                <div className="p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                  <div className="relative flex-shrink-0 w-28 h-28 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md bg-gray-100 dark:bg-gray-800">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] uppercase tracking-widest font-extrabold text-purple-600 dark:text-purple-400 mb-1 block">
                      {member.role}
                    </span>
                    <h3 className="text-2xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      {member.bio}
                    </p>
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-purple-400 font-semibold hover:underline"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      >
                        <Mail className="w-4 h-4" />
                        Contact Mentor
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {loading ? (
          <div className="flex justify-center items-center py-20 w-full col-span-full">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Core Team Section */}
            {(convenors.length > 0 || techTeam.length > 0 || creativeTeam.length > 0) && (
              <section className="mb-24">
                <div className="text-center mb-20">
                  <motion.h2
                    className="text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4"
                    style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    Core Team
                  </motion.h2>
                  <p className="text-gray-550 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                    Together, we guide coordination, push technical boundaries, and craft beautiful designs.
                  </p>
                </div>

                {convenors.length > 0 && (
                  <div className="mb-20">
                    <div className="text-center mb-10 flex flex-col items-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Convenors
                      </h3>
                      <div className="w-12 h-1 bg-purple-600 rounded-full"></div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8">
                      {convenors.map((member, index) => (
                        <MemberCard key={member.member_id} member={member} index={index} />
                      ))}
                    </div>
                  </div>
                )}

                {techTeam.length > 0 && (
                  <div className="mb-20">
                    <div className="text-center mb-10 flex flex-col items-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Technical Team
                      </h3>
                      <div className="w-12 h-1 bg-purple-600 rounded-full"></div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8">
                      {techTeam.map((member, index) => (
                        <MemberCard key={member.member_id} member={member} index={index} />
                      ))}
                    </div>
                  </div>
                )}

                {creativeTeam.length > 0 && (
                  <div className="mb-20">
                    <div className="text-center mb-10 flex flex-col items-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Creative Team
                      </h3>
                      <div className="w-12 h-1 bg-purple-600 rounded-full"></div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8">
                      {creativeTeam.map((member, index) => (
                        <MemberCard key={member.member_id} member={member} index={index} />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Executives Section */}
            {executives.length > 0 && (
              <section className="mb-24">
                <div className="text-center mb-20">
                  <motion.h2
                    className="text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4"
                    style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    Executives
                  </motion.h2>
                  <p className="text-gray-550 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                    The dynamic engine powering the club's event coordination, public relations, execution, and day-to-day operations.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-8">
                  {executives.map((member, index) => (
                    <MemberCard key={member.member_id} member={member} index={index} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
