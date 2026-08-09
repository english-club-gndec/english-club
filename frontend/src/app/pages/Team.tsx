import { motion } from "motion/react";
import { Linkedin, Mail, Loader2, User as UserIcon, Github, Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import { memberService } from "../../services/memberService";
import { supabase } from "../../lib/supabase";

interface TeamMember {
  name: string;
  image: string;
  linkedin?: string;
  email?: string;
  zoomScale?: number;
  originX?: number;
  originY?: number;
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
      name: "Prof. Nisha Masson",
      image: "/faculty/nisha.jpg",
      email: "nishamasson93@gmail.com",
      zoomScale: 4,
      originX: 0.45,
      originY: 0.25,
    },
    {
      name: "Prof. Jasmine Kaur",
      image: "/faculty/jasmine.jpg",
      email: "harjasbms19@gmail.com",
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
    const [showSocials, setShowSocials] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className="group relative rounded-3xl overflow-hidden bg-white dark:bg-gray-900/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2 flex flex-col h-full w-full sm:w-[280px]"
      >
        <div
          onClick={() => setShowSocials(prev => !prev)}
          className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer"
        >
          {member.member_profile_picture_key ? (
            <img
              src={getPublicUrl(member.member_profile_picture_key)}
              alt={member.member_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <UserIcon className="w-20 h-20 text-gray-400 group-hover:scale-105 transition-transform duration-500" />
          )}

          {/* Socials Hover/Touch Overlay */}
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-6 ${
              showSocials ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <div
              className={`flex justify-center gap-3 sm:gap-4 transition-transform duration-300 ${
                showSocials ? 'translate-y-0' : 'translate-y-4 group-hover:translate-y-0'
              }`}
            >
              {member.socials?.linkedin && (
                <a
                  href={member.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
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
                  onClick={(e) => e.stopPropagation()}
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
                  onClick={(e) => e.stopPropagation()}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-purple-600 border border-white/20 flex items-center justify-center transition-all hover:scale-110"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
              )}
              {member.member_email && (
                <a
                  href={`mailto:${member.member_email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-purple-600 border border-white/20 flex items-center justify-center transition-all hover:scale-110"
                >
                  <Mail className="w-5 h-5 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-purple-600 dark:text-purple-400 mb-2">
            {member.member_postion.replace(/_/g, ' ')}
          </span>
          <h3 className="text-xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
            {member.member_name}
          </h3>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-5xl lg:text-6xl text-gray-900 dark:text-white mb-4 sm:mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>
            Meet Our Team
          </h1>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Dedicated individuals working together to create an inspiring community
          </p>
        </motion.div>

        <section className="mb-16 sm:mb-24">
          <div className="text-center mb-10 sm:mb-16">
            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl text-center text-gray-900 dark:text-white mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 font-extrabold"
              style={{ fontFamily: 'Poppins, sans-serif' }}
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Faculty Mentors
            </motion.h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-xs sm:text-base" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              The guiding pillars of our club, providing wisdom, academic guidance, and unwavering support.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 gap-6 sm:gap-10 max-w-6xl mx-auto"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {faculty.map((member, index) => (
              <motion.div
                key={index}
                variants={item}
                className="group relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950/50 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Background decorative glow */}
                <div className="absolute -right-24 -top-24 w-56 h-56 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700 pointer-events-none" />
                <div className="absolute -left-24 -bottom-24 w-56 h-56 bg-pink-500/10 dark:bg-pink-500/5 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700 pointer-events-none" />
                
                <div className="p-6 sm:p-10 lg:p-12 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start text-center sm:text-left relative z-10">
                  {/* Glowing dynamic ring wrapper around image */}
                  <div className="relative flex-shrink-0 w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden p-[4px] bg-gradient-to-tr from-purple-600 via-pink-500 to-blue-500 shadow-xl group-hover:rotate-3 transition-transform duration-500">
                    <div className="w-full h-full rounded-[20px] overflow-hidden bg-white dark:bg-gray-900">
                      <motion.img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        style={{
                          originX: member.originX ?? 0.5,
                          originY: member.originY ?? 0.5,
                          scale: member.zoomScale ?? 1.0,
                        }}
                        whileHover={{ scale: (member.zoomScale ?? 1.0) * 1.1 }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center sm:items-start justify-center sm:min-h-[11rem]">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-[10px] sm:text-xs font-black bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 mb-3 uppercase tracking-widest">
                      Faculty Mentor
                    </span>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl text-gray-900 dark:text-white font-extrabold tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {member.name}
                    </h3>
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gray-900 hover:bg-purple-600 dark:bg-white dark:hover:bg-purple-600 text-white dark:text-gray-950 dark:hover:text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5 group/btn"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      >
                        <Mail className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                        <span>Contact Mentor</span>
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
