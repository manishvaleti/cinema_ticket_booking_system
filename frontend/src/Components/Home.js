import React from 'react';
import logo from '/Users/manishvaleti/Desktop/try2/frontend/src/logo.svg'; // Assuming you have a logo file named logo.svg in the same directory

function Home() {
  return (
    <div className="Home">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/Components/Home.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default Home;
