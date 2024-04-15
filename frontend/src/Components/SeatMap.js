

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // if you're using axios
import Navbar from './Navbar';
import { useParams, useNavigate } from 'react-router-dom';

const seatsPerRow = 20;

const SeatMap = () => {
  const navigate = useNavigate();
  const { showId } = useParams();
  const [selectedSeats, setSelectedSeats] = useState(new Set());
  const [bookedSeats, setBookedSeats] = useState(new Set());
  const [totalSeats, setTotalSeats] = useState(0); // If this can change, it should also be fetched

  const rowLetters = Array.from({ length: Math.ceil(totalSeats / seatsPerRow) }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  useEffect(() => {
    // Replace the URL with your actual endpoint that returns the booked seats
    const fetchBookedSeats = async () => {
      try {
        const capacityResponse = await axios.get(`http://127.0.0.1:8000/shows/${showId}/capacity/`);
        setTotalSeats(capacityResponse.data.capacity);
        const response = await axios.get(`http://127.0.0.1:8000/seat-booking/${showId}/`);
        const bookedSeatsData = new Set(response.data.map(seat => seat.seatNo));
        setBookedSeats(bookedSeatsData);
      } catch (error) {
        console.error('Error fetching booked seats:', error);
        // Handle error, possibly setting an error state to display in the UI
      }
    };

    fetchBookedSeats();
  }, [showId]); // If `showId` can change, it should be in the dependency array

  const toggleSeatSelection = (seatId) => {
    if (bookedSeats.has(seatId)) {
      // Don't allow selection if the seat is booked
      return;
    }

    setSelectedSeats(prevSelectedSeats => {
      const updatedSelection = new Set(prevSelectedSeats);
      if (updatedSelection.has(seatId)) {
        updatedSelection.delete(seatId);
      } else {
        updatedSelection.add(seatId);
      }
      return updatedSelection;
    });
  };

  const renderSeatMap = () => {
    return rowLetters.map((row) => (
      <div key={row} className="row">
        {Array.from({ length: seatsPerRow }, (_, index) => {
          const seatNumber = index + 1;
          const seatId = `${row}${seatNumber}`;
          const isBooked = bookedSeats.has(seatId);
          return (
            <button
              key={seatId}
              className={`seat ${isBooked ? 'booked' : ''} ${selectedSeats.has(seatId) ? 'selected' : ''}`}
              onClick={() => toggleSeatSelection(seatId)}
              disabled={isBooked} // Disable the button if the seat is booked
              aria-label={`Seat ${seatId}`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    ));
  };

  const handleProceedClick = () => {
    navigate(`/OrderSummary`, {
      state: { showId, selectedSeats: Array.from(selectedSeats) }, // Pass showId and selectedSeats as state
    });
  };

  return (
    <>
      <Navbar />
      <div className="seat-map">
        <div className="screen">All eyes this way please!</div>
        {renderSeatMap()}
        <div className="seat-legend">
          <div className="legend-item">
            <span className="seat sample available"></span>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="seat sample booked"></span>
            <span>Booked</span>
          </div>
          <div className="legend-item">
            <span className="seat sample selected"></span>
            <span>Selected</span>
          </div>
        </div>
        <div className="navigation">
          <button onClick={handleProceedClick} style={{ backgroundColor: '#fff', color: '#333', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }} className="next-page-button">
            Proceed to Next Page
          </button>
        </div>
      </div>
    </>
  );
};

export default SeatMap;

