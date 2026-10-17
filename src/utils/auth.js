import AsyncStorage from '@react-native-async-storage/async-storage';

// 7 days in milliseconds
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Decodes standard JWT payload safely without external dependencies
 */
export const decodeJwtPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = '';
    if (typeof atob === 'function') {
      jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } else {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let str = base64.replace(/=+$/, '');
      let output = '';
      for (
        let bc = 0, bs = 0, buffer, i = 0;
        (buffer = str.charAt(i++));
        ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
          ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
          : 0
      ) {
        buffer = chars.indexOf(buffer);
      }
      jsonPayload = output;
    }
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

/**
 * Checks if the user's token is expired:
 * 1. Missing token
 * 2. JWT exp timestamp passed
 * 3. Explicit tokenExpiry timestamp passed
 * 4. Stored loginTime is 7 days or older
 */
export const isTokenExpired = (userData) => {
  if (!userData || !userData.token) return true;

  const now = Date.now();

  // 1. Check decoded JWT exp if present
  const jwt = decodeJwtPayload(userData.token);
  if (jwt && jwt.exp) {
    const expMs = jwt.exp * 1000;
    if (now >= expMs) {
      return true;
    }
  }

  // 2. Check tokenExpiry stored explicitly
  if (userData.tokenExpiry) {
    if (now >= Number(userData.tokenExpiry)) {
      return true;
    }
  }

  // 3. Check loginTime + 7 days
  if (userData.loginTime) {
    if (now - Number(userData.loginTime) >= SEVEN_DAYS_MS) {
      return true;
    }
  }

  return false;
};

/**
 * Prepares user data with 7-day expiration timestamp before saving to storage
 */
export const prepareUserDataWithExpiry = (userData) => {
  const now = Date.now();
  const jwt = decodeJwtPayload(userData?.token);
  const jwtExpMs = jwt?.exp ? jwt.exp * 1000 : null;
  const tokenExpiry = jwtExpMs || now + SEVEN_DAYS_MS;

  return {
    ...userData,
    loginTime: now,
    tokenExpiry,
  };
};

/**
 * Clears the user authentication session from AsyncStorage
 */
export const clearAuthSession = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (e) {
    console.error('Error clearing auth session:', e);
  }
};
