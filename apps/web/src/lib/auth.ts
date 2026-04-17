import { supabase } from "@/integrations/supabase/client";

// 🔐 LOGIN (Admin or any user)
export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error.message);
    throw error;
  }

  return data;
};

// 🔍 GET CURRENT SESSION
export const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
};

// 👤 GET CURRENT USER
export const getUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Get user error:", error.message);
    return null;
  }

  return user;
};

// 🚪 LOGOUT
export const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error.message);
    throw error;
  }
};

// 🛡️ CHECK IF USER IS LOGGED IN
export const requireAuth = async () => {
  const session = await getSession();

  if (!session) {
    throw new Error("You must be logged in");
  }

  return session;
};