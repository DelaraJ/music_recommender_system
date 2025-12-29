// App-level API wrapper. The rest of the app imports from here.
// To switch to a real backend, replace inside this file to call your connect API.
import * as mock from "../api/mockApi.js";

export const api = {
  register: mock.register,
  login: mock.login,
  getSongs: mock.getSongs,
  getPlaylistsByUser: mock.getPlaylistsByUser,
  createPlaylist: mock.createPlaylist,
  addSongToPlaylist: mock.addSongToPlaylist,
  toggleLikeSong: mock.toggleLikeSong,
};