import { useState, useEffect } from 'react';
import { auth, signInWithGoogle } from './firebase';
import type { User } from './firebase';
import './App.css'; // Or your preferred styling
import { ImageCapture } from './ImageCapture'; // <-- IMPORT aT TOP

function App() {
  // State to hold the current user object
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

// This effect now ONLY manages the user's login state.
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((currentUser) => {
    setUser(currentUser);
    setIsLoading(false); // Stop loading once we know if user is logged in or not
  });

  // Cleanup the subscription when the component unmounts
  return () => unsubscribe();
}, []); // The empty dependency array ensures this runs only once

const handleLogin = async () => {
  try {
    await signInWithGoogle();
  } catch (err) {
    console.error("Login failed:", err);
    // We can use a simple alert for login errors or a more complex toast notification later
    alert("Login failed. Please check the console and try again.");
  }
};

const handleLogout = async () => {
  try {
    await auth.signOut();
  } catch (err) {
    console.error("Logout failed:", err);
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