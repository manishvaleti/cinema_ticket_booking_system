import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom'; // Import useParams hook

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
    const [movie, setMovie] = useState(null);
    const location = useLocation(); // Get current location
    const movieId = location.pathname.split('/').pop(); // Extract movieId from URL path
  
    useEffect(() => {
      async function fetchMovieDetails() {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/movies/${movieId}/`);
          setMovie(response.data);
        } catch (error) {
          console.error('Error fetching movie details:', error);
        }
      }
      if (movieId) { // Make sure movieId is not null or undefined
        fetchMovieDetails();
      }
    }, [movieId]); // Fetch movie details when movieId changes
  
    if (!movie) {
      return <div>Loading...</div>;
    }
  
    // Extract YouTube video ID from the trailer URL
    const videoId = extractYouTubeVideoId(movie.trailer_url);
  
    return (
      <div>
        <h2>{movie.title}</h2>
        <p><strong>Description:</strong> {movie.description}</p>
        <p><strong>Release Date:</strong> {movie.release_date}</p>
        <p><strong>Duration:</strong> {movie.duration} minutes</p>
        <p><strong>Genre:</strong> {movie.genre}</p>
        <img height="315px" width="560px" src={`http://127.0.0.1:8000${movie.image}`} alt="Movie Poster" /><br />
        <div>
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        {/* Add more movie details as needed */}
      </div>
    );
  }

export default MovieDetails;
