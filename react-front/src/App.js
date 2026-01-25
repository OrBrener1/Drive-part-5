import React, {useContext} from 'react';
import AppRouter from './router';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import SessionExpiredModal from "./components/sessionExpiredModal/SessionExpiredModal";

function AppContent() {
  const { sessionExpired, confirmSessionExpired } =
    useContext(AuthContext);

  return (
    <>
      <AppRouter />

      {sessionExpired && (
        <SessionExpiredModal
          onConfirm={confirmSessionExpired}
        />
      )}
    </>
  );
}

function App() {
  return (
     /*
      AuthProvider wraps the entire app.
      NOTE: The authentication logic inside AuthContext
      will be extended later (e.g. persistence, redirects).
    */
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
export default App;
