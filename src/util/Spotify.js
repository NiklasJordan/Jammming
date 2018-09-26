let userAccessToken;
let expiresIn;

const clientID = '951fbf04329549b7951bf994fe645f6f';
const redirectURI = 'http://localhost:3000/';

const Spotify = {

  getAccessToken() {
    if (userAccessToken) {
      return userAccessToken;
    }
    else {
      const urlAccessToken = window.location.href.match(/access_token=([^&]*)/);
      const urlExpiresIn = window.location.href.match(/expires_in=([^&]*)/);

      if (urlAccessToken && urlExpiresIn) {
        userAccessToken = urlAccessToken[1];
        expiresIn = urlExpiresIn[1];

        window.setTimeout(() => userAccessToken = '', expiresIn * 1000);
        window.history.pushState(`Access Token`, null, '/');

        return userAccessToken;
      }
      else {
        window.location.replace(`https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`);
      }
    }
  },

  async search(term) {
    const accessToken = Spotify.getAccessToken();

    try {
      const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,
        {headers: {Authorization: `Bearer ${accessToken}`}});
      if (response.ok) {
        const jsonResponse = await response.json();

        if (jsonResponse.tracks) {
          return jsonResponse.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
          }));
        }
        else {
          return [];
        }
      }
      else {
        throw new Error (`Something went wrong, please try again.`);
      }
    }
    catch(error) {
      console.log(error);
    }
  },

  async savePlaylist(playlistName, trackURIs) {
    const accessToken = Spotify.getAccessToken();
    const headers = {Authorization: `Bearer ${accessToken}`};
    let userID;

    try {
      if (playlistName && trackURIs) {
      const response = await fetch(`https://api.spotify.com/v1/me`,
      {headers: headers});

        if (response.ok) {
          const jsonResponse = await response.json();
          userID = jsonResponse.id;

          if (userID) {
            const playlist = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
              headers: headers,
              method: 'POST',
              body: JSON.stringify({ name: playlistName }),
            });

            if (playlist.ok) {
              const jsonPlaylist = await playlist.json();
              const playlistID = jsonPlaylist.id;

              if (playlistID) {
                await fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
                  headers: headers,
                  method: 'POST',
                  body: JSON.stringify({ uris: trackURIs }),
                });
              }
            }
          }
        }
      }
      else {
        return;
      }
    }
    catch(error) {
      return;
    }
  }
}

export default Spotify;
