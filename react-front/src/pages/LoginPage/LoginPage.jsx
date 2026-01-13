import React, { useState, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import './LoginPage.css';

function LoginPage() {
  // References to input fields (required by course guidelines)
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');

  // State for displaying error messages to the user
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // State to disable the button while login is in progress
  const [loading, setLoading] = useState(false);

  // Access authentication actions from context
  const { login } = useContext(AuthContext);

  // Used to redirect the user after successful login
  const navigate = useNavigate();

  /**
   * Handles form submission and performs login.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // Clear previous error message
    setError('');

    const email = emailValue.trim().toLowerCase();
    const password = passwordValue;

    // Basic client-side validation
    if (!isEmailValid || !isPasswordPresent) {
      setError('Please enter a valid email and password');
      return;
    }

    setLoading(true);

    // Call login function from AuthContext
    const result = await login(email, password);

    setLoading(false);

    // Handle login failure
    if (!result.ok) {
      setError(result.message || 'Login failed');
      return;
    }

    // On successful login, redirect to files page
    navigate(ROUTES.FILES, { replace: true });
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    emailValue.trim().toLowerCase()
  );
  const isPasswordPresent = passwordValue.length > 0;
  const canSubmit = isEmailValid && isPasswordPresent && !loading;

  const getStatusClass = (isValid, isFieldTouched) => {
    if (isValid) return 'is-valid';
    if (isFieldTouched) return 'is-invalid';
    return 'is-pending';
  };

  const emailTouched = touched.email || submitAttempted;
  const passwordTouched = touched.password || submitAttempted;

  return (
    <div className="auth-page login-page">
      <div className="auth-logo-corner">
        <img className="auth-logo" src="/ogs-logo.png" alt="Drive logo" />
      </div>

      <div className="login-card surface">
        <div className="login-header">
          <h2 className="login-title">Log in</h2>
          <p className="login-subtitle">
            Welcome back. Keep your files in sync.
          </p>
        </div>

        {/* Display error message if exists */}
        {error && <p className="form-error">{error}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          {/* Email input */}
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            ref={emailRef}
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            onFocus={() => setTouched((prev) => ({ ...prev, email: true }))}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          />
          <ul className="validation-list" aria-live="polite">
            <li className={`validation-item ${getStatusClass(isEmailValid, emailTouched)}`}>
              Valid email format
            </li>
          </ul>

          {/* Password input */}
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            ref={passwordRef}
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            onFocus={() => setTouched((prev) => ({ ...prev, password: true }))}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          />
          <ul className="validation-list" aria-live="polite">
            <li className={`validation-item ${getStatusClass(isPasswordPresent, passwordTouched)}`}>
              Password is required
            </li>
          </ul>

          {/* Submit button */}
          <button className="btn btn-primary login-submit" type="submit" disabled={!canSubmit}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Navigation to register page */}
        <p className="login-footer">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.REGISTER}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

