import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Calendar, Clock, MapPin, Users, X, Info } from "lucide-react";
import { eventService } from "../../services/eventService";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

import { userService } from "../../services/userService";

interface Event {
  event_id: number;
  event_name: string;
  event_short_description: string;
  event_long_description: string;
  event_date: string;
  event_time: string;
  event_venue: string;
  event_poster_key: string;
  created_by: number;
  creater_name?: string;
}

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [usersMap, setUsersMap] = useState<Record<number, { name: string, profileUrl: string | null }>>({});
  const navigate = useNavigate();

  const handleRegister = (e: React.MouseEvent, eventId: number) => {
    e.stopPropagation();
    navigate('/register', { state: { selectedEventId: eventId } });
  };

  const fetchUsers = async () => {
    try {
      // We pass a dummy ID or modify userService to allow public fetching of basic member info
      // For now, let's assume we can fetch them.
      const usersData = await userService.getUsers("0"); 
      const map: Record<number, { name: string, profileUrl: string | null }> = {};
      usersData.forEach((u: any) => {
        let profileUrl = null;
        const profileKey = u.members?.member_profile_picture_key;
        if (profileKey) {
          const { data } = supabase.storage.from('profile_pictures').getPublicUrl(profileKey);
          profileUrl = data.publicUrl;
        }
        map[u.user_id] = {
          name: u.members?.member_name || u.user_name,
          profileUrl
        };
      });
      setUsersMap(map);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (error) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, []);

  const getPublicUrl = (key: string | undefined) => {
    if (!key) return "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800";
    const { data } = supabase.storage.from('event_posters').getPublicUrl(key);
    return data.publicUrl;
  };

  const categorizeEvents = () => {
    const past: Event[] = [];
    const current: Event[] = [];
    const upcoming: Event[] = [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    events.forEach(event => {
      if (event.event_date < todayStr) past.push(event);
      else if (event.event_date > todayStr) upcoming.push(event);
      else current.push(event);
    });

    return { past, current, upcoming };
  };

  const { past, current, upcoming } = categorizeEvents();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-gray-500 animate-pulse" style={{ fontFamily: 'Poppins, sans-serif' }}>Loading events...</p>
        </div>
      </div>
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
            Our Events
          </h1>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Join us for exciting events that enhance your skills and broaden your horizons
          </p>
        </motion.div>

        {current.length > 0 && (
          <section className="mb-20">
            <motion.h2
              className="text-3xl lg:text-4xl text-gray-900 dark:text-white mb-12"
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              Current Events
            </motion.h2>

            <motion.div
              className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {current.map((event) => {
                const isLive = true; // Current events are live by definition
                return (
                  <motion.div
                    key={event.event_id}
                    variants={item}
                    onClick={() => setSelectedEvent(event)}
                    className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:shadow-purple-500/10 transition-all hover:-translate-y-2 flex flex-col h-full"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <img
                        src={getPublicUrl(event.event_poster_key)}
                        alt={event.event_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {isLive && (
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest animate-pulse shadow-lg">
                          Live Now
                        </div>
                      )}
                    </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-xl text-gray-900 dark:text-white font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {event.event_name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      {event.event_short_description}
                    </p>
                    {event.event_long_description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-6 line-clamp-2 italic" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        {event.event_long_description}
                      </p>
                    )}

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          {new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{event.event_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span className="truncate" style={{ fontFamily: 'Open Sans, sans-serif' }}>{event.event_venue}</span>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => handleRegister(e, event.event_id)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95" 
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Register Now
                    </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section className="mb-20">
            <motion.h2
              className="text-3xl lg:text-4xl text-gray-900 dark:text-white mb-12"
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              Upcoming Events
            </motion.h2>

            <motion.div
              className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {upcoming.map((event) => (
                <motion.div
                  key={event.event_id}
                  variants={item}
                  onClick={() => setSelectedEvent(event)}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:shadow-purple-500/10 transition-all hover:-translate-y-2 flex flex-col h-full"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={getPublicUrl(event.event_poster_key)}
                      alt={event.event_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-xl text-gray-900 dark:text-white font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {event.event_name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      {event.event_short_description}
                    </p>
                    {event.event_long_description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-6 line-clamp-2 italic" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        {event.event_long_description}
                      </p>
                    )}

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          {new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{event.event_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span className="truncate" style={{ fontFamily: 'Open Sans, sans-serif' }}>{event.event_venue}</span>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => handleRegister(e, event.event_id)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95" 
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Register Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        <section>
          <motion.h2
            className="text-3xl lg:text-4xl text-gray-900 dark:text-white mb-12"
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            Past Events
          </motion.h2>

          <motion.div
            className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {past.length > 0 ? (
              past.map((event) => (
                <motion.div
                  key={event.event_id}
                  variants={item}
                  onClick={() => setSelectedEvent(event)}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:shadow-purple-500/10 transition-all hover:-translate-y-2 flex flex-col h-full"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={getPublicUrl(event.event_poster_key)}
                      alt={event.event_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-xl text-gray-900 dark:text-white font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {event.event_name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      {event.event_short_description}
                    </p>
                    {event.event_long_description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-6 line-clamp-2 italic" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        {event.event_long_description}
                      </p>
                    )}

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          {new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{event.event_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span className="truncate" style={{ fontFamily: 'Open Sans, sans-serif' }}>{event.event_venue}</span>
                      </div>
                    </div>

                    <button className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-bold cursor-not-allowed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Event Closed
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center rounded-3xl bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-2xl text-gray-500 dark:text-gray-400 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Nothing's here, mate :)
                </p>
              </div>
            )}
          </motion.div>
        </section>
      </div>

      {selectedEvent && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64">
              <img
                src={getPublicUrl(selectedEvent.event_poster_key)}
                alt={selectedEvent.event_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-900 transition-colors"
              >
                <X className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>
            </div>
            <div className="p-4 sm:p-8">
              <h2 className="text-3xl text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                {selectedEvent.event_name}
              </h2>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{new Date(selectedEvent.event_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{selectedEvent.event_time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{selectedEvent.event_venue}</span>
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  Event Details
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  {selectedEvent.event_short_description}
                </p>
                <div className="mt-6 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <h4 className="text-sm font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Detailed Overview
                  </h4>
                  <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-6" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    {selectedEvent.event_long_description || "That's all for now, folks :)"}
                  </p>

                  {new Date(selectedEvent.event_date) < new Date(new Date().setHours(0,0,0,0)) ? (
                    <button className="w-full py-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold cursor-not-allowed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Event Closed
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => handleRegister(e, selectedEvent.event_id)}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:shadow-xl hover:shadow-purple-500/40 transition-all active:scale-95" 
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Register Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
