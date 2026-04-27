import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Calendar as CalendarIcon, Clock, MapPin, Loader2, Image as ImageIcon, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { eventService } from "../../../services/eventService";
import { userService } from "../../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

interface Event {
  id: number;
  name: string;
  shortDescription: string;
  longDescription: string;
  date: string;
  time: string;
  venue: string;
  createdBy: string;
  creatorId: number;
  poster?: string;
}

export function AdminEvents() {
  const { userId } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [usersMap, setUsersMap] = useState<Record<number, { name: string, profileUrl: string | null }>>({});

  useEffect(() => {
    fetchEventsList();
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    if (!userId) return;
    try {
      const usersData = await userService.getUsers(userId);
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
      console.error("Failed to fetch users for profile pictures:", error);
    }
  };

  const fetchEventsList = async () => {
    setIsLoading(true);
    try {
      const data = await eventService.getAllEvents();
      const transformedEvents = data.map((ev: any) => ({
        id: ev.event_id,
        name: ev.event_name,
        shortDescription: ev.event_short_description,
        longDescription: ev.event_long_description || "",
        date: ev.event_date,
        time: ev.event_time,
        venue: ev.event_venue,
        createdBy: ev.creater_name || "System",
        creatorId: ev.created_by,
        poster: ev.event_poster_key
      }));
      setEvents(transformedEvents);
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    longDescription: "",
    date: "",
    time: "12:00 PM",
    venue: "",
    eventPoster: ""
  });

  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [tempTime, setTempTime] = useState({ hour: "12", minute: "00", period: "PM" });

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPosterFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File, eventName: string) => {
    const extension = file.name.split('.').pop();
    const fileName = `${eventName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${extension}`;
    
    const { error } = await supabase.storage
      .from('event_posters')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      });

    if (error) throw error;
    return fileName;
  };

  const getPublicUrl = (key: string | undefined) => {
    if (!key) return "";
    const { data } = supabase.storage.from('event_posters').getPublicUrl(key);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEvent) {
      try {
        let posterKey = formData.eventPoster;
        if (posterFile) {
          posterKey = await uploadImage(posterFile, formData.name);
        }

        const payload = {
          event_name: formData.name,
          event_short_description: formData.shortDescription,
          event_long_description: formData.longDescription,
          event_date: formData.date,
          event_time: formData.time,
          event_venue: formData.venue,
          event_poster_key: posterKey
        };
        await eventService.updateEvent(editingEvent.id, payload);
        toast.success("Event updated successfully!");
        
        await fetchEventsList();
        closeModal();
      } catch (error: any) {
        toast.error(error.message || "Failed to update event");
        return;
      }
    } else {
      if (!userId) return;
      try {
        let posterKey = "";
        if (posterFile) {
          posterKey = await uploadImage(posterFile, formData.name);
        }
        const payload = {
          event_name: formData.name,
          event_short_description: formData.shortDescription,
          event_long_description: formData.longDescription,
          event_date: formData.date,
          event_time: formData.time,
          event_venue: formData.venue,
          event_poster_key: posterKey,
          created_by: parseInt(userId)
        };
        await eventService.createEvent(payload);
        toast.success("Event created successfully!");
        
        await fetchEventsList();
        closeModal();
      } catch (error: any) {
        toast.error(error.message || "Failed to create event");
        return;
      }
    }
  };

  const handleDelete = (_id: number) => {
    toast.info("Deletion is currently disabled (placeholder)");
  };

  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      let formattedDate = "";
      if (event.date) {
        const d = new Date(event.date);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString().split('T')[0];
        }
      }
      setFormData({
        name: event.name,
        shortDescription: event.shortDescription,
        longDescription: event.longDescription,
        date: formattedDate,
        time: event.time,
        venue: event.venue,
        eventPoster: event.poster || ""
      });
      setPreviewUrl(event.poster ? getPublicUrl(event.poster) : "");
    } else {
      setEditingEvent(null);
      setFormData({
        name: "",
        shortDescription: "",
        longDescription: "",
        date: "",
        time: "12:00 PM",
        venue: "",
        eventPoster: ""
      });
      setPreviewUrl("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setPosterFile(null);
    setPreviewUrl("");
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
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
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
          ) : events.length === 0 ? (
            <motion.div 
              key="no-events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl w-full"
            >
              <p className="text-gray-500 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                No events found. Create one to get started!
              </p>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div 
              key="events-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
            >
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setViewingEvent(event)}
                  className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all group cursor-pointer"
                >
                  <div className="h-48 w-full overflow-hidden relative">
                    <img 
                      src={event.poster ? getPublicUrl(event.poster) : "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800"} 
                      alt={event.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl text-gray-900 dark:text-white flex-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                        {event.name}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(event);
                          }}
                          className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(event.id);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      {event.shortDescription}
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

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {usersMap[event.creatorId]?.profileUrl ? (
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-purple-500/20">
                            <img src={usersMap[event.creatorId].profileUrl!} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                            {event.createdBy.charAt(0)}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          <span className="font-semibold">{event.createdBy}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="events-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">Event</th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">Date & Time</th>
                      <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">Venue</th>
                      <th className="px-6 py-4 text-right text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                  src={event.poster ? getPublicUrl(event.poster) : "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=200"} 
                                  alt="" 
                                  className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-white truncate">{event.name}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[200px]">{event.shortDescription}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <CalendarIcon className="w-3 h-3 text-purple-500" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3 text-purple-400" />
                              <span>{event.time}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3 h-3 text-purple-500" />
                            <span>{event.venue}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                  <label htmlFor="shortDescription" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Short Description
                  </label>
                  <textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    required
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                    placeholder="Brief overview of the event"
                  />
                </div>

                <div>
                  <label htmlFor="longDescription" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                    Long Description
                  </label>
                  <textarea
                    id="longDescription"
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                    placeholder="Detailed information about the event"
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
                    Event Poster
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all overflow-hidden relative group">
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} className="w-full h-40 object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Plus className="w-8 h-8 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 dark:text-gray-400">
                          <Plus className="w-8 h-8 mb-2" />
                          <p className="text-xs uppercase font-bold tracking-widest" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                            Upload Poster
                          </p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleFileChange} />
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
      <AnimatePresence>
        {viewingEvent && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingEvent(null)}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-64 w-full">
                <img 
                  src={viewingEvent.poster ? getPublicUrl(viewingEvent.poster) : "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800"} 
                  alt={viewingEvent.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={() => setViewingEvent(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute bottom-6 left-8 right-8">
                  <h2 className="text-3xl text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                    {viewingEvent.name}
                  </h2>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <CalendarIcon className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Date</p>
                      <p className="text-sm font-semibold dark:text-white">{new Date(viewingEvent.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Time</p>
                      <p className="text-sm font-semibold dark:text-white">{viewingEvent.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 col-span-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Venue</p>
                      <p className="text-sm font-semibold dark:text-white">{viewingEvent.venue}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">Short Description</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      {viewingEvent.shortDescription}
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">Detailed Information</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap italic" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        {viewingEvent.longDescription || "That's all for now, folks :)"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {usersMap[viewingEvent.creatorId]?.profileUrl ? (
                      <div className="w-10 h-10 rounded-full border-2 border-purple-500/20 overflow-hidden">
                        <img src={usersMap[viewingEvent.creatorId].profileUrl!} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {viewingEvent.createdBy.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Created By</p>
                      <p className="text-xs font-semibold dark:text-white">{viewingEvent.createdBy}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingEvent(null)}
                    className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
