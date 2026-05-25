"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

export type AuthUser = {
  id: string;
  email: string;
  fullName?: string;
  level?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  isMock: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, level: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isMock = supabase === null;

  useEffect(() => {
    const client = supabase;
    if (client) {
      const getInitialSession = async () => {
        try {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            const { data: profile } = await client
              .from("profiles")
              .select("full_name, level")
              .eq("id", session.user.id)
              .single();

            setUser({
              id: session.user.id,
              email: session.user.email || "",
              fullName: profile?.full_name || session.user.user_metadata?.full_name,
              level: profile?.level || "B1",
            });
          }
        } catch (err) {
          console.error("Error loading session:", err);
        } finally {
          setLoading(false);
        }
      };

      getInitialSession();

      const { data: { subscription } } = client.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const { data: profile } = await client
              .from("profiles")
              .select("full_name, level")
              .eq("id", session.user.id)
              .single();

            setUser({
              id: session.user.id,
              email: session.user.email || "",
              fullName: profile?.full_name || session.user.user_metadata?.full_name,
              level: profile?.level || "B1",
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const client = supabase;
    if (!client) return { error: new Error("Supabase no configurado") };

    try {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) return { error };
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, level: string) => {
    const client = supabase;
    if (!client) return { error: new Error("Supabase no configurado") };

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      if (error) return { error };

      if (data.user) {
        const { error: profileError } = await client.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
          level: level,
        });
        if (profileError) console.error("Error creating profile:", profileError);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    const client = supabase;
    if (client) {
      await client.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isMock,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
