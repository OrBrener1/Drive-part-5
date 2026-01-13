import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { registerUser } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage() {
  // State for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [imageBase64, setImageBase64] = useState(null);

  // State for validation / feedback
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    displayName: false
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // useRef for file input (image upload)
  // NOTE: This will be used later to handle image selection
  const imageInputRef = useRef(null);

  // useNavigate hook for redirection
  const navigate = useNavigate();

  // Handle image selection and convert to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setImageBase64(reader.result); // Store image as Base64 string for backend submission
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleOpenImagePicker = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
      imageInputRef.current.click();
    }
  };

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedDisplayName = displayName.trim();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password)
  };
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const isConfirmValid = confirmPassword.length > 0 && password === confirmPassword;
  const isDisplayNameValid = trimmedDisplayName.length >= 2;

  const canSubmit = isEmailValid && isPasswordValid && isConfirmValid && isDisplayNameValid;

  const getStatusClass = (isValid, isFieldTouched) => {
    if (isValid) return 'is-valid';
    if (isFieldTouched) return 'is-invalid';
    return 'is-pending';
  };

  const passwordTouched = touched.password || submitAttempted;
  const emailTouched = touched.email || submitAttempted;
  const confirmTouched = touched.confirmPassword || submitAttempted;
  const displayNameTouched = touched.displayName || submitAttempted;


  // Submit handler
  const handleRegister = async () => {
    setSubmitAttempted(true);
    // Client-side validation
    if (!canSubmit) {
      setError('Please fix the highlighted fields');
      return;
    }
    // If the user chose a picture (doesn't have to), validate it's an image file type
    if (imageBase64 && !imageBase64.startsWith('data:image/')) {
      setError('Please select an image file');
      return;
    }

    setError('');

    const result = await registerUser({
      email: normalizedEmail,
      password,
      displayName: trimmedDisplayName,
      image: imageBase64
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    // On success, redirect to login page
    navigate(ROUTES.LOGIN);
  };


  return (
    <div className="auth-page register-page">
      <div className="auth-logo-corner">
        <img className="auth-logo" src="/ogs-logo.png" alt="Drive logo" />
      </div>
      <div className="register-card surface">
        <div className="register-header">
          <h2 className="register-title">Create account</h2>
          <p className="register-subtitle">
            Get started with your Drive workspace.
          </p>
        </div>

        {/* Display validation error if exists */}
        {error && <p className="form-error">{error}</p>}

        <form
          className="register-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
        >
          {/* Username input */}
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setTouched((prev) => ({ ...prev, email: true }))}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          />
          <ul className="validation-list" aria-live="polite">
            <li className={`validation-item ${getStatusClass(isEmailValid, emailTouched)}`}>
              Valid email format
            </li>
          </ul>

          {/* Display name input */}
          <input
            className="auth-input"
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onFocus={() => setTouched((prev) => ({ ...prev, displayName: true }))}
            onBlur={() => setTouched((prev) => ({ ...prev, displayName: true }))}
          />
          <ul className="validation-list" aria-live="polite">
            <li className={`validation-item ${getStatusClass(isDisplayNameValid, displayNameTouched)}`}>
              At least 2 characters
            </li>
          </ul>

          {/* Password input */}
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setTouched((prev) => ({ ...prev, password: true }))}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          />
          <ul className="validation-list" aria-live="polite">
            <li className={`validation-item ${getStatusClass(passwordChecks.minLength, passwordTouched)}`}>
              At least 8 characters
            </li>
            <li className={`validation-item ${getStatusClass(passwordChecks.hasUppercase, passwordTouched)}`}>
              At least one uppercase letter
            </li>
            <li className={`validation-item ${getStatusClass(passwordChecks.hasLowercase, passwordTouched)}`}>
              At least one lowercase letter
            </li>
            <li className={`validation-item ${getStatusClass(passwordChecks.hasDigit, passwordTouched)}`}>
              At least one number
            </li>
          </ul>

          {/* Confirm password input */}
          <input
            className="auth-input"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
            onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
          />
          <ul className="validation-list" aria-live="polite">
            <li className={`validation-item ${getStatusClass(isConfirmValid, confirmTouched)}`}>
              Passwords match
            </li>
          </ul>

          {/* Image upload */}
          <div className="image-picker">
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <button
              className="image-picker-row"
              type="button"
              onClick={handleOpenImagePicker}
            >
              <span className="image-picker-label">Choose profile picture (optional)</span>
              <span className="image-picker-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path
                    d="M12 4l-4 4h3v6h2V8h3l-4-4zM6 18h12v2H6z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </button>
            {imageBase64 && (
              <button
                className="btn btn-ghost register-remove"
                type="button"
                onClick={handleRemoveImage}
              >
                Remove image
              </button>
            )}
            {imageBase64 && (
              <div className="image-preview">
                <img src={imageBase64} alt="Profile preview" />
              </div>
            )}
          </div>

          {/* Register button */}
          <button className="btn btn-primary register-submit" type="submit" disabled={!canSubmit}>
            Register
          </button>
        </form>

        {/* Navigation to login page */}
        <p className="register-footer">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
