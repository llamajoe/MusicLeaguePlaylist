import React, { useState, useEffect }  from 'react';
import axios from 'axios';
import './App.css'

const playlistId = '08r1zZNMsVQ1QexBA9rquq'; // Replace with your Spotify playlist ID
const clientId = '4c52c453c31042e9a10fb7715d09f9b3'; // Replace with your Spotify client ID
const clientSecret = '464e3bd5cf2647889a4f93b0bc7692c4'; // Replace with your Spotify client secret

const App = () => {
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false); // State to manage fetching status

  const fetchTracks = async () => {
    setFetching(true); // Set fetching status to true

    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
    };
    const data = 'grant_type=client_credentials';

    try {
      const response = await axios.post(tokenUrl, data, { headers });
      console.log('Access token response:', response); // Log the response
      const accessToken = response.data.access_token;
      await fetchAllTracks(accessToken);
    } catch (error) {
      console.error('Error fetching access token:', error);
      console.log('Error response:', error.response); // Log the error response
      setError('Error fetching access token');
      setFetching(false); // Set fetching status to false on error
    }
  };

  const fetchAllTracks = async (accessToken) => {
    const maxAttempts = 10;
    let allTracks = [];
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;
    let attempts = 0;

    while (nextUrl && attempts < maxAttempts) {
      try {
        const response = await axios.get(nextUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.status !== 200) {
          console.error('Error fetching playlist: Invalid response status', response);
          if (response.status === 429) {
            setError('Too Many Requests - Please try again later');
          } else {
            setError(`HTTP Error: ${response.status}`);
          }
          break; // Stop fetching if response status is not 200
        }

        const newTracks = response.data.items;
        allTracks = [...allTracks, ...newTracks];
        nextUrl = response.data.next;
      } catch (error) {
        console.error('Error fetching playlist', error);
        setError('Error fetching playlist: ' + error.message);
        break; // Stop fetching on error
      }
      attempts++;
    }

    setTracks(allTracks);
    setFetching(false); // Set fetching status to false after fetching is done
  };

  // Handle button click to fetch tracks
  const handleFetchButtonClick = () => {
    fetchTracks();
  };

  return (
    <div className="container">
      <h1>My Spotify Playlist</h1>
      <button onClick={handleFetchButtonClick} disabled={fetching}>
        {fetching ? 'Fetching...' : 'Fetch Tracks'}
      </button>
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      <div>Total songs: {tracks.length}</div> {/* Display total number of tracks */}
      <ul className="playlist">
        {tracks.map(item => (
          <li key={item.track.id} className="song">
            {item.track.name} by {item.track.artists.map(artist => artist.name).join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
