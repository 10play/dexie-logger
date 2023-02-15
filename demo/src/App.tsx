import React from 'react';
import logo from './logo.svg';
import './App.css';
import { db } from './dexie';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={() => db.users.add({ id: `user_${Date.now()}`, name: `user_${Date.now()}` })}>add user</button>
      </header>
    </div>
  );
}

export default App;
