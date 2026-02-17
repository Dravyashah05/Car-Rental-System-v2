import React, { createContext, useContext, useState } from 'react';
import type { Booking, User } from '../types';

interface BookingContextType {
  user: User | null;
  bookings: Booking[];
  setUser: (user: User) => void;
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
  logout: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const addBooking = (booking: Booking) => {
    setBookings([...bookings, booking]);
    if (user) {
      setUser({
        ...user,
        bookings: [...user.bookings, booking],
      });
    }
  };

  const cancelBooking = (bookingId: string) => {
    setBookings(
      bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
      )
    );
    if (user) {
      setUser({
        ...user,
        bookings: user.bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
        ),
      });
    }
  };

  const logout = () => {
    setUser(null);
    setBookings([]);
  };

  return (
    <BookingContext.Provider
      value={{ user, bookings, setUser, addBooking, cancelBooking, logout }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};
