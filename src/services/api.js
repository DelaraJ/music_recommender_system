// App-level API wrapper. The rest of the app imports from here.
// Switch between mock and real API here
import * as real from "../api/realApi.js";

export const api = {
  register: real.register,
  login: real.login,
  getSongs: real.getSongs,
  getSongById: real.getSongById,
  searchTracks: real.searchTracks,
  getPlaylistsByUser: real.getPlaylistsByUser,
  getPlaylistById: real.getPlaylistById,
  getPlaylistTracks: real.getPlaylistTracks,
  createPlaylist: real.createPlaylist,
  addSongToPlaylist: real.addSongToPlaylist,
  removeSongFromPlaylist: real.removeSongFromPlaylist,
  deletePlaylist: real.deletePlaylist,
  sendInteraction: real.sendInteraction,
};