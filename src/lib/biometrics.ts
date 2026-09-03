/**
 * WebAuthn & Platform Biometrics Utility for ExpensePK
 * Supports Touch ID, Face ID, Android Biometric / Fingerprint, Windows Hello, and Passkeys.
 */

// Helper to convert Uint8Array to base64url string
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Helper to convert base64url to Uint8Array
function base64UrlToBuffer(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export interface BiometricAvailability {
  isSupported: boolean;
  hasPlatformSensor: boolean;
  sensorType: 'TouchID_FaceID' | 'AndroidFingerprint' | 'WindowsHello' | 'GenericBiometric' | 'Passkey' | 'None';
  statusText: string;
}

/**
 * Check if the current browser and device support WebAuthn and platform biometrics.
 */
export async function checkBiometricSupport(): Promise<BiometricAvailability> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return {
      isSupported: false,
      hasPlatformSensor: false,
      sensorType: 'None',
      statusText: 'Biometric API is not supported in this browser environment.',
    };
  }

  let hasPlatform = false;
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      hasPlatform = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch (err) {
    console.warn('Error checking platform authenticator:', err);
    hasPlatform = false;
  }

  // Detect platform sensor type from User Agent
  const ua = navigator.userAgent.toLowerCase();
  let sensorType: BiometricAvailability['sensorType'] = 'GenericBiometric';
  let statusText = 'Biometric sensor ready (Fingerprint / Touch ID / Face ID / PIN)';

  if (/iphone|ipad|ipod|macintosh/.test(ua)) {
    sensorType = 'TouchID_FaceID';
    statusText = hasPlatform ? 'Touch ID / Face ID sensor available' : 'Apple Biometric / Device Passcode available';
  } else if (/android/.test(ua)) {
    sensorType = 'AndroidFingerprint';
    statusText = hasPlatform ? 'Android Fingerprint / Face Unlock available' : 'Android Screen Lock / Biometric available';
  } else if (/windows/.test(ua)) {
    sensorType = 'WindowsHello';
    statusText = hasPlatform ? 'Windows Hello (Fingerprint / Face / PIN) available' : 'Windows Device Passcode available';
  }

  return {
    isSupported: true,
    hasPlatformSensor: hasPlatform,
    sensorType,
    statusText,
  };
}

/**
 * Register a new WebAuthn Biometric credential for the user on this device.
 */
export async function registerBiometricCredential(
  userName: string,
  userEmail: string
): Promise<{ success: boolean; credentialId?: string; error?: string }> {
  if (typeof window === 'undefined' || !navigator.credentials) {
    return {
      success: false,
      error: 'WebAuthn credentials API not available on this browser.',
    };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'ExpensePK Secure Finance',
        // In iframe environments or local development, let browser deduce RP or use window.location.hostname
        id: window.location.hostname && window.location.hostname !== 'localhost' ? window.location.hostname : undefined,
      },
      user: {
        id: userId,
        name: userEmail || userName || 'user@expensepk.app',
        displayName: userName || 'ExpensePK User',
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        requireResidentKey: false,
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      return { success: false, error: 'Registration cancelled or not completed.' };
    }

    const rawId = bufferToBase64Url(credential.rawId);
    return { success: true, credentialId: rawId };
  } catch (err: any) {
    console.warn('WebAuthn Registration Error:', err);
    // If running in restricted iframe or user cancelled
    if (err.name === 'NotAllowedError') {
      return {
        success: false,
        error: 'Biometric prompt was cancelled or permission not granted in current frame.',
      };
    }
    if (err.name === 'InvalidStateError') {
      return {
        success: false,
        error: 'Authenticator already registered for this device.',
      };
    }
    if (err.name === 'NotSupportedError') {
      return {
        success: false,
        error: 'Platform authenticator not supported on this device. You can still use PIN lock.',
      };
    }
    return {
      success: false,
      error: err?.message || 'Failed to complete biometric registration.',
    };
  }
}

/**
 * Perform Biometric Authentication using WebAuthn Platform Authenticator
 */
export async function authenticateWithBiometrics(
  savedCredentialId?: string | null
): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined' || !navigator.credentials) {
    return {
      success: false,
      error: 'WebAuthn is not supported in this browser.',
    };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      userVerification: 'preferred',
      rpId: window.location.hostname && window.location.hostname !== 'localhost' ? window.location.hostname : undefined,
    };

    if (savedCredentialId) {
      try {
        const idBuffer = base64UrlToBuffer(savedCredentialId);
        publicKeyCredentialRequestOptions.allowCredentials = [
          {
            id: idBuffer,
            type: 'public-key',
            transports: ['internal'],
          },
        ];
      } catch (e) {
        console.warn('Could not parse saved credential id:', e);
      }
    }

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });

    if (assertion) {
      return { success: true };
    } else {
      return { success: false, error: 'Biometric verification cancelled.' };
    }
  } catch (err: any) {
    console.warn('WebAuthn Authentication Error:', err);
    if (err.name === 'NotAllowedError') {
      return {
        success: false,
        error: 'Biometric prompt was cancelled or timed out. Tap sensor or use PIN.',
      };
    }
    return {
      success: false,
      error: err?.message || 'Biometric authentication failed. Please enter PIN.',
    };
  }
}

/**
 * Trigger device vibration for haptic feedback
 */
export function triggerHapticFeedback(type: 'success' | 'error' | 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'success') {
        navigator.vibrate([40, 60, 40]);
      } else if (type === 'error') {
        navigator.vibrate([80, 50, 80]);
      } else {
        navigator.vibrate(30);
      }
    } catch {
      // Ignore vibration errors
    }
  }
}
