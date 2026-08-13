import api from '../api/axios';

export const getTournaments = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.class) params.append('class', filters.class);
  const res = await api.get(`/tournaments?${params.toString()}`);
  return res.data.tournaments;
};

export const getTournamentById = async (id) => {
  const res = await api.get(`/tournaments/${id}`);
  return res.data.tournament;
};

export const registerTournament = async (tournamentId) => {
  const res = await api.post(`/tournaments/${tournamentId}/register`);
  return res.data;
};

export const unregisterTournament = async (tournamentId) => {
  const res = await api.post(`/tournaments/${tournamentId}/unregister`);
  return res.data;
};

export const createTournament = async (data) => {
  const res = await api.post('/tournaments', data);
  return res.data.tournament;
};

export const updateTournament = async (id, data) => {
  const res = await api.put(`/tournaments/${id}`, data);
  return res.data.tournament;
};

export const deleteTournament = async (id) => {
  const res = await api.delete(`/tournaments/${id}`);
  return res.data;
};
