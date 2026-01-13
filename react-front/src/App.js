import React from 'react';
import AppRouter from './router';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
     /*
      AuthProvider wraps the entire app.
      NOTE: The authentication logic inside AuthContext
      will be extended later (e.g. persistence, redirects).
    */
    <AuthProvider>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </AuthProvider>
  );
}
export default App;
