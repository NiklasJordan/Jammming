import React from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchResults: [],
      playlistName: 'New Playlist',
      playlistTracks: [],
    };

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTrack(track) {
    if (this.state.playlistTracks.find(playlistTrack =>
      playlistTrack.id === track.id )) {
        return;
    }
    else {
      let newPlaylist = this.state.playlistTracks.slice();
      newPlaylist.push(track);
      this.setState({ playlistTracks: newPlaylist });
    }
  }

  removeTrack(track) {
    let copyPlaylist = this.state.playlistTracks.slice();
    const newPlaylist = copyPlaylist.filter(playlistTrack => track.id !== playlistTrack.id);
    this.setState({ playlistTracks: newPlaylist });
  }

  updatePlaylistName(name) {
    this.setState({ playlistName: name });
  }

  savePlaylist() {
    const trackURIs = this.state.playlistTracks.map(track => {
      return track.uri;
    });
    Spotify.savePlaylist(this.state.playlistName, trackURIs).then(() => {
      this.setState({ playlistTracks: [], playlistName: 'New Playlist' })
    });
  }

  search(term) {
    Spotify.search(term).then(results => {
      this.setState({ searchResults: results });
    })
  }

  componentDidMount() {
    Spotify.getAccessToken();
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
            <Playlist playlistName={this.state.playlistName} onNameChange={this.updatePlaylistName} playlistTracks={this.state.playlistTracks} onRemove={this.removeTrack} onSave={this.savePlaylist} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
