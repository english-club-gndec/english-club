const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const memberService = {
  // GET /api/members/:user_id/getAllMembers
  getAllMembers: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/members/${userId}/getAllMembers`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error ${response.status}: ${error.error || 'Failed to fetch members'}`);
    }
    return response.json();
  },

  // POST /api/members/:user_id/createMember
  createMember: async (userId: string, memberData: any) => {
    const response = await fetch(`${API_BASE_URL}/members/${userId}/createMember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error ${response.status}: ${error.error || 'Failed to create member'}`);
    }
    return response.json();
  },

  // PATCH /api/members/:user_id/:member_id/updateMemberById
  updateMember: async (userId: string, memberId: string, memberData: any) => {
    const response = await fetch(`${API_BASE_URL}/members/${userId}/${memberId}/updateMemberById`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error ${response.status}: ${error.error || 'Failed to update member'}`);
    }
    return response.json();
  },

  // DELETE /api/members/:user_id/deleteMembersById
  deleteMembers: async (userId: string, memberIds: string[]) => {
    const response = await fetch(`${API_BASE_URL}/members/${userId}/deleteMembersById`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_ids: memberIds })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error ${response.status}: ${error.error || 'Failed to delete members'}`);
    }
    return response.json();
  }
};
