import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
// import Slider from 'react-slick';
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Trigger the initial fetch when the component mounts.
    fetchMovies();
  }, []);

  const fetchMovies = useCallback( async () => {
    try {
      // Fetch movies with potential filters applied.
      // It's essential your backend endpoint supports these query parameters.
      // If not, you may need to adjust your backend to support filtering or
      // handle filtering client-side after fetching all movies.
      const response = await axios.get('http://127.0.0.1:8000/', {
        params: {
          genre: selectedGenre,
          search: searchTerm
        }
      });
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  },[selectedGenre, searchTerm]);

  useEffect(() => {
    // This effect ensures that a fetch is performed whenever
    // the selectedGenre or searchTerm changes.
    fetchMovies();
  },[fetchMovies] );

  const handleGenreChange = (event) => {
    setSelectedGenre(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Split movies into Now Showing and Upcoming based on their release dates
  const currentDate = new Date();
  const nowShowing = movies.filter(movie => new Date(movie.release_date) <= currentDate);
  const upcoming = movies.filter(movie => new Date(movie.release_date) > currentDate);

  // const sliderSettings = {
  //   dots: true,
  //   infinite: false,
  //   speed: 500,
  //   slidesToShow: 6,
  //   slidesToScroll: 4,
  //   responsive: [
  //     { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 3 }},
  //     { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2 }},
  //     { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 }},
  //   ],
  // };

  // Helper function to render movie cards
  const renderMovies = (moviesList) => (
    moviesList.length > 0 ? (
      
      // <div className='movie-container'>
          
      //     {moviesList.map(movie => (
      //       <a href={`/movies/${movie.id}`} className='movie-card' key={movie.id} style={{ backgroundImage: `url(http://127.0.0.1:8000${movie.image})` }} data-title={movie.title}>
      //       <div className='movie-card' style={{ width: '150px', height: '200px', backgroundColor: 'gray', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}
      //       key={movie.id}>
      //       <img height="50px" width="50px" src={`http://127.0.0.1:8000${movie.image}`} alt="Movie Poster" /><br />
      //     </div> 
      //     </a>
      //     ))}
      //   </div>
      <div className='movie-container' style={{ display: 'flex', flexWrap: 'wrap' }}>
  {moviesList.map(movie => (
    <a href={`/movies/${movie.id}`} className='movie-card' key={movie.id} style={{ 
      width: '90px', 
      height: '300px', 
      marginBottom: '20px', // Adjust spacing between movie cards
      flex: '0 0 calc(16.666% - 20px)', // Adjust card width and add spacing
      position: 'relative',
      marginLeft: '45px', // Adjust spacing between movie cards
      backgroundImage: `url(http://127.0.0.1:8000${movie.image})`
    }} data-title={movie.title}>
      <div className='movie-card' style={{ 
        width: '100%', 
        height: '100%', 
        backgroundColor: 'gray', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        color: 'white',
        backgroundImage: `url(http://127.0.0.1:8000${movie.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} >
        {/* {movie.title} */}
      </div>
    </a>
  ))}
</div>

    ) : (
      <p style={{color:'white','margin-left':'25px'}}>No movies available.</p>
    )
  );
  // const renderMoviesWithSlider = (moviesList) => (
  //   moviesList.length > 0 ? (
  //     <Slider {...sliderSettings}>
  //       {moviesList.map(movie => (
  //         <div key={movie.id} className='movie-slide'>
  //           <a href={`/movies/${movie.id}`} className='movie-card' data-title={movie.title}>
  //             <div className='movie-card' style={{ backgroundImage: `url(http://127.0.0.1:8000${movie.image})`, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
  //               <img src={`http://127.0.0.1:8000${movie.image}`} alt="Movie Poster" style={{ maxHeight: '200px' }} />
  //             </div>
  //           </a>
  //         </div>
  //       ))}
  //     </Slider>
  //   ) : (
  //     <p style={{color: 'white', marginLeft: '25px'}}>No movies available.</p>
  //   )
  // );
  return (
    <div>
      <Navbar />
      <div className="filter-section" style={{ textAlign: 'right', paddingTop:'55px'}}>
        <select onChange={handleGenreChange} value={selectedGenre}>
          <option value="all">All Genres</option>
          <option value="action">Action</option>
          <option value="comedy">Comedy</option>
          <option value="drama">Drama</option>
          <option value="horror">Horror</option>
          <option value="romance">Romance</option>
          <option value="sci-fi">Sci-Fi</option>
          {/* Add more genres as needed */}
        </select>
        <input
          type="text"
          onChange={handleSearchChange}
          value={searchTerm}
          placeholder="Search by movie title"
          style={{ marginLeft: '10px' }}
        />
      </div>
      <div className="movies-section">
      <h2 style={{color:'white','margin-left':'25px', fontSize: '30px'}}>Now Showing</h2>
      <div className='carousel-wrapper'>
        {renderMovies(nowShowing)}
        </div>

        <h2 style={{color:'white','margin-left':'25px', fontSize: '30px'}}>Upcoming Movies</h2>
        <div className='carousel-wrapper'>
        {renderMovies(upcoming)}
        </div>
      </div>
    </div>
  );
}

export default MovieList;
