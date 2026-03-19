import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authManager, AuthState, AuthUser } from '../auth/web-auth-client';

interface AuthContextType {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    // Subscribe to auth manager changes
    const unsubscribe = authManager.subscribe((authState) => {
      dispatch({ type: 'SET_USER', payload: authState.user });
      dispatch({ type: 'SET_LOADING', payload: authState.isLoading });
      dispatch({ type: 'SET_ERROR', payload: authState.error });
      dispatch({ type: 'SET_AUTHENTICATED', payload: authState.isAuthenticated });
    });

    // Initial auth check
    authManager.checkAuthStatus();

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    state,
    signIn: authManager.signIn.bind(authManager),
    signUp: authManager.signUp.bind(authManager),
    signInWithGoogle: authManager.signInWithGoogle.bind(authManager),
    signInWithGithub: authManager.signInWithGithub.bind(authManager),
    signOut: authManager.signOut.bind(authManager),
    checkAuthStatus: authManager.checkAuthStatus.bind(authManager),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { state } = useAuth();

    if (state.isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!state.isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to access this page.</p>
            <button 
              onClick={() => window.location.href = '/auth'}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Sign In
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
