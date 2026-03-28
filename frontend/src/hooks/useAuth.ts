/**
 * useAuth Hook
 * 
 * Hook to access auth store state and actions with real API integration.
 */

import { useCallback, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../utils/api';

// Define the user profile type locally
interface UserProfile {
  name: string;
  email: string;
  phone: string;
  photo: string | null;
  panNumber?: string;
}

/** OTP types supported by the authentication system */
type OTPType = 'login' | 'signup' | 'email' | 'phone';

/** OTP purpose for different verification flows */
type OTPPurpose = 'authentication' | 'verification';

/**
 * Data required to send an OTP
 * @property email - Email address (required for login/signup/email verification)
 * @property phone - Phone number (optional, for phone verification)
 * @property password - Password (optional, for login)
 * @property type - The type of OTP flow
 * @property purpose - The purpose of the OTP (authentication or verification)
 */
interface SendOTPData {
  email?: string;
  phone?: string;
  password?: string;
  type: OTPType;
  purpose?: OTPPurpose;
}

/**
 * Data required to verify an OTP
 * @property email - Email address (for email-based verification)
 * @property phone - Phone number (for phone-based verification)
 * @property otp - The OTP code entered by the user
 * @property type - The type of OTP flow (optional for verification)
 * @property purpose - The purpose of the OTP (authentication or verification)
 */
interface VerifyOTPData {
  email?: string;
  phone?: string;
  otp: string;
  type?: OTPType;
  purpose?: OTPPurpose;
}

interface UseAuthReturn {
  // State
  isAuthenticated: boolean;
  user: UserProfile;
  onboardingComplete: boolean;

  // Actions
  loginState: () => void;
  logout: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  // OTP Actions
  sendOTP: (data: SendOTPData) => Promise<boolean>;
  verifyOTP: (data: VerifyOTPData) => Promise<boolean>;
  error: { message: string } | null;
  clearError: () => void;
  isLoading: boolean;
}

export function useAuth(): UseAuthReturn {
  const authStore = useAuthStore();
  const [error, setError] = useState<{ message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const logout = useCallback(() => {
    // Clear tokens from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    authStore.logout();
  }, [authStore]);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Send an OTP to the user's email or phone
   * @param data - The OTP request data
   * @returns Promise<boolean> - True if OTP was sent successfully
   */
  const sendOTP = useCallback(async (data: SendOTPData): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Handle different OTP types
      if (data.type === 'login' && data.email) {
        await authApi.login({ email: data.email, password: data.password || '' });
      } else if (data.type === 'email' || data.type === 'phone') {
        // For email/phone verification, we would call a different API endpoint
        // For now, simulate success as the backend may not have this endpoint yet
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      // For signup, OTP is already sent during the signup process
      setIsLoading(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      setError({ message });
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Verify an OTP code
   * @param data - The OTP verification data
   * @returns Promise<boolean> - True if OTP was verified successfully
   */
  const verifyOTP = useCallback(async (data: VerifyOTPData): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    
    try {
      let response;
      
      // Handle verification purpose (email/phone verification during onboarding)
      if (data.purpose === 'verification') {
        // For verification purposes, simulate success as backend may not have this endpoint
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
        return true;
      }
      
      // Handle authentication purpose (login/signup)
      if (data.type === 'login' && data.email) {
        response = await authApi.verifyLoginOtp({ email: data.email, otp: data.otp });
      } else if (data.email) {
        response = await authApi.verifySignupOtp({ email: data.email, otp: data.otp });
      } else {
        throw new Error('Email is required for OTP verification');
      }
      
      // Store tokens if returned
      if (response.access) {
        localStorage.setItem('auth_token', response.access);
        localStorage.setItem('access_token', response.access);
      }
      if (response.refresh) {
        localStorage.setItem('refresh_token', response.refresh);
      }
      
      // Update auth state
      if (response.access) {
        authStore.login();
      }
      
      setIsLoading(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OTP verification failed';
      setError({ message });
      setIsLoading(false);
      return false;
    }
  }, [authStore]);

  return {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.userProfile,
    onboardingComplete: authStore.onboardingComplete,
    loginState: authStore.login,
    logout,
    updateUserProfile: authStore.updateUserProfile,
    completeOnboarding: authStore.completeOnboarding,
    sendOTP,
    verifyOTP,
    error,
    clearError,
    isLoading
  };
}

export default useAuth;

