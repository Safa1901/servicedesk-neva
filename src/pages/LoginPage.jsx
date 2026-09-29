import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStore } from '../store/authStore';
import { loginRequest } from '../api/auth';
import FormInput from '../components/FormInput';

function LoaderCircle() {
  return (
    <svg
      className="loader-spinner"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="status"
      aria-label="Loading"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setErrorMessage(null);

    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Имя пользователя обязательно';
    if (!password) newErrors.password = 'Пароль обязателен';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await loginRequest({ 
        username: username.trim(), 
        password 
      });

      const userData = response.user || response.data?.user || { 
        name: username.trim(), 
        username: username.trim() 
      };

      authStore.setUser(userData);
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Ошибка входа. Проверьте логин и пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-card-inner">
          <div className="auth-header">
            <div style={{ textAlign: 'center' }}>
              <h1 className="auth-title">Войдите в свою учетную запись</h1>
              <p className="auth-description">
                Введите свое имя пользователя и пароль ниже, чтобы войти в систему
              </p>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <FormInput
              label="Имя пользователя"
              id="username"
              type="text"
              name="username"
              required
              autoFocus
              tabIndex={1}
              autoComplete="username"
              placeholder="Введите имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
            />

            <FormInput
              label="Пароль"
              id="password"
              type="password"
              name="password"
              required
              tabIndex={2}
              autoComplete="current-password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            <div className="checkbox-group">
              <input
                className="form-checkbox"
                id="remember"
                name="remember"
                type="checkbox"
                tabIndex={3}
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label className="form-label" htmlFor="remember" style={{ marginBottom: 0 }}>
                Запомнить меня
              </label>
            </div>

            <button
              className="btn-primary"
              type="submit"
              tabIndex={4}
              disabled={loading}
            >
              {loading && <LoaderCircle />}
              Авторизоваться
            </button>

            {errorMessage && (
              <p className="form-error" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}