import { motion } from "motion/react";
import { Linkedin, Mail, Loader2, User as UserIcon, Github, Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import { memberService } from "../../services/memberService";
import { supabase } from "../../lib/supabase";

interface Member {
  member_id: string;
  member_name: string;
  member_postion: string;
  member_profile_picture_key?: string | null;
  member_email: string;
  member_department: string;
  member_semester: number;
  member_club_department?: string | null;
  socials: {
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
}

interface FacultyMember {
  name: string;
  image: string;
  email?: string;
  zoomScale?: number;
  originX?: number;
  originY?: number;
}

export function Team() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const faculty: FacultyMember[] = [
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
      zoomScale: 3.6,
      originX: 0.50,
      originY: 0.53,
    },
  ];

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await memberService.getAllMembers();
      setMembers(data);
    } catch (error) {
      console.error("Failed to fetch members", error);
      setError("Unable to load team members right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const getPublicUrl = (key: string | undefined) => {
    if (!key) return "";
    const { data } = supabase.storage.from('profile_pictures').getPublicUrl(key);
    return data.publicUrl;
  };

  const requiredSections = [
    'CONVENOR',
    'CO-CONVENOR',
    'FINANCE & AI',
    'TECHNICAL',
    'DISCIPLINE',
    'DOCUMENTATION',
    'EVENT MANAGEMENT',
    'CREATIVE',
    'PROMOTION',
    'SOCIAL MEDIA',
    'ANCHORING',
    'PHOTOGRAPHY & VIDEOGRAPHY',
    'EXECUTIVE'
  ] as const;

  const normalizeSectionValue = (value?: string | null) =>
    String(value ?? '')
      .toUpperCase()
      .replace(/[_+-]/g, ' ')
      .replace(/&/g, ' AND ')
      .replace(/\s+/g, ' ')
      .trim();

  const resolveSectionForMember = (member: Member): string | null => {
    const rawPosition = String(member.member_postion ?? '').toUpperCase().trim();
    if (rawPosition === 'ACTIVE_MEMBER' || rawPosition === 'ACTIVE MEMBER' || rawPosition === 'ACTIVE') {
      return null;
    }

    const position = normalizeSectionValue(member.member_postion);
    const clubDepartment = normalizeSectionValue(member.member_club_department);

    // Direct role mappings for Convenors and Executives
    if (position === 'CONVENOR') return 'CONVENOR';
    if (position === 'CO CONVENOR' || position === 'CO-CONVENOR' || position.startsWith('CO CONVENOR')) return 'CO-CONVENOR';
    if (position === 'EXECUTIVE MEMBER' || position === 'EXECUTIVE') return 'EXECUTIVE';

    // Prioritized rules: check specific compound names first
    const departmentRules: Array<[string, string[]]> = [
      ['PHOTOGRAPHY & VIDEOGRAPHY', ['PHOTOGRAPHY AND VIDEOGRAPHY', 'PHOTOGRAPHY & VIDEOGRAPHY', 'PHOTOGRAPHY', 'VIDEOGRAPHY', 'VIDEO', 'PHOTO']],
      ['FINANCE & AI', ['FINANCE AND AI', 'FINANCE & AI', 'FINANCE AND MARKET RELATIONS', 'FINANCE & MARKET RELATIONS', 'FINANCE', 'MARKET RELATIONS', 'MARKET', 'AI']],
      ['EVENT MANAGEMENT', ['EVENT MANAGEMENT', 'EVENT']],
      ['SOCIAL MEDIA', ['SOCIAL MEDIA']],
      ['DOCUMENTATION', ['DOCUMENTATION', 'DOCS']],
      ['DISCIPLINE', ['DISCIPLINE']],
      ['TECHNICAL', ['TECHNICAL', 'TECH']],
      ['PROMOTION', ['PROMOTION', 'PUBLICITY', 'MARKETING']],
      ['ANCHORING', ['ANCHORING', 'ANCHOR', 'HOST', 'EMCEE', 'MC']],
      ['CREATIVE', ['CREATIVE']],
      ['EXECUTIVE', ['EXECUTIVE MEMBER', 'EXECUTIVE']],
    ];

    // Priority 1: Map based on member_postion (the definitive role of the member)
    for (const [section, keywords] of departmentRules) {
      if (keywords.some((kw) => position.includes(kw))) {
        return section;
      }
    }

    // Priority 2: Fallback to member_club_department
    if (clubDepartment === 'CONVENOR') return 'CONVENOR';
    if (clubDepartment === 'CO CONVENOR' || clubDepartment === 'CO-CONVENOR') return 'CO-CONVENOR';
    if (clubDepartment === 'EXECUTIVE MEMBER' || clubDepartment === 'EXECUTIVE') return 'EXECUTIVE';

    for (const [section, keywords] of departmentRules) {
      if (keywords.some((kw) => clubDepartment.includes(kw))) {
        return section;
      }
    }

    return null;
  };

  const getSafeExternalUrl = (url?: string) => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
    } catch {
      return null;
    }
  };

  const groupedMembers = requiredSections.reduce((acc, section) => {
    acc[section] = [] as Member[];
    return acc;
  }, {} as Record<string, Member[]>);

  members.forEach((member) => {
    const section = resolveSectionForMember(member);
    if (section && groupedMembers[section]) {
      groupedMembers[section].push(member);
    }
  });

  Object.values(groupedMembers).forEach((sectionMembers) => {
    sectionMembers.sort((a, b) => {
      const getRank = (m: Member) => {
        const pos = String(m.member_postion ?? '').toUpperCase().trim();
        const isCo = /\bCO\b/i.test(pos);
        if (isCo) {
          return 2;
        }
        if (pos.includes('HEAD') || pos.includes('CONVENOR')) {
          return 1;
        }
        return 3;
      };

      const rankA = getRank(a);
      const rankB = getRank(b);

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      const aPosition = a.member_postion || '';
      const bPosition = b.member_postion || '';
      const posCompare = aPosition.localeCompare(bPosition);
      if (posCompare !== 0) return posCompare;

      return (a.member_name || '').localeCompare(b.member_name || '');
    });
  });

  function MemberCard({ member, index, isExecutive }: { member: Member; index: number; isExecutive?: boolean }) {
    const [showSocials, setShowSocials] = useState(false);
    const linkedinUrl = getSafeExternalUrl(member.socials?.linkedin);
    const githubUrl = getSafeExternalUrl(member.socials?.github);
    const instagramUrl = getSafeExternalUrl(member.socials?.instagram);
    const safePosition = String(member.member_postion ?? '').replace(/_/g, ' ') || 'Member';
    const safeName = String(member.member_name ?? 'Unnamed Member');

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className={`group relative rounded-3xl overflow-hidden bg-white dark:bg-gray-900/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2 flex flex-col h-full ${
          isExecutive ? 'w-full' : 'w-full sm:w-[280px]'
        }`}
      >
        <div
          onClick={() => setShowSocials(prev => !prev)}
          className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer"
        >
          {member.member_profile_picture_key ? (
            <img
              src={getPublicUrl(member.member_profile_picture_key)}
              alt={safeName}
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
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-purple-600 border border-white/20 flex items-center justify-center transition-all hover:scale-110"
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-purple-600 border border-white/20 flex items-center justify-center transition-all hover:scale-110"
                >
                  <Github className="w-5 h-5 text-white" />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
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

        <div className={`${isExecutive ? 'p-4 sm:p-5' : 'p-5 sm:p-6'} flex flex-col flex-1`}>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-purple-600 dark:text-purple-400 mb-2">
            {safePosition}
          </span>
          <h3 className={`${isExecutive ? 'text-lg sm:text-xl' : 'text-xl'} text-gray-900 dark:text-white mb-2 line-clamp-1`} style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
            {safeName}
          </h3>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Faculty Mentors / Teachers Section */}
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
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {faculty.map((member, index) => (
              <motion.div
                key={index}
                className="group relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950/50 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute -right-24 -top-24 w-56 h-56 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700 pointer-events-none" />
                <div className="absolute -left-24 -bottom-24 w-56 h-56 bg-pink-500/10 dark:bg-pink-500/5 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700 pointer-events-none" />
                
                <div className="p-6 sm:p-10 lg:p-12 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start text-center sm:text-left relative z-10">
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

        {loading ? (
          <div className="flex justify-center items-center py-20 w-full col-span-full">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center gap-4 py-20 w-full">
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <button
              type="button"
              onClick={fetchMembers}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
            >
              Try again
            </button>
          </div>
        ) : (() => {
          const activeSections = requiredSections.filter(
            (section) => (groupedMembers[section] || []).length > 0
          );

          if (activeSections.length === 0) {
            return (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                No team members available right now.
              </div>
            );
          }

          return (
            <div className="grid gap-8 md:gap-10 lg:grid-cols-2">
              {activeSections.map((section) => {
                const sectionMembers = groupedMembers[section] || [];
                const isFullWidthSection = ['CONVENOR', 'CO-CONVENOR', 'EXECUTIVE'].includes(section);

                return (
                  <section
                    key={section}
                    className={`${isFullWidthSection ? 'lg:col-span-2' : ''} mb-8 sm:mb-12`}
                  >
                    <div className="text-center mb-8 sm:mb-10">
                      <h3
                        className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {section}
                      </h3>
                      <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mt-3"></div>
                    </div>

                    {section === 'EXECUTIVE' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {sectionMembers.map((member, index) => (
                          <MemberCard key={member.member_id} member={member} index={index} isExecutive={true} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-center gap-8">
                        {sectionMembers.map((member, index) => (
                          <MemberCard key={member.member_id} member={member} index={index} />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
