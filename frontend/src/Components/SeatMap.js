import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

function SeatMap() {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const handleSeatClick = (seatIndex) => {
    const newSelectedSeats = [...selectedSeats];
    const seatIsSelected = newSelectedSeats.includes(seatIndex);

    if (seatIsSelected) {
      const index = newSelectedSeats.indexOf(seatIndex);
      newSelectedSeats.splice(index, 1);
    } else {
      newSelectedSeats.push(seatIndex);
    }

    setSelectedSeats(newSelectedSeats);
  };

  const renderSeat = (seatIndex) => {
    const isSelected = selectedSeats.includes(seatIndex);

    return (
      <div
        className={`seat ${isSelected ? 'selected' : ''}`}
        onClick={() => handleSeatClick(seatIndex)}
      ></div>
    );
  };

  const renderRow = (rowIndex) => {
    const seats = [];
    for (let i = 0; i < 6; i++) {
      const seatIndex = rowIndex * 6 + i;
      seats.push(renderSeat(seatIndex));
    }
    return <div className="row">{seats}</div>;
  };

  const renderSeatMap = () => {
    const rows = [];
    for (let i = 0; i < 5; i++) {
      rows.push(renderRow(i));
    }
    return <div className="seat-map">{rows}</div>;
  };

  return (
    <div className="seat-map-container">
      <h1>Seat Map</h1>
      {renderSeatMap()}
      <h2>Selected Seats: {selectedSeats.length}</h2>
  
      <Link to="/OrderSummaryPage">Continue</Link>
   

    </div>
  );
}

export default SeatMap;