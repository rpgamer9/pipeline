import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Welcome to My Awesome Website</h1>
        <p>
          This is a demo page that will be automatically screenshotted!
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div style={{ marginTop: '20px', color: '#61dafb' }}>
          Last screenshot taken: {new Date().toLocaleDateString()}
        </div>
      </header>
    </div>
  );
}

export default App;
