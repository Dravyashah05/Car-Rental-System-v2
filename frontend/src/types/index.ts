export interface Cab {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  pricePerKm: number;
  pricePerHour: number;
  image: string;
  rating: number;
  reviews: number;
  available: boolean;
  seats: number;
  fuelType: string;
}

export interface Booking {
  id: string;
  cabId: string;
  userId: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  estimatedDistance: number;
  estimatedDuration: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  bookingDate: string;
  driverName?: string;
  driverPhone?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookings: Booking[];
}

export interface BookingRequest {
  cabId: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  estimatedDistance: number;
  estimatedDuration: number;
  totalPrice?: number;
}
