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

export function Team() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    'TECHNICAL',
    'CREATIVE & PHOTOGRAPHY',
    'EVENT MANAGEMENT',
    'PROMOTION',
    'ANCHORING'
  ] as const;

  const normalizeSectionValue = (value?: string | null) =>
    String(value ?? '')
      .toUpperCase()
      .replace(/[_+-]/g, ' ')
      .replace(/&/g, ' AND ')
      .replace(/\s+/g, ' ')
      .trim();

  const resolveSectionForMember = (member: Member): string | null => {
    const position = normalizeSectionValue(member.member_postion);
    const clubDepartment = normalizeSectionValue(member.member_club_department);

    // Leadership sections are determined by the stored position, regardless
    // of the club department selected for the member.
    if (position === 'CO CONVENOR') return 'CO-CONVENOR';
    if (position === 'CONVENOR') return 'CONVENOR';
    if (clubDepartment === 'CO CONVENOR') return 'CO-CONVENOR';
    if (clubDepartment === 'CONVENOR') return 'CONVENOR';

    const sectionAliases: Array<[string, string[]]> = [
      ['TECHNICAL', ['TECHNICAL', 'TECH']],
      ['CREATIVE & PHOTOGRAPHY', ['CREATIVE AND PHOTOGRAPHY', 'CREATIVE', 'PHOTOGRAPHY', 'VIDEOGRAPHY', 'VIDEO']],
      ['EVENT MANAGEMENT', ['EVENT MANAGEMENT', 'EVENT']],
      ['PROMOTION', ['PROMOTION', 'PUBLICITY', 'MARKETING', 'SOCIAL MEDIA']],
      ['ANCHORING', ['ANCHORING', 'ANCHOR', 'HOST', 'EMCEE', 'MC']],
    ];

    for (const [section, aliases] of sectionAliases) {
      if (aliases.some((alias) => clubDepartment === alias || clubDepartment.includes(alias))) {
        return section;
      }
    }

    // Backwards compatibility for existing members created before the admin
    // form used canonical club-department values.
    const legacyValue = `${position} ${clubDepartment}`;
    for (const [section, aliases] of sectionAliases) {
      if (aliases.some((alias) => legacyValue.includes(alias))) return section;
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
      const aPosition = a.member_postion || '';
      const bPosition = b.member_postion || '';
      return aPosition.localeCompare(bPosition);
    });
  });

  function MemberCard({ member, index }: { member: Member; index: number }) {
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
        className="group relative rounded-3xl overflow-hidden bg-white dark:bg-gray-900/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2 flex flex-col h-full w-full sm:w-[280px]"
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

        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-purple-600 dark:text-purple-400 mb-2">
            {safePosition}
          </span>
          <h3 className="text-xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
            {safeName}
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
        ) : (
          <div className="grid gap-8 md:gap-10 lg:grid-cols-2">
            {requiredSections.map((section) => {
              const sectionMembers = groupedMembers[section] || [];
              const isFullWidthSection = ['CONVENOR', 'CO-CONVENOR', 'ANCHORING'].includes(section);

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

                  {sectionMembers.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-8">
                      {sectionMembers.map((member, index) => (
                        <MemberCard key={member.member_id} member={member} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center min-h-[120px] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                      No members assigned yet.
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
