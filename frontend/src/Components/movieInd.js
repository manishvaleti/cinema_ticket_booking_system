import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom'; // Import useParams hook
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
function extractYouTubeVideoId(url) {
    // Regular expression to match YouTube video IDs in various URL formats
    const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
    const match = url.match(regExp); // Match the URL against the regular expression
  
    if (match) {
      return match[1]; // Return the captured video ID
    } else {
      console.error('Invalid YouTube URL:', url);
      return null; // Return null if the URL is not valid
    }
  }
  

  function MovieDetails() {
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const location = useLocation();
    const movieId = location.pathname.split('/').pop();
    const { isLoggedIn } = useAuth();
    useEffect(() => {
      async function fetchMovieDetails() {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/movies/${movieId}/`);
          setMovie(response.data.movie);
          setShows(response.data.shows);
        } catch (error) {
          console.error('Error fetching movie details:', error);
        }
      }
      if (movieId) {
        fetchMovieDetails();
      }
    }, [movieId]);
  
    if (!movie) {
      return <div>Loading...</div>;
    }
  
    const videoId = movie.trailer_url ? extractYouTubeVideoId(movie.trailer_url) : null;
  
    
    const groupedShows = shows.reduce((acc, show) => {
      const date = show.start_time.split('T')[0];
      const time = show.start_time.split('T')[1].slice(0, -4); // Remove seconds
      const id = show.id; // Get the show ID
      const today = new Date().toISOString().split('T')[0]; // Get today's date
      
      if (date >= today) {
        acc[date] = acc[date] || [];
        acc[date].push({ time, id }); // Store both time and ID
      }
      
      return acc;
    }, {});
    
    const formatTime = (timeString) => {
      const [hours, minutes] = timeString.split(':');
      const today = new Date();
      today.setHours(hours);
      today.setMinutes(minutes);
      return today.toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
      });
  };

    const handleShowSelection = (showId) => {
      navigate(`/SeatMap/${showId}`);
    };
  
    return (
      <>
        <Navbar />
        <div className="movie-details">
          <div className="top-container">
            <h2>{movie.title}</h2>
          </div>
          <div className="details-container">
            <div className="image-container">
              <img height="315px" width="400px" src={`http://127.0.0.1:8000${movie.image}`} alt="Movie Poster" /><br />
            </div>
            <div className="des-container">
              <p><strong>Description:</strong> {movie.description}</p>
              <p><strong>Release Date:</strong> {movie.release_date}</p>
              <p><strong>Duration:</strong> {movie.duration} minutes</p>
              <p><strong>Genre:</strong> {movie.genre}</p>
            </div>
          </div>
          <div>
            {videoId && (
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
          {isLoggedIn && (
          <div className="show-details">
          <h3>Show Details</h3>
          {Object.entries(groupedShows).map(([date, timings]) => (
            <div key={date}>
              <p><strong>Date:</strong> {date}</p>
              <div>
                {timings.map(({time,id}, index) => (
                  <button key={index} className="timing-button" onClick={() => handleShowSelection(id)}>{formatTime(time)}</button>
                ))}
              </div>
            </div>
          ))}
          {shows.length === 0 && <p>No shows yet.</p>}
          
          </div>
          )}
        </div>
      </>
    );
  }
  

export default MovieDetails;
