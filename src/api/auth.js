import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export const loginRequest = async ({ username, password }) => {
  try {
    const response = await apiClient.post('/login', {
      username,
      password,
    });

    if (!response.data) {
      throw new Error('Нет данных от сервера');
    }

    if (response.data.success === false) {
      throw new Error(response.data.message || 'Ошибка авторизации');
    }

    // Сохраняем токен
    const token = response.data.token || response.data.access_token;
    if (token) {
      localStorage.setItem('access_token', token);
    }

    // Сохраняем данные пользователя
    const user = response.data.user || response.data.data?.user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     'Ошибка сервера';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Нет соединения с сервером');
    } else {
      throw new Error(error.message || 'Ошибка при выполнении запроса');
    }
  }
};

export const checkAuthRequest = async () => {
  const token = localStorage.getItem('access_token');
  
  // Если нет токена, выбрасываем ошибку
  if (!token) {
    throw new Error('Нет токена');
  }

  try {
    // Пробуем проверить токен (если есть эндпоинт для проверки)
    // Если эндпоинта нет, просто возвращаем данные из localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return { user };
      } catch (e) {
        // Если данные пользователя повреждены
        localStorage.removeItem('user');
        throw new Error('Ошибка данных пользователя');
      }
    }

    // Если нет эндпоинта, возвращаем базовые данные
    return { user: { username: 'User' } };
  } catch (error) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    throw error;
  }
};

export const logoutRequest = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export default apiClient;