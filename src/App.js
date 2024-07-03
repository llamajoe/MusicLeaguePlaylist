import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import { clientId, clientSecret, playlistId } from './config';

const App = () => {
  const [tracks, setTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [playlistFetched, setPlaylistFetched] = useState(false);

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
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error details:', error.message);
        }
      }
    };

    fetchAccessToken();
  }, []);

  const fetchAllTracks = useCallback(async (url, allTracks = [], retries = 0) => {
    if (retries > 5) {
      console.error('Too many retries, stopping the requests.');
      setErrorMessage('Failed to fetch playlist after multiple attempts.');
      setIsFetching(false);
      return;
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const newTracks = response.data.items;
      const combinedTracks = [...allTracks, ...newTracks];

      if (response.data.next) {
        await fetchAllTracks(response.data.next, combinedTracks);
      } else {
        setTracks(combinedTracks);
        setFilteredTracks(combinedTracks);
        setIsFetching(false);
        setPlaylistFetched(true);
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 1;
        console.error(`Received 429, retrying after ${retryAfter} seconds. Retry count: ${retries + 1}`);
        setRetryCount(retries + 1);
        setTimeout(() => fetchAllTracks(url, allTracks, retries + 1), retryAfter * 1000);
        setErrorMessage(`Received 429 error. Retrying after ${retryAfter} seconds. Retry count: ${retries + 1}`);
      } else {
        console.error('Error fetching playlist', error);
        setErrorMessage('An error occurred while fetching the playlist.');
        setIsFetching(false);
      }
    }
  }, [accessToken]);

  const handleFetchTracks = () => {
    if (accessToken) {
      setIsFetching(true);
      setRetryCount(0);
      setErrorMessage('');
      fetchAllTracks(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=total%2Climit%2Cnext%2Citems%28track%28name%2C+album%28name%29%2C+artists%28name%29%29`);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    const term = event.target.value.toLowerCase();
    const filtered = tracks.filter(item =>
      item.track.name.toLowerCase().includes(term) ||
      item.track.artists.some(artist => artist.name.toLowerCase().includes(term)) ||
      item.track.album.name.toLowerCase().includes(term)
    );
    setFilteredTracks(filtered);
  };

  return (
    <div className="container">
      <h1>My Spotify Playlist</h1>
      {!playlistFetched && (
        <button onClick={handleFetchTracks} disabled={isFetching}>
          {isFetching ? 'Fetching...' : 'Fetch Playlist'}
        </button>
      )}
      {tracks.length > 0 && (
        <input
          type="text"
          placeholder="Search songs, artists, albums..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-box"
        />
      )}
      <div>Total songs: {filteredTracks.length}</div>
      {retryCount > 0 && <div>Retrying... Attempt {retryCount}</div>}
      {errorMessage && <div className="error">{errorMessage}</div>}
      {filteredTracks.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Song Title</th>
              <th>Artist</th>
              <th>Album</th>
            </tr>
          </thead>
          <tbody>
            {filteredTracks.map(item => (
              <tr key={item.track.id}>
                <td>{item.track.name}</td>
                <td>{item.track.artists.map(artist => artist.name).join(', ')}</td>
                <td>{item.track.album.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default App;
