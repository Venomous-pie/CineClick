import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/services/authService';
import { RegisterData, LoginData, UpdateProfileData } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        await refreshUser();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    const result = await authService.login(data);
    if (result.success && result.user) {
      setUser(result.user);
    } else {
      throw new Error(result.message || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    const result = await authService.register(data);
    if (result.success && result.user) {
      setUser(result.user);
    } else {
      throw new Error(result.message || 'Registration failed');
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = async (data: UpdateProfileData) => {
    const result = await authService.updateProfile(data);
    if (result.success && result.user) {
      setUser(result.user);
    } else {
      throw new Error(result.message || 'Profile update failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

