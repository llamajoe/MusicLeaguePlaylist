import React, { useState, useEffect }  from 'react';
import axios from 'axios';
import './App.css'

const playlistId = '08r1zZNMsVQ1QexBA9rquq'; // Replace with your Spotify playlist ID

const clientId = '4c52c453c31042e9a10fb7715d09f9b3'; // Replace with your Spotify client ID
const clientSecret = '464e3bd5cf2647889a4f93b0bc7692c4'; // Replace with your Spotify client secret


const App = () => {
  const [tracks, setTracks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    const fetchAccessToken = async () => {
      const tokenUrl = 'https://accounts.spotify.com/api/token';
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
      };
      const data = 'grant_type=client_credentials';

      try {
        const response = await axios.post(tokenUrl, data, { headers });
        console.log('Access token response:', response); // Log the response
        setAccessToken(response.data.access_token);
      } catch (error) {
        console.error('Error fetching access token:', error);
        console.log('Error response:', error.response); // Log the error response
      }
    };

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

    const initialize = async () => {
      await fetchAccessToken();
      await fetchAllTracks(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`);
    };

    initialize();
  }, [accessToken]);

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