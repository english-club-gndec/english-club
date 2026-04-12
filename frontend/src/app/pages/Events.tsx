import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import { Calendar, Clock, MapPin, Users, X } from "lucide-react";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  category: "upcoming" | "past";
}

interface PastEvent extends Event {
  attendees: number;
  report: string;
}

export function Events() {
  const [selectedEvent, setSelectedEvent] = useState<PastEvent | null>(null);

  const upcomingEvents: Event[] = [
    {
      id: 1,
      title: "Public Speaking Workshop",
      date: "April 20, 2026",
      time: "3:00 PM - 5:00 PM",
      location: "Auditorium A",
      description: "Master the art of public speaking with expert guidance. Learn techniques to overcome stage fright and deliver impactful presentations.",
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=400&fit=crop",
      category: "upcoming"
    },
    {
      id: 2,
      title: "Creative Writing Competition",
      date: "April 28, 2026",
      time: "2:00 PM - 4:00 PM",
      location: "Library Hall",
      description: "Unleash your creativity in our annual writing competition. Categories include poetry, short stories, and essays.",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop",
      category: "upcoming"
    },
    {
      id: 3,
      title: "Debate Championship",
      date: "May 5, 2026",
      time: "10:00 AM - 4:00 PM",
      location: "Main Hall",
      description: "Participate in exciting debates on contemporary topics. Sharpen your critical thinking and argumentation skills.",
      image: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=600&h=400&fit=crop",
      category: "upcoming"
    },
  ];

  const pastEvents: PastEvent[] = [
    {
      id: 4,
      title: "Literary Festival 2026",
      date: "March 15, 2026",
      time: "Full Day Event",
      location: "College Campus",
      description: "A celebration of literature featuring author talks, book stalls, and poetry readings.",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop",
      category: "past",
      attendees: 250,
      report: "Our annual Literary Festival was a grand success with over 250 attendees. We hosted renowned authors, conducted interactive sessions, and celebrated the power of words. Students participated enthusiastically in poetry slams, book discussions, and creative writing workshops."
    },
    {
      id: 5,
      title: "Storytelling Night",
      date: "February 28, 2026",
      time: "6:00 PM - 8:00 PM",
      location: "Open Air Theater",
      description: "An evening of captivating stories shared by students and guest speakers.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
      category: "past",
      attendees: 120,
      report: "A magical evening under the stars where students shared personal narratives, folk tales, and creative stories. The event fostered a sense of community and showcased the diverse storytelling talents of our members."
    },
    {
      id: 6,
      title: "Grammar Workshop Series",
      date: "January 20, 2026",
      time: "4:00 PM - 6:00 PM",
      location: "Room 301",
      description: "Intensive workshop covering advanced grammar concepts and common errors.",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop",
      category: "past",
      attendees: 85,
      report: "Students learned essential grammar rules, punctuation techniques, and strategies to improve their writing. Interactive exercises and real-world examples made the learning experience engaging and practical."
    },
  ];

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
    <div className="bg-white dark:bg-gray-950 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl lg:text-6xl text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>
            Our Events
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Join us for exciting events that enhance your skills and broaden your horizons
          </p>
        </motion.div>

        <section className="mb-20">
          <motion.h2
            className="text-3xl lg:text-4xl text-gray-900 dark:text-white mb-12"
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Upcoming Events
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {upcomingEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={item}
                className="group rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:shadow-purple-500/20 transition-all hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl text-gray-900 dark:text-white mb-3 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    {event.title}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                      <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                      <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                      <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{event.location}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    {event.description}
                  </p>
                  <Link
                    to="/register"
                    className="inline-block w-full text-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
                  >
                    Register Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section>
          <motion.h2
            className="text-3xl lg:text-4xl text-gray-900 dark:text-white mb-12"
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Past Events
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {pastEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={item}
                onClick={() => setSelectedEvent(event)}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:shadow-purple-500/20 transition-all hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                    <div className="flex items-center gap-1 text-xs text-gray-900 dark:text-white" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      <Users className="w-3 h-3" />
                      {event.attendees}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl text-gray-900 dark:text-white mb-3 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <Calendar className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                    <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{event.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    {event.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>

      {selectedEvent && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
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
                src={selectedEvent.image}
                alt={selectedEvent.title}
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
            <div className="p-8">
              <h2 className="text-3xl text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                {selectedEvent.title}
              </h2>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{selectedEvent.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{selectedEvent.attendees} attendees</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{selectedEvent.location}</span>
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  Event Report
                </h3>
                <p className="text-gray-600 dark:text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  {selectedEvent.report}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
