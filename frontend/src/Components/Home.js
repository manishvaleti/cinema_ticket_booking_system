import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
function MovieList() {
  const [movies, setMovies] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  

  

  
  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/');
        setMovies(response.data);
        categorizeMovies(response.data); // Categorize movies into "Now Showing" and "Upcoming"
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    }
    fetchMovies();
  }, []);

  useEffect(() => {
    categorizeMovies(movies);
  }, [movies]);

  useEffect(() => {
    filterMovies();
  }, [selectedGenre, searchTerm,movies]);

  const categorizeMovies = (movies) => {
    const currentDate = new Date();
    const nowShowingMovies = movies.filter(movie => new Date(movie.release_date) <= currentDate);
    const upcomingMovies = movies.filter(movie => new Date(movie.release_date) > currentDate);
    setNowShowing(nowShowingMovies);
    setUpcoming(upcomingMovies);
  };

  const filterMovies = () => {
    let filteredNowShowing = [...movies];
    let filteredUpcoming = [...movies];
    const currentDate = new Date();
  
    if (selectedGenre !== 'all') {
      filteredNowShowing = nowShowing.filter(movie => 
        movie.genre.toLowerCase().includes(selectedGenre) && 
        new Date(movie.release_date) <= currentDate
      );
      filteredUpcoming = upcoming.filter(movie => 
        movie.genre.toLowerCase().includes(selectedGenre) && 
        new Date(movie.release_date) > currentDate
      );
    } else {
      filteredNowShowing = nowShowing.filter(movie => 
        new Date(movie.release_date) <= currentDate
      );
      filteredUpcoming = upcoming.filter(movie => 
        new Date(movie.release_date) > currentDate
      );
    }
  
    if (searchTerm) {
      filteredNowShowing = filteredNowShowing.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm) && 
        new Date(movie.release_date) <= currentDate
      );
      filteredUpcoming = filteredUpcoming.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm) && 
        new Date(movie.release_date) > currentDate
      );
    }
  
    setNowShowing(filteredNowShowing);
    setUpcoming(filteredUpcoming);
  };
  

  const handleGenreFilter = (event) => {
    setSelectedGenre(event.target.value.toLowerCase());
  };

  const handleSearch = async (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
  
    // If the search term becomes empty, refetch movies from the database
    if (value === '') {
      try {
        const response = await axios.get('http://127.0.0.1:8000/');
        setMovies(response.data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    }
  };
  


  return (
    <div >
      
      <Navbar />
      <div className="home" >
      <div style={{ textAlign: 'right' }}>
      <select onChange={handleGenreFilter} value={selectedGenre}>
        <option value="all">All Genres</option>
        <option value="action">Action</option>
        <option value="comedy">Comedy</option>
        <option value="drama">Drama</option>
        <option value="horror">Horror</option>
        <option value="romance">Romance</option>
        <option value="science fiction">Science Fiction</option>
      </select>

      {/* <input style={{ textAlign: 'center' }} type="text" onChange={handleSearch} value={searchTerm} placeholder="Search by movie title" /> */}
      
      <input style={{ textAlign: 'center' }} type="text" onChange={handleSearch} value={searchTerm} placeholder="Search by movie title" />
      </div>
      
      <h2>Now Showing</h2>
      {nowShowing.length > 0 ? (
        
        <div className='movie-container'>
          
          {nowShowing.map(movie => (
            <a href={`/movies/${movie.id}`} className='movie-card' key={movie.id} style={{ backgroundImage: `url(http://127.0.0.1:8000${movie.image})` }} data-title={movie.title}>
            <div className='movie-card' style={{ width: '150px', height: '200px', backgroundColor: 'gray', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}
            key={movie.id}>
            <img height="50px" width="50px" src={`http://127.0.0.1:8000${movie.image}`} alt="Movie Poster" /><br />
          </div> 
          </a>
          ))}
        </div>
      
      ) : (
        <p>No movies available</p>
      )}

      <h2>Upcoming Movies</h2>
      {upcoming.length > 0 ? (
        <div className='movie-container'>
          {upcoming.map(movie => (
            <a href={`/movies/${movie.id}`} className='movie-card' key={movie.id} style={{ backgroundImage: `url(http://127.0.0.1:8000${movie.image})` }} data-title={movie.title}>
            <div  className='movie-card'  style={{ width: '150px', height: '200px', backgroundColor: 'gray', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}
             key={movie.id}>
            <img height="50px" width="50px" src={`http://127.0.0.1:8000${movie.image}`} alt="Movie Poster" /><br />

          </div> 
          </a>
          ))}
      </div>
      ) : (
        <p>No movies available</p>
      )}
      </div>
    </div>
    
  );
}

export default MovieList;