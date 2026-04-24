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
  },

  resetVoting: async () => {
    // 1. Get current results to archive
    const { data: participants } = await supabase
      .from('award_participants')
      .select('*');
    
    const votes = await votingService.getVoteCounts();
    
    const archiveData = {
      timestamp: new Date().toISOString(),
      results: participants?.map(p => ({
        id: p.id,
        name: p.name,
        votes: votes[p.id] || 0
      })) || [],
      total_votes: Object.values(votes).reduce((a, b) => a + b, 0)
    };

    // 2. Save to history (Assuming award_history table exists)
    const { error: archiveError } = await supabase
      .from('award_history')
      .insert([{ session_data: archiveData }]);
    
    // If table doesn't exist, we might want to log it but still proceed 
    // or stop. Given user request, we should probably expect it to exist.
    if (archiveError) {
      console.error("Archive error:", archiveError);
      throw new Error("Failed to archive session data. Please ensure 'award_history' table exists.");
    }

    // 3. Reset settings
    const { error: settingsError } = await supabase
      .from('award_settings')
      .update({
        is_active: false,
        start_time: null,
        end_time: null
      })
      .eq('id', 1);
    
    if (settingsError) throw settingsError;

    // 4. Clear all votes
    const { error: votesError } = await supabase
      .from('award_votes')
      .delete()
      .not('id', 'is', null);
    
    if (votesError) throw votesError;

    // 5. Delete all participants
    const { error: participantsError } = await supabase
      .from('award_participants')
      .delete()
      .not('id', 'is', null);
    
    if (participantsError) throw participantsError;

    return true;
  },

  getHistory: async () => {
    const { data, error } = await supabase
      .from('award_history')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
