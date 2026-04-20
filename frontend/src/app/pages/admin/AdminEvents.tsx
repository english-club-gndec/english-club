import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Plus, Edit2, Trash2, X, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  createdBy: string;
}

export function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      name: "Public Speaking Workshop",
      description: "Master the art of public speaking with expert guidance.",
      date: "2026-04-25",
      time: "3:00 PM - 5:00 PM",
      venue: "Auditorium A",
      createdBy: "Admin"
    },
    {
      id: 2,
      name: "Creative Writing Competition",
      description: "Unleash your creativity in our annual writing competition.",
      date: "2026-05-02",
      time: "2:00 PM - 4:00 PM",
      venue: "Library Hall",
      createdBy: "Admin"
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    venue: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEvent) {
      setEvents(events.map(ev => ev.id === editingEvent.id ? {
        ...ev,
        ...formData,
      } : ev));
      toast.success("Event updated successfully!");
    } else {
      const newEvent: Event = {
        id: Math.max(...events.map(e => e.id)) + 1,
        ...formData,
        createdBy: "Admin"
      };
      setEvents([...events, newEvent]);
      toast.success("Event created successfully!");
    }

    closeModal();
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter(e => e.id !== id));
      toast.success("Event deleted successfully!");
    }
  };

  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        name: event.name,
        description: event.description,
        date: event.date,
        time: event.time,
        venue: event.venue,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        name: "",
        description: "",
        date: "",
        time: "",
        venue: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Events Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Create and manage club events
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
          >
            <Plus className="w-5 h-5" />
            Create Event
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl text-gray-900 dark:text-white flex-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                  {event.name}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(event)}
                    className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                {event.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                  <span style={{ fontFamily: 'Open Sans, sans-serif' }}>{event.venue}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  Created by: <span className="font-semibold">{event.createdBy}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6 flex items-center justify-between">
                <h2 className="text-2xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                  {editingEvent ? "Edit Event" : "Create New Event"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Event Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Time
                    </label>
                    <input
                      type="text"
                      id="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      placeholder="e.g., 3:00 PM - 5:00 PM"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="venue" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Venue
                  </label>
                  <input
                    type="text"
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
                  >
                    {editingEvent ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
