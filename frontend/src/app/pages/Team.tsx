import { motion } from "motion/react";
import { 
  Linkedin, 
  Mail, 
  Loader2, 
  User as UserIcon, 
  Github, 
  Instagram, 
  Sparkles,
  ArrowUpRight
} from "lucide-react";
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
  role?: string;
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
      role: "Faculty Mentor",
      image: "/faculty/nisha.jpg",
      email: "nishamasson93@gmail.com",
      zoomScale: 4,
      originX: 0.45,
      originY: 0.25,
    },
    {
      name: "Prof. Jasmine Kaur",
      role: "Faculty Mentor",
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

  const sectionDescriptions: Record<string, string> = {
    'CONVENOR': 'Main character energy steering the ship and setting the standard.',
    'CO-CONVENOR': 'The ultimate co-pilots keeping the vibes high and the execution flawless.',
    'FINANCE & AI': 'Securing the bag, cooking with algorithms, and making sure the math is always mathing.',
    'TECHNICAL': 'Turning caffeine and stack traces into digital magic. If it breaks, they fix it.',
    'DISCIPLINE': 'Zero drama, pure vibes. Keeping everyone respectfully in check with no cap.',
    'DOCUMENTATION': 'Writing the club lore and keeping all the receipts so history never forgets.',
    'EVENT MANAGEMENT': 'Turning chaotic brainstorms into legendary core memories without breaking a sweat.',
    'CREATIVE': 'Serving pure aesthetics and visual bangers. They make everything look iconic.',
    'PROMOTION': 'Hyping up the crowd, dominating the buzz, and making sure FOMO is 100% real.',
    'SOCIAL MEDIA': 'Running the algorithm rent-free, dropping trends, and keeping our feed iconic.',
    'ANCHORING': 'Owning the stage, matching the energy, and commanding the room with immaculate mic presence.',
    'PHOTOGRAPHY & VIDEOGRAPHY': 'Freezing core memories in 4K cinematic gold, doing it strictly for the plot.',
    'EXECUTIVE': 'The relentless hustlers and all-round MVPs powering the engine from behind the scenes.'
  };

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
        if (pos === 'CONVENOR') return 1;
        if (pos.includes('CO-CONVENOR') || pos.includes('CO CONVENOR') || pos.includes('CO_CONVENOR')) return 2;
        if (pos.includes('HEAD') && !pos.includes('CO-') && !pos.includes('CO_') && !pos.includes('CO ')) {
          return 1;
        }
        if (pos.includes('CO-') || pos.includes('CO_') || pos.includes('CO ')) {
          return 2;
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

    const isHead = safePosition.toUpperCase().includes('HEAD') && !safePosition.toUpperCase().includes('CO');
    const isCoHead = safePosition.toUpperCase().includes('CO');

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.25) }}
        className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/90 dark:border-white/10 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/15 dark:hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full w-full"
      >
        {/* Subtle hover gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/0 via-purple-500/0 to-purple-500/5 dark:to-purple-500/15 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100" />

        <div
          onClick={() => setShowSocials(prev => !prev)}
          className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center cursor-pointer"
        >
          {member.member_profile_picture_key ? (
            <img
              src={getPublicUrl(member.member_profile_picture_key)}
              alt={safeName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800/80 dark:to-purple-950/20">
              <UserIcon className="w-16 h-16 text-purple-300 dark:text-purple-600/60" />
            </div>
          )}

          {/* Frosted Socials Quick Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/50 to-transparent backdrop-blur-[2px] transition-all duration-300 flex flex-col justify-end p-4 ${
              showSocials ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <p className="text-[10px] text-purple-200 uppercase tracking-widest font-bold mb-2.5 text-center opacity-90">
              Connect
            </p>
            <div
              className={`flex justify-center gap-2.5 transition-transform duration-300 ${
                showSocials ? 'translate-y-0' : 'translate-y-3 group-hover:translate-y-0'
              }`}
            >
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-purple-600 border border-white/30 flex items-center justify-center transition-all hover:scale-110 shadow-lg text-white"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-purple-600 border border-white/30 flex items-center justify-center transition-all hover:scale-110 shadow-lg text-white"
                  title="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-purple-600 border border-white/30 flex items-center justify-center transition-all hover:scale-110 shadow-lg text-white"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {member.member_email && (
                <a
                  href={`mailto:${member.member_email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-purple-600 border border-white/30 flex items-center justify-center transition-all hover:scale-110 shadow-lg text-white"
                  title="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Card Details */}
        <div className={`${isExecutive ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5'} flex flex-col flex-1 relative z-10 justify-between`}>
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span 
                className={`inline-flex items-center text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-md border ${
                  isHead
                    ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                    : isCoHead
                    ? 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
                    : 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30'
                }`}
              >
                {safePosition}
              </span>
              
              {member.member_department && (
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  {member.member_department}
                </span>
              )}
            </div>

            <h3 
              className={`${isExecutive ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} text-gray-950 dark:text-white font-extrabold tracking-tight line-clamp-1`} 
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {safeName}
            </h3>
          </div>

          {member.member_semester ? (
            <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              <span>Sem {member.member_semester}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500/40"></span>
            </div>
          ) : null}
        </div>
      </motion.div>
    );
  }

  const activeSections = requiredSections.filter(
    (section) => (groupedMembers[section] || []).length > 0
  );

  return (
    <div className="relative bg-gradient-to-b from-slate-50 via-purple-50/20 to-slate-50 dark:from-gray-950 dark:via-purple-950/10 dark:to-gray-950 py-12 sm:py-24 overflow-hidden transition-colors duration-300">
      {/* Creative Dynamic Ambient Lighting Meshes */}
      <div className="absolute top-10 left-1/4 w-[28rem] h-[28rem] bg-purple-500/15 dark:bg-purple-600/15 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[32rem] h-[32rem] bg-pink-500/10 dark:bg-pink-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-10 w-[30rem] h-[30rem] bg-blue-500/10 dark:bg-indigo-600/15 rounded-full blur-[110px] pointer-events-none -z-10" />
      
      {/* Subtle modern dot-grid backdrop */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Page Header */}
        <motion.div
          className="text-center mb-16 sm:mb-24 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 text-xs font-black uppercase tracking-widest mb-4 shadow-sm backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>The Powerhouse Behind The Vibes</span>
          </motion.div>

          <h1 
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-950 dark:text-white mb-4 sm:mb-6"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Meet Our{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
              Creative Minds
            </span>
          </h1>
          <p 
            className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 font-normal leading-relaxed"
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            Passionate dreamers, builders, and storytellers bringing ideas to life at the English Club.
          </p>
        </motion.div>

        {/* Faculty Mentors Section */}
        <section className="mb-20 sm:mb-28">
          <div className="text-center mb-10 sm:mb-14">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-950 dark:text-white mb-3"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Faculty Mentors
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full mx-auto mt-2 mb-3"></div>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-xs sm:text-sm font-medium">
              The guiding pillars of our club, providing wisdom, mentorship, and continuous inspiration.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 gap-8 sm:gap-10 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {faculty.map((member, index) => (
              <motion.div
                key={index}
                className="group relative rounded-[2rem] overflow-hidden bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/90 dark:border-white/10 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/15 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700 pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-pink-500/10 dark:bg-pink-500/15 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700 pointer-events-none" />
                
                <div className="p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start text-center sm:text-left relative z-10">
                  <div className="relative flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 rounded-3xl overflow-hidden p-[3px] bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 shadow-xl group-hover:rotate-2 transition-transform duration-500">
                    <div className="w-full h-full rounded-[21px] overflow-hidden bg-white dark:bg-gray-900">
                      <motion.img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        style={{
                          originX: member.originX ?? 0.5,
                          originY: member.originY ?? 0.5,
                          scale: member.zoomScale ?? 1.0,
                        }}
                        whileHover={{ scale: (member.zoomScale ?? 1.0) * 1.08 }}
                        transition={{ duration: 0.5 }}
                        loading="lazy"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center sm:items-start justify-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 mb-2.5 uppercase tracking-widest">
                      {member.role || "Faculty Mentor"}
                    </span>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl text-gray-950 dark:text-white font-extrabold tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {member.name}
                    </h3>
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-950 hover:bg-purple-600 dark:bg-white dark:hover:bg-purple-600 text-white dark:text-gray-950 dark:hover:text-white text-xs font-bold shadow-md hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5 group/btn"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      >
                        <Mail className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
                        <span>Contact Mentor</span>
                        <ArrowUpRight className="w-3 h-3 opacity-60" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Member Sections */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 w-full">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
            <p className="text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Loading team members...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center gap-4 py-20 w-full text-center">
            <p className="text-red-500 dark:text-red-400 font-medium">{error}</p>
            <button
              type="button"
              onClick={fetchMembers}
              className="rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-purple-700 shadow-md shadow-purple-600/25 cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : (() => {
          if (activeSections.length === 0) {
            return (
              <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                No team members found.
              </div>
            );
          }

          return (
            <div className="grid gap-12 md:gap-14 lg:grid-cols-2">
              {activeSections.map((section) => {
                const sectionMembers = groupedMembers[section] || [];
                const isFullWidthSection = ['CONVENOR', 'CO-CONVENOR', 'EXECUTIVE'].includes(section);

                return (
                  <section
                    key={section}
                    className={`${isFullWidthSection ? 'lg:col-span-2' : ''} mb-8 sm:mb-12`}
                  >
                    {/* Clean & Artistic Department Title & Tagline */}
                    <div className="text-center mb-8 sm:mb-10 max-w-xl mx-auto">
                      <h3
                        className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {section}
                      </h3>
                      <div className="w-10 h-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full mx-auto mt-2.5 mb-3"></div>
                      
                      {sectionDescriptions[section] && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium px-4 leading-relaxed">
                          {sectionDescriptions[section]}
                        </p>
                      )}
                    </div>

                    {/* Cards Grid: 2 people per row inside each dept column, centered if only 1 member */}
                    {section === 'EXECUTIVE' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                        {sectionMembers.map((member, index) => (
                          <MemberCard key={member.member_id} member={member} index={index} isExecutive={true} />
                        ))}
                      </div>
                    ) : sectionMembers.length === 1 ? (
                      <div className="flex justify-center max-w-[280px] mx-auto w-full">
                        <MemberCard member={sectionMembers[0]} index={0} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
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
