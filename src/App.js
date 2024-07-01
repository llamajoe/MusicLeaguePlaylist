import React, { useState, useEffect }  from 'react';
import axios from 'axios';
import './App.css'

const accessToken = 'BQAOGUsbOENnJDfJXh7OY9vvTaqq_zUTWnDnOSQzMUSN1WHMtuP5Is_dmxC-fci4ArLkTYLmYDDWoWcoORwl0Nv2ctvLwWGMscvhV-DX6J3XPcBGe9vSrvd9g5G_YieQ-XqmEpjzSEckgnQuWD1duNoUwloA_fcKmqOnbRiI_rb83yp4z7QBp89EebVD0xwluOIUW70TiQXYC25G5b-YPobF248sCbEFy_YhlwCe7rnf7Qg9ddm3T7QqykUpwG_Sjxc'; // Get this from your server or directly if it’s public
const playlistId = '08r1zZNMsVQ1QexBA9rquq'; // Replace with your Spotify playlist ID

const App = () => {
  const [tracks, setTracks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        setTracks(response.data.tracks.items);
      } catch (error) {
        console.error('Error fetching playlist', error);
      }
    };

    fetchPlaylist();
  }, []);

  const filteredTracks = tracks.filter(item =>
    item.track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.track.artists.some(artist => artist.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container">
      <h1>Music League Playlist</h1>
      <input
        type="text"
        placeholder="Search for artists or songs..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <ul className="playlist">
        {filteredTracks.map(item => (
          <li key={item.track.id} className="song">
            {item.track.name} by {item.track.artists.map(artist => artist.name).join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
