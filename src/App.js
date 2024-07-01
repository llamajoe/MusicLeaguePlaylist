import React, { useState, useEffect }  from 'react';
import axios from 'axios';
import './App.css'

const accessToken = 'BQBSOBgWL2jCWF18MI9rSdZcluQ1tDqQnYo9XWER_y4lcq8EGlvqKdP_7diLluFEvH_oaACMmB2JOj-y8Uuj1aPjjZwGxaEDaj0p8Z6CgHFfQQdg-RTL6f_yNuUWsf7A7vCc6q4QMrV5p25_FtrvwaLanZ6FJa-HxxlPzCDzemvg38fwbjJx2VGoGY116mbmXb1XoeQ2zuiGdSEJqgQMzXBK_d7Qiqv4XZau55-zCing49HhdkI5tByMEjwLWCrgnOE'; // Get this from your server or directly if it’s public
const playlistId = '08r1zZNMsVQ1QexBA9rquq'; // Replace with your Spotify playlist ID

const App = () => {
  const [tracks, setTracks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllTracks = async (url, allTracks = []) => {
      try {
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const newTracks = response.data.tracks.items;
        const combinedTracks = [...allTracks, ...newTracks];

        if (response.data.tracks.next) {
          await fetchAllTracks(response.data.tracks.next, combinedTracks);
        } else {
          setTracks(combinedTracks);
        }
      } catch (error) {
        console.error('Error fetching playlist', error);
      }
    };

    fetchAllTracks(`https://api.spotify.com/v1/playlists/${playlistId}?limit=100`);
  }, []);

  const filteredTracks = tracks.filter(item =>
    item.track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.track.artists.some(artist => artist.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container">
      <h1>My Spotify Playlist</h1>
      <div>Total songs: {tracks.length}</div>
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