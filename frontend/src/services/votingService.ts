import { supabase } from '../lib/supabase';

export interface AwardParticipant {
  id: string;
  name: string;
  image_url?: string;
  vote_count?: number;
}

export interface AwardVote {
  id: string;
  participant_id: string;
  voter_name: string;
  device_id: string;
  created_at: string;
}

export interface AwardSettings {
  id: number;
  start_time: string | null;
  end_time: string | null;
  is_active: boolean;
}

export const votingService = {
  // Participants
  getParticipants: async () => {
    const { data, error } = await supabase
      .from('award_participants')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as AwardParticipant[];
  },

  addParticipant: async (name: string, image_url?: string) => {
    const { data, error } = await supabase
      .from('award_participants')
      .insert([{ name, image_url }])
      .select();
    
    if (error) throw error;
    return data[0] as AwardParticipant;
  },

  deleteParticipant: async (id: string) => {
    const { error } = await supabase
      .from('award_participants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Votes
  submitVote: async (participantId: string, voterName: string, deviceId: string) => {
    const { data, error } = await supabase
      .from('award_votes')
      .insert([{ 
        participant_id: participantId, 
        voter_name: voterName, 
        device_id: deviceId 
      }])
      .select();
    
    if (error) throw error;
    return data[0] as AwardVote;
  },

  checkIfVoted: async (deviceId: string) => {
    const { data, error } = await supabase
      .from('award_votes')
      .select('id')
      .eq('device_id', deviceId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'no rows returned'
    return !!data;
  },

  // Real-time vote counts
  getVoteCounts: async () => {
    const { data, error } = await supabase
      .from('award_votes')
      .select('participant_id');
    
    if (error) throw error;
    
    const counts: Record<string, number> = {};
    data.forEach(vote => {
      counts[vote.participant_id] = (counts[vote.participant_id] || 0) + 1;
    });
    
    return counts;
  },

  // Settings
  getSettings: async () => {
    const { data, error } = await supabase
      .from('award_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) throw error;
    return data as AwardSettings;
  },

  updateSettings: async (settings: Partial<AwardSettings>) => {
    const { data, error } = await supabase
      .from('award_settings')
      .update(settings)
      .eq('id', 1)
      .select();
    
    if (error) throw error;
    return data[0] as AwardSettings;
  }
};
