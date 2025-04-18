// src/pages/_app.jsx
import '../styles/globals.css';
import '../styles/scrabble.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;