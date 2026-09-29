// Простой store без MobX
class AuthStore {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.listeners = [];
    
    // Восстанавливаем пользователя из localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
        this.isAuthenticated = true;
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }

  setUser(user) {
    this.user = user;
    this.isAuthenticated = !!user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    this.notifyListeners();
  }

  clearAuth() {
    this.user = null;
    this.isAuthenticated = false;
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    this.notifyListeners();
  }

  // Для реактивности (подписка на изменения)
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const authStore = new AuthStore();