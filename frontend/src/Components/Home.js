import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleMoreInfo = async (movieId) => {
    try {
      navigate(`/movies/${movieId}`); // Redirect to movie details page
    } catch (error) {
      console.error('Error redirecting to movie details page:', error);
    }
  };

  return (
    <div>
      <Navbar></Navbar>
      <div  className="home">
      <h2>Filter by Genre</h2>
      <select onChange={handleGenreFilter} value={selectedGenre}>
        <option value="all">All Genres</option>
        <option value="action">Action</option>
        <option value="comedy">Comedy</option>
        <option value="drama">Drama</option>
        <option value="horror">Horror</option>
        <option value="romance">Romance</option>
        <option value="science fiction">Science Fiction</option>
      </select>

      <h2>Search</h2>
      <input type="text" onChange={handleSearch} value={searchTerm} placeholder="Search by movie title" />

      <h2>Now Showing</h2>
      {nowShowing.length > 0 ? (
        <div className='movie-container'>
          {nowShowing.map(movie => (
            <a href={`/movies/${movie.id}`} className='movie-card' key={movie.id} style={{ backgroundImage: `url(http://127.0.0.1:8000${movie.image})` }} data-title={movie.title}>
            <div className='movie-card' style={{ width: '150px', height: '200px', backgroundColor: 'gray', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}
            key={movie.id}>
            {/* <strong>Title:</strong> {movie.title}<br />
            <strong>Description:</strong> {movie.description}<br />
            <strong>Release Date:</strong> {movie.release_date}<br />
            <strong>Duration:</strong> {movie.duration} minutes<br />
            <strong>Genre:</strong> {movie.genre}<br />
            <strong>Trailer URL:</strong> <a href={movie.trailer_url}>{movie.trailer_url}</a><br /> */}
            <img height="50px" width="50px" src={`http://127.0.0.1:8000${movie.image}`} alt="Movie Poster" /><br />
            {/* <button onClick={() => handleMoreInfo(movie.id)}>Know More </button> */}
          </div> 
          </a>
          ))}
        </div>
      ) : (
        <p>No movies available</p>
      )}

      <h2>Upcoming Movies</h2>
      {upcoming.length > 0 ? (
        <div>
          {upcoming.map(movie => (
            <a href={`/movies/${movie.id}`} className='movie-card' key={movie.id} style={{ backgroundImage: `url(http://127.0.0.1:8000${movie.image})` }} data-title={movie.title}>
            <div  className='movie-card'  style={{ width: '150px', height: '200px', backgroundColor: 'gray', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}
             key={movie.id}>
            {/* <strong>Title:</strong> {movie.title}<br />
            <strong>Description:</strong> {movie.description}<br />
            <strong>Release Date:</strong> {movie.release_date}<br />
            <strong>Duration:</strong> {movie.duration} minutes<br />
            <strong>Genre:</strong> {movie.genre}<br />
            <strong>Trailer URL:</strong> <a href={movie.trailer_url}>{movie.trailer_url}</a><br /> */}
            <img height="50px" width="50px" src={`http://127.0.0.1:8000${movie.image}`} alt="Movie Poster" /><br />
            {/* <button onClick={() => handleMoreInfo(movie.id)}>Know More </button> */}
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