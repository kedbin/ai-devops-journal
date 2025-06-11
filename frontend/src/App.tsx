import { useState, useEffect } from 'react';
import { auth, signInWithGoogle } from './firebase';
import type { User } from './firebase';
import './App.css'; // Or your preferred styling
import { ImageCapture } from './ImageCapture'; // <-- IMPORT aT TOP

function App() {
  // State to hold the current user object
  const [user, setUser] = useState<User | null>(null);
  // State to hold messages from our secure backend
  const [secureMessage, setSecureMessage] = useState<string>('');
  // State for loading indicators
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State to hold any errors
  const [error, setError] = useState<string>('');

  // This effect runs once on component mount to check the user's auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);

      // If a user is logged in, try to call the secure endpoint
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const backendUrl = `${import.meta.env.VITE_BACKEND_API_URL}/secure-data`;

          const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            // If the server responds with an error (e.g., 403), throw an error
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to fetch secure data.');
          }

          const data = await response.json();
          setSecureMessage(data.message);
          setError(''); // Clear previous errors
        } catch (err: any) {
          console.error('Error fetching secure data:', err);
          setError(err.message);
          setSecureMessage('');
        }
      } else {
        // Clear secure data if user logs out
        setSecureMessage('');
      }
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []); // The empty dependency array ensures this runs only once

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Logout failed. Please try again.");
    }
  };

  // If still loading, show a loading message
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>OCR Journal App</h1>
        {user ? (
          <div>
            <h2>Welcome, {user.displayName}!</h2>
            <p>Email: {user.email}</p>
            <button onClick={handleLogout}>Logout</button>
            <div className="secure-content">
              <h3>Backend Status:</h3>
              {secureMessage && <p style={{ color: 'lightgreen' }}>{secureMessage}</p>}
              {error && <p style={{ color: 'salmon' }}>Error: {error}</p>}
            </div>
            <hr style={{ margin: '2rem 0' }} />
            <ImageCapture />
          </div>
        ) : (
          <div>
            <p>Please log in to continue.</p>
            <button onClick={handleLogin}>Sign in with Google</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;