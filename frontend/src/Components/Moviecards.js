import React, { useState } from 'react';
import Navbar from './Navbar';

function MovieCards() {
  // State to manage the search query
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy movie data
  const nowPlayingMovies = [
    { id: 1, title: 'Movie 1' },
    { id: 2, title: 'Movie 2' },
    { id: 2, title: 'Movie 3' },
    { id: 2, title: 'Movie 4' },
    { id: 2, title: 'Movie 5' }
  ];

  const comingSoonMovies = [
    { id: 2, title: 'Movie 6' },
    { id: 3, title: 'Movie 7' },
    { id: 4, title: 'Movie 8' },
    { id: 2, title: 'Movie 9' },
    { id: 2, title: 'Movie 10' }
  ];

  // search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter movies based search query
  const filteredNowPlayingMovies = nowPlayingMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredComingSoonMovies = comingSoonMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );



  return (
    <div>
      <Navbar />
      <div style={{ padding: '50px' }}>
        <input
          type="text"
          placeholder = "Search movies..." 
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ padding: '10px', marginBottom: '20px' }}
        />
        <h2>Now Playing:</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {filteredNowPlayingMovies.map(movie => (
            <div key={movie.id} style={{ width: '150px', height: '200px', backgroundColor: 'gray', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
              {movie.title}
            </div>
          ))}
        </div>
        <h2>Coming Soon:</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {filteredComingSoonMovies.map(movie => (
            <div key={movie.id} style={{ width: '150px', height: '200px', backgroundColor: 'gray', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
              {movie.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MovieCards;