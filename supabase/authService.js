import { supabase } from './supabaseClient';

// ─────────────────────────────────────────
// SIGN UP
// Creates a Supabase auth user. The DB trigger
// in schema.sql auto-creates a profiles row.
// ─────────────────────────────────────────
export async function signUp({ email, password, displayName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: displayName },    // passed to profiles trigger
    },
  });
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────
// SIGN IN
// ─────────────────────────────────────────
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────
// SIGN OUT
// ─────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─────────────────────────────────────────
// GET CURRENT SESSION
// Returns null if not logged in
// ─────────────────────────────────────────
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// ─────────────────────────────────────────
// GET CURRENT USER
// ─────────────────────────────────────────
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

// ─────────────────────────────────────────
// LISTEN TO AUTH STATE CHANGES
// Use in your root App.tsx to react to
// login/logout events across the app
//
// Usage:
//   const unsub = onAuthStateChange((session) => {
//     setUser(session?.user ?? null);
//   });
//   return () => unsub(); // cleanup
// ─────────────────────────────────────────
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription.unsubscribe;
}

// ─────────────────────────────────────────
// PASSWORD RESET
// ─────────────────────────────────────────
export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}
