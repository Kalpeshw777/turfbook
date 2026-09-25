'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type RoleType = 'CUSTOMER' | 'OWNER' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: RoleType;
  avatar: string;
  turfId?: string;
  turfName?: string;
}

export const DEMO_USERS: Record<RoleType, UserProfile> = {
  CUSTOMER: {
    id: 'customer-rahul',
    name: 'Rahul Patil',
    email: 'rahul@gmail.com',
    phone: '+91 98201 12345',
    role: 'CUSTOMER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  OWNER: {
    id: 'owner-apex',
    name: 'Vikram Malhotra',
    email: 'owner@apexarena.com',
    phone: '+91 98765 43210',
    role: 'OWNER',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    turfId: 'apex-sports-arena',
    turfName: 'Apex Sports Arena',
  },
  ADMIN: {
    id: 'admin-super',
    name: 'TurfBook Admin',
    email: 'admin@turfbook.com',
    phone: '+91 99999 88888',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  },
};

interface RoleContextType {
  role: RoleType;
  user: UserProfile;
  setRole: (role: RoleType) => void;
  usersList: any[];
  loginWithEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (name?: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: {
    name: string;
    email: string;
    phone?: string;
    role: RoleType;
    turfName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<RoleType>('CUSTOMER');
  const [user, setUser] = useState<UserProfile>(DEMO_USERS.CUSTOMER);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Sync users from DB
  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && data.users?.length > 0) {
        setUsersList(data.users);
        const customerDb = data.users.find((u: any) => u.role === 'CUSTOMER');
        const ownerDb = data.users.find((u: any) => u.role === 'OWNER');
        const adminDb = data.users.find((u: any) => u.role === 'ADMIN');

        if (customerDb) {
          DEMO_USERS.CUSTOMER.id = customerDb.id;
          DEMO_USERS.CUSTOMER.name = customerDb.name;
        }
        if (ownerDb) {
          DEMO_USERS.OWNER.id = ownerDb.id;
          DEMO_USERS.OWNER.name = ownerDb.name;
          if (ownerDb.turfsOwned?.[0]) {
            DEMO_USERS.OWNER.turfId = ownerDb.turfsOwned[0].id;
            DEMO_USERS.OWNER.turfName = ownerDb.turfsOwned[0].name;
          }
        }
        if (adminDb) {
          DEMO_USERS.ADMIN.id = adminDb.id;
          DEMO_USERS.ADMIN.name = adminDb.name;
        }

        // Restore custom session if stored
        const storedUser = localStorage.getItem('turfbook_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setRoleState(parsed.role);
          setIsAuthenticated(true);
        } else {
          const savedRole = (localStorage.getItem('turfbook_role') as RoleType) || 'CUSTOMER';
          if (DEMO_USERS[savedRole]) {
            setRoleState(savedRole);
            setUser(DEMO_USERS[savedRole]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync users:', err);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const setRole = (newRole: RoleType) => {
    setRoleState(newRole);
    setUser(DEMO_USERS[newRole]);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('turfbook_role', newRole);
      localStorage.removeItem('turfbook_user');
    }
  };

  const loginWithEmail = async (email: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        const u = data.user;
        const profile: UserProfile = {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '',
          role: u.role as RoleType,
          avatar: u.avatar || DEMO_USERS.CUSTOMER.avatar,
          turfId: u.turfsOwned?.[0]?.id,
          turfName: u.turfsOwned?.[0]?.name,
        };
        setUser(profile);
        setRoleState(profile.role);
        setIsAuthenticated(true);
        localStorage.setItem('turfbook_user', JSON.stringify(profile));
        localStorage.setItem('turfbook_role', profile.role);
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const loginWithGoogle = async (name: string = 'Kunal Sharma', email: string = 'kunal.google@gmail.com') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isGoogle: true,
          googleName: name,
          googleEmail: email,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        const u = data.user;
        const profile: UserProfile = {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '+91 98330 12345',
          role: u.role as RoleType,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        };
        setUser(profile);
        setRoleState(profile.role);
        setIsAuthenticated(true);
        localStorage.setItem('turfbook_user', JSON.stringify(profile));
        localStorage.setItem('turfbook_role', profile.role);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    phone?: string;
    role: RoleType;
    turfName?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.user) {
        const u = data.user;
        const profile: UserProfile = {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || payload.phone || '',
          role: u.role as RoleType,
          avatar: u.avatar || DEMO_USERS.CUSTOMER.avatar,
          turfId: u.turfsOwned?.[0]?.id,
          turfName: u.turfsOwned?.[0]?.name,
        };
        setUser(profile);
        setRoleState(profile.role);
        setIsAuthenticated(true);
        localStorage.setItem('turfbook_user', JSON.stringify(profile));
        localStorage.setItem('turfbook_role', profile.role);
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('turfbook_user');
    setRole('CUSTOMER');
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        user,
        setRole,
        usersList,
        loginWithEmail,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
