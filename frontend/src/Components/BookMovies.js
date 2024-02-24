import React, { useState } from 'react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

function BookMovies() {
  // State variables to track user selections
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTicketAge, setSelectedTicketAge] = useState(null);
  const navigate = useNavigate();

  function MovieSelector({ onSelectMovie }) {
    const [movies] = useState(['Movie 1', 'Movie 2', 'Movie 3']); // Sample movie list
  
    return (
      <div>
        <select onChange={(e) => onSelectMovie(e.target.value)}>
          <option value="">Select a movie</option>
          {movies.map((movie, index) => (
            <option key={index} value={movie}>
              {movie}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function SeatSelector({ onSelectSeat }) {
    const [selectedSeat, setSelectedSeat] = useState('');
  
    const handleSeatSelection = (e) => {
      setSelectedSeat(e.target.value);
      onSelectSeat(e.target.value);
    };
  
    return (
      <div>
        <select value={selectedSeat} onChange={handleSeatSelection}>
          <option value="">Select a seat</option>
          
        </select>
      </div>
    );
  }

  function DateSelector({ onSelectDate }) {
    const [selectedDate, setSelectedDate] = useState('');
  
    const handleDateSelection = (e) => {
      setSelectedDate(e.target.value);
      onSelectDate(e.target.value);
    };
  
    return (
      <div>
        <input type="date" value={selectedDate} onChange={handleDateSelection} />
      </div>
    );
  }

  function TicketAgeSelector({ onSelectTicketAge }) {
    const [ticketAge, setTicketAge] = useState('');
  
    const handleTicketAgeSelection = (e) => {
      setTicketAge(e.target.value);
      onSelectTicketAge(e.target.value);
    };
  
    return (
      <div>
        <select value={ticketAge} onChange={handleTicketAgeSelection}>
          <option value="">Select ticket age</option>
          <option value="adult">Adult</option>
          <option value="child">Child</option>
          <option value="senior">Senior</option>
        </select>
      </div>
    );
  }
  

  // Function to handle booking confirmation
  const handleBookingConfirmation = () => {
    // Perform booking confirmation logic here
    console.log("Booking confirmed:", selectedMovie, selectedSeat, selectedDate, selectedTicketAge);
    navigate('/OrderSummary');
  };

  return (
    <>
    <Navbar/>
    
    <div className='book-moviesform'>
    <h1 className='book-heading'>Book Movies</h1>
      <div>
        <h3>Select Movie</h3>
        <MovieSelector/>
      </div>
      <div>
        <h3>Select Seat</h3>
        <SeatSelector/>
      </div>
      <div>
        <h3>Select Date</h3>
        <DateSelector/>
      </div>
      <div>
        <h3>Select Ticket Age</h3>
        <TicketAgeSelector/>
      </div>
      <button className="confirm-btn" onClick={handleBookingConfirmation}>Confirm Booking</button>
    </div> 
    </>
  );
}

export default BookMovies;
