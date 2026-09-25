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
    id: 'customer-rahul', // will match seed or fallback
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
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<RoleType>('CUSTOMER');
  const [user, setUser] = useState<UserProfile>(DEMO_USERS.CUSTOMER);
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    // Fetch actual database users to sync real UUIDs
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
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

          // Restore role from localStorage if exists
          const savedRole = localStorage.getItem('turfbook_role') as RoleType;
          if (savedRole && DEMO_USERS[savedRole]) {
            setRoleState(savedRole);
            setUser(DEMO_USERS[savedRole]);
          } else {
            setUser(DEMO_USERS.CUSTOMER);
          }
        }
      })
      .catch((err) => console.error('Failed to sync users:', err));
  }, []);

  const setRole = (newRole: RoleType) => {
    setRoleState(newRole);
    setUser(DEMO_USERS[newRole]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('turfbook_role', newRole);
    }
  };

  return (
    <RoleContext.Provider value={{ role, user, setRole, usersList }}>
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
