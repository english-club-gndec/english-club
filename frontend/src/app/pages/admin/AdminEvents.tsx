import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Calendar as CalendarIcon, Clock, MapPin, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { eventService } from "../../../services/eventService";
import { useAuth } from "../../context/AuthContext";

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
  const { userId } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventService.getAllEvents();
        const transformedEvents = data.map((ev: any) => ({
          id: ev.event_id,
          name: ev.event_name,
          description: ev.event_description,
          date: ev.event_date,
          time: ev.event_time,
          venue: ev.event_venue,
          createdBy: ev.creater_name || "System"
        }));
        setEvents(transformedEvents);
      } catch (error) {
        toast.error("Failed to fetch events");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "12:00 PM",
    venue: "",
    eventPoster: ""
  });

  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [tempTime, setTempTime] = useState({ hour: "12", minute: "00", period: "PM" });

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEvent) {
      try {
        const payload = {
          event_name: formData.name,
          event_description: formData.description,
          event_date: formData.date,
          event_time: formData.time,
          event_venue: formData.venue
        };
        await eventService.updateEvent(editingEvent.id, payload);
        toast.success("Event updated successfully!");
        
        // Refresh list
        const data = await eventService.getAllEvents();
        const transformedEvents = data.map((ev: any) => ({
          id: ev.event_id,
          name: ev.event_name,
          description: ev.event_description,
          date: ev.event_date,
          time: ev.event_time,
          venue: ev.event_venue,
          createdBy: ev.creater_name || "System"
        }));
        setEvents(transformedEvents);
      } catch (error: any) {
        toast.error(error.message || "Failed to update event");
        return;
      }
    } else {
      if (!userId) return;
      try {
        const payload = {
          event_name: formData.name,
          event_description: formData.description,
          event_date: formData.date,
          event_time: formData.time,
          event_venue: formData.venue,
          created_by: parseInt(userId)
        };
        await eventService.createEvent(payload);
        toast.success("Event created successfully!");
        
        // Refresh list
        const data = await eventService.getAllEvents();
        const transformedEvents = data.map((ev: any) => ({
          id: ev.event_id,
          name: ev.event_name,
          description: ev.event_description,
          date: ev.event_date,
          time: ev.event_time,
          venue: ev.event_venue,
          createdBy: ev.creater_name || "System"
        }));
        setEvents(transformedEvents);
      } catch (error: any) {
        toast.error(error.message || "Failed to create event");
        return;
      }
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
        eventPoster: "" // placeholder
      });
    } else {
      setEditingEvent(null);
      setFormData({
        name: "",
        description: "",
        date: "",
        time: "",
        venue: "",
        eventPoster: ""
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

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-4 py-20 min-h-[400px] w-full"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500"
                />
                <Loader2 className="w-8 h-8 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 animate-pulse" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                Loading upcoming events...
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="events-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
            >
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
              {events.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                  <p className="text-gray-500 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    No events found. Create one to get started!
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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

                  <div className="relative">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Time
                    </label>
                    <button
                      type="button"
                      onClick={() => setTimePickerOpen(!timePickerOpen)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-between hover:border-purple-500 transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    >
                      <span>{formData.time || "Select Time"}</span>
                      <Clock className="w-4 h-4 text-purple-500" />
                    </button>

                    <AnimatePresence>
                      {timePickerOpen && (
                        <>
                          <div className="fixed inset-0 z-[60]" onClick={() => setTimePickerOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-4 z-[70]"
                          >
                            <div className="flex gap-4 mb-4">
                              <div className="flex-1">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">Hour</p>
                                <div className="grid grid-cols-4 gap-1">
                                  {hours.map(h => (
                                    <button
                                      key={h}
                                      type="button"
                                      onClick={() => setTempTime({ ...tempTime, hour: h })}
                                      className={`p-1 text-xs rounded-md transition-all ${tempTime.hour === h ? 'bg-purple-600 text-white' : 'hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300'}`}
                                    >
                                      {h}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 mb-4">
                              <div className="flex-1">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">Minute</p>
                                <div className="grid grid-cols-4 gap-1">
                                  {minutes.map(m => (
                                    <button
                                      key={m}
                                      type="button"
                                      onClick={() => setTempTime({ ...tempTime, minute: m })}
                                      className={`p-1 text-xs rounded-md transition-all ${tempTime.minute === m ? 'bg-purple-600 text-white' : 'hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300'}`}
                                    >
                                      {m}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                {["AM", "PM"].map(p => (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => setTempTime({ ...tempTime, period: p })}
                                    className={`px-3 py-1 text-xs rounded-md transition-all ${tempTime.period === p ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' : 'text-gray-500'}`}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, time: `${tempTime.hour}:${tempTime.minute} ${tempTime.period}` });
                                  setTimePickerOpen(false);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-blue-900 to-purple-700 text-white text-xs rounded-lg font-bold"
                              >
                                Done
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
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

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Event Poster (api connection left)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl cursor-not-allowed bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 dark:text-gray-400">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-xs" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          Upload functionality coming soon
                        </p>
                      </div>
                    </label>
                  </div>
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
