import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetDB, refreshStore, hydratePublic } from './db.js';
import { roleOf, roleKeyOf, backendRoleOf } from './rbac.js';
import { apiRequest, setToken, clearToken, getToken } from './api.js';

/* ==========================================================================
   Server-backed authentication. Sessions are JWT bearer tokens persisted in
   localStorage. On restore, /api/bootstrap hydrates the data store and the
   authenticated user object.
   ========================================================================== */

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes of inactivity

const splitName = (name = '') => {
  const [first, ...rest] = String(name).trim().split(/\s+/);
  return { firstName: first || '', lastName: rest.join(' ') };
};

const initialsOf = (name = '') =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

const AuthContext = createContext(null);

export function normalizeUser(raw = {}) {
  const { firstName, lastName } = splitName(raw.name);
  return {
    ...raw,
    id: raw.id,
    name: raw.name || '',
    firstName: raw.firstName || firstName,
    lastName: raw.lastName || lastName,
    email: raw.email || '',
    role: roleKeyOf(raw.role),
    roleBackend: raw.role,
    initials: raw.initials || initialsOf(raw.name),
    patientProfile: raw.patientProfile || raw.patient || null,
    doctorProfile: raw.doctorProfile || raw.doctor || null,
    imageUrl: raw.imageUrl || null,
  };
}

/* Development demo accounts — one quick-login button per portal role.
   The backend picks a real seeded user for the given role. */
export const DEMO_ROLES = [
  { role: 'patient', label: 'Patient', note: 'Portal: book, labs, messages, billing' },
  { role: 'provider', label: 'Clinician', note: 'Schedule, charts, orders, results' },
  { role: 'admin', label: 'Administrator', note: 'Master schedule, billing, staff, reports' },
  { role: 'nurse', label: 'Nurse', note: 'Queue, vitals, triage' },
  { role: 'pharmacist', label: 'Pharmacist', note: 'Prescription queue & fulfillment' },
  { role: 'lab_tech', label: 'Lab Tech', note: 'Lab order queue & results' },
  { role: 'front_desk', label: 'Front Desk', note: 'Check-ins & scheduling' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [reAuth, setReAuth] = useState({ open: false, purpose: '' });
  const sessionTimer = useRef(null);
  const navigate = useNavigate();

  const stopTimer = useCallback(() => {
    if (sessionTimer.current) window.clearTimeout(sessionTimer.current);
  }, []);

  useEffect(() => {
    let active = true;
    if (!getToken()) {
      hydratePublic().finally(() => {
        if (active) setAuthLoading(false);
      });
      return undefined;
    }
    refreshStore()
      .then((store) => {
        if (!active) return;
        setUser(normalizeUser(store.userRaw || {}));
      })
      .catch(() => {
        clearToken();
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const logout = useCallback(async (reason) => {
    stopTimer();
    clearToken();
    resetDB();
    setUser(null);
    hydratePublic();
    navigate(reason === 'timeout' ? '/auth/login?reason=timeout' : '/auth/login');
  }, [navigate, stopTimer]);

  useEffect(() => {
    if (!user) {
      stopTimer();
      return undefined;
    }
    const expire = () => logout('timeout');
    const resetIdleTimer = () => {
      stopTimer();
      sessionTimer.current = window.setTimeout(expire, SESSION_TIMEOUT_MS);
    };
    ['pointerdown', 'keydown', 'touchstart'].forEach((eventName) =>
      window.addEventListener(eventName, resetIdleTimer, { passive: true })
    );
    resetIdleTimer();
    return () => {
      stopTimer();
      ['pointerdown', 'keydown', 'touchstart'].forEach((eventName) =>
        window.removeEventListener(eventName, resetIdleTimer)
      );
    };
  }, [user, logout, stopTimer]);

  const completeAuth = useCallback(async (path, body) => {
    const { data } = await apiRequest(path, { method: 'POST', body: JSON.stringify(body) });
    if (!data?.token) {
      throw new Error('The server did not return a session token.');
    }
    setToken(data.token);
    const signedInUser = normalizeUser(data.user);
    setUser(signedInUser);
    return { ok: true, user: signedInUser };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const result = await completeAuth('/api/auth/login', { email, password });
    refreshStore();
    return result;
  }, [completeAuth]);

  const signup = useCallback(async (account) => {
    const result = await completeAuth('/api/auth/register', account);
    refreshStore();
    return result;
  }, [completeAuth]);

  const demoLogin = useCallback(async (roleKey) => {
    const result = await completeAuth('/api/auth/demo', {
      role: backendRoleOf(roleKey || 'patient'),
    });
    refreshStore();
    return result;
  }, [completeAuth]);

  /* Sensitive action step-up: requires entering a one-time code (sent to the
     user's email). Returns a promise that resolves true if the user verifies
     the code, false if they cancel. */
  const requireReAuth = useCallback((purpose) => {
    return new Promise((resolve) => {
      setReAuth({
        open: true,
        purpose: purpose ?? 'Confirm this action',
        resolve: (ok) => {
          setReAuth({ open: false, purpose: '', resolve: null });
          resolve(Boolean(ok));
        },
      });
    });
  }, []);

  const cancelReAuth = useCallback(() => {
    setReAuth((r) => {
      r.resolve?.(false);
      return { open: false, purpose: '', resolve: null };
    });
  }, []);

  const confirmReAuth = useCallback(() => {
    setReAuth((r) => {
      r.resolve?.(true);
      return { open: false, purpose: '', resolve: null };
    });
  }, []);

  const value = {
    user,
    role: user ? roleOf(user) : null,
    isAuthenticated: Boolean(user),
    authLoading,
    login,
    demoLogin,
    signup,
    logout,
    reAuth,
    requireReAuth,
    cancelReAuth,
    confirmReAuth,
    demoAccounts: DEMO_ROLES,
    resetDemo: async () => {
      resetDB();
      await logout();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}