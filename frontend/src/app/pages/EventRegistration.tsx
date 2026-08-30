import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { CheckCircle, AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import { eventService } from "../../services/eventService";
import { registrationService } from "../../services/EventRegistration";

interface TeamParticipant {
  id: string;
  name: string;
  email: string;
  stream: string;
  year: string;
  section: string;
  crn: string;
  urn: string;
  phone: string;
}

const createParticipant = (): TeamParticipant => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: "",
  email: "",
  stream: "",
  year: "",
  section: "",
  crn: "",
  urn: "",
  phone: "",
});

export function EventRegistration() {
  const location = useLocation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamParticipants, setTeamParticipants] = useState<TeamParticipant[]>([createParticipant()]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    stream: "",
    year: "",
    section: "",
    crn: "",
    urn: "",
    event_id: "",
  });

  const isTeamEvent = selectedEvent?.event_type?.toUpperCase() === "TEAM";
  const maxTeamSize = Number(selectedEvent?.max_team_size || 0);
  const canAddParticipant = isTeamEvent && Number.isFinite(maxTeamSize) && teamParticipants.length < maxTeamSize;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventService.getAllEvents();
        setEventsList(data);

        if (location.state?.selectedEventId) {
          const preselectedId = location.state.selectedEventId.toString();
          setFormData(prev => ({ ...prev, event_id: preselectedId }));
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [location.state]);

  useEffect(() => {
    const foundEvent = eventsList.find((event) => String(event.event_id) === String(formData.event_id)) || null;
    setSelectedEvent(foundEvent);

    if (!foundEvent || foundEvent.event_type?.toUpperCase() !== "TEAM") {
      setTeamName("");
      setTeamParticipants([createParticipant()]);
    }
  }, [eventsList, formData.event_id]);

  const handleTeamParticipantChange = (participantId: string, field: keyof TeamParticipant, value: string) => {
    setTeamParticipants((prev) =>
      prev.map((participant) =>
        participant.id === participantId ? { ...participant, [field]: value } : participant
      )
    );
  };

  const addTeamParticipant = () => {
    if (!canAddParticipant) return;
    setTeamParticipants((prev) => [...prev, createParticipant()]);
  };

  const removeTeamParticipant = (participantId: string) => {
    setTeamParticipants((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((participant) => participant.id !== participantId);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const eventId = Number(formData.event_id);
      if (!eventId) {
        throw new Error("Please select an event");
      }

      if (isTeamEvent) {
        if (!teamName.trim()) {
          throw new Error("Team name is required for team events.");
        }

        if (teamParticipants.length > maxTeamSize && maxTeamSize > 0) {
          throw new Error(`Team size cannot exceed ${maxTeamSize}.`);
        }

        const normalizedParticipants = teamParticipants.map((participant, index) => {
          const participantClass = `D${participant.year}${participant.stream}${participant.section.toUpperCase()}`;
          const trimmedPhone = participant.phone.trim();
          if (!participant.name.trim() || !participant.email.trim() || !participantClass || !participant.stream || !participant.year || !participant.section || !trimmedPhone) {
            throw new Error(`Participant ${index + 1} is missing required details.`);
          }

          const phonePattern = /^[0-9+()\-\s]{7,15}$/;
          if (!phonePattern.test(trimmedPhone)) {
            throw new Error(`Participant ${index + 1} has an invalid phone number.`);
          }

          return {
            participant_name: participant.name.trim(),
            participant_class: participantClass,
            participant_crn: participant.crn ? Number(participant.crn) : null,
            participant_urn: participant.urn ? Number(participant.urn) : null,
            participant_email: participant.email.trim(),
            participant_phone_no: trimmedPhone,
          };
        });

        await registrationService.registerParticipant({
          team_name: teamName.trim(),
          registered_event: eventId,
          participants: normalizedParticipants,
        });
      } else {
        const participantClass = `D${formData.year}${formData.stream}${formData.section.toUpperCase()}`;
        const phonePattern = /^[0-9+()\-\s]{7,15}$/;
        const trimmedPhone = formData.phone.trim();

        if (!formData.name.trim() || !formData.email.trim() || !participantClass || !formData.stream || !formData.year || !formData.section || !trimmedPhone) {
          throw new Error("Please fill in all required registration fields, including phone number.");
        }

        if (!phonePattern.test(trimmedPhone)) {
          throw new Error("Please enter a valid phone number.");
        }

        await registrationService.registerParticipant({
          participant_name: formData.name.trim(),
          participant_class: participantClass,
          participant_crn: formData.crn ? Number(formData.crn) : null,
          participant_urn: formData.urn ? Number(formData.urn) : null,
          participant_email: formData.email.trim(),
          participant_phone_no: trimmedPhone,
          registered_event: eventId,
        });
      }

      setIsSubmitted(true);
      setTimeout(() => {
        setFormData({ name: "", email: "", phone: "", stream: "", year: "", section: "", crn: "", urn: "", event_id: "" });
        setTeamName("");
        setTeamParticipants([createParticipant()]);
        setSelectedEvent(null);
        setIsSubmitted(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white dark:bg-gray-950 py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-5xl lg:text-6xl text-gray-900 dark:text-white mb-4 sm:mb-6" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>
            Event Registration
          </h1>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Register for our upcoming events and be part of something amazing
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=800&fit=crop"
                alt="Event registration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-purple-700/40"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-900 to-purple-700 rounded-3xl blur-3xl opacity-50"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isTeamEvent && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="crn" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        College Roll No. (CRN) <span className="text-xs font-normal text-purple-600 dark:text-purple-400">(Enter 123 if not assigned yet)</span>
                      </label>
                      <input
                        type="number"
                        id="crn"
                        name="crn"
                        value={formData.crn}
                        onChange={handleChange}
                        placeholder="e.g. 2315001 or 123"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      />
                    </div>

                    <div>
                      <label htmlFor="urn" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Univ. Roll No. (URN) - Optional <span className="text-xs font-normal text-purple-600 dark:text-purple-400">(Enter 123 if not assigned yet)</span>
                      </label>
                      <input
                        type="number"
                        id="urn"
                        name="urn"
                        value={formData.urn}
                        onChange={handleChange}
                        placeholder="e.g. 2303001 or 123"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="stream" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Stream
                      </label>
                      <select
                        id="stream"
                        name="stream"
                        value={formData.stream}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      >
                        <option value="">Stream</option>
                        {['IT', 'CSE', 'RAI', 'ECE', 'CE', 'EE', 'ME', 'BBA', 'BCA'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="year" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Year
                      </label>
                      <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      >
                        <option value="">Year</option>
                        <option value="1">1st</option>
                        <option value="2">2nd</option>
                        <option value="3">3rd</option>
                        <option value="4">4th</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="section" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                        Section
                      </label>
                      <input
                        type="text"
                        id="section"
                        name="section"
                        placeholder="e.g. A"
                        value={formData.section}
                        onChange={handleChange}
                        maxLength={1}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all uppercase"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      />
                    </div>
                  </div>
                </>
              )}

              {isTeamEvent && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="teamName" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                      Team Name
                    </label>
                    <input
                      type="text"
                      id="teamName"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Enter your team name"
                    />
                  </div>

                  {teamParticipants.map((participant, index) => (
                    <div key={participant.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50/70 dark:bg-gray-900/50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          Participant {index + 1}
                        </h3>
                        {teamParticipants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTeamParticipant(participant.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                            Name
                          </label>
                          <input
                            type="text"
                            value={participant.name}
                            onChange={(e) => handleTeamParticipantChange(participant.id, 'name', e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                            Email
                          </label>
                          <input
                            type="email"
                            value={participant.email}
                            onChange={(e) => handleTeamParticipantChange(participant.id, 'email', e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={participant.phone}
                            onChange={(e) => handleTeamParticipantChange(participant.id, 'phone', e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                            CRN (optional)
                          </label>
                          <input
                            type="number"
                            value={participant.crn}
                            onChange={(e) => handleTeamParticipantChange(participant.id, 'crn', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                            Stream
                          </label>
                          <select
                            value={participant.stream}
                            onChange={(e) => handleTeamParticipantChange(participant.id, 'stream', e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          >
                            <option value="">Stream</option>
                            {['IT', 'CSE', 'RAI', 'ECE', 'CE', 'EE', 'ME', 'BBA', 'BCA'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                            Year
                          </label>
                          <select
                            value={participant.year}
                            onChange={(e) => handleTeamParticipantChange(participant.id, 'year', e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          >
                            <option value="">Year</option>
                            <option value="1">1st</option>
                            <option value="2">2nd</option>
                            <option value="3">3rd</option>
                            <option value="4">4th</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                            Section
                          </label>
                          <input
                            type="text"
                            value={participant.section}
                            onChange={(e) => handleTeamParticipantChange(participant.id, 'section', e.target.value)}
                            maxLength={1}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all uppercase"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                            URN (optional)
                          </label>
                          <input
                            type="number"
                            value={participant.urn}
                            onChange={(e) => handleTeamParticipantChange(participant.id, 'urn', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addTeamParticipant}
                    disabled={!canAddParticipant}
                    className="inline-flex items-center gap-2 rounded-xl border border-dashed border-purple-300 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                  >
                    <Plus className="h-4 w-4" />
                    Add Participant
                  </button>
                </div>
              )}

              <div>
                <label htmlFor="event" className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}>
                  Select Event
                </label>
                <select
                  id="event"
                  name="event_id"
                  value={formData.event_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                >
                  <option value="">{loading ? 'Loading events...' : 'Choose an event'}</option>
                  {eventsList.map((ev) => (
                    <option key={ev.event_id} value={ev.event_id}>
                      {ev.event_name}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || isSubmitting}
                className={`w-full px-8 py-4 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 ${loading || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600 }}
              >
                {loading || isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  'Register Now'
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {isSubmitted && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-12 max-w-md w-[92vw] text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-3xl text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Registration Successful!
            </h3>
            <p className="text-gray-600 dark:text-gray-300" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              We've sent a confirmation email. See you at the event!
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
