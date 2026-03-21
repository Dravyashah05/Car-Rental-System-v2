import type { Cab, Booking, BookingRequest } from '../types';
import { apiClient } from './api';

const getAuthToken = () => localStorage.getItem('authToken') ?? undefined;

export const cabService = {
  getAllCabs: async (): Promise<Cab[]> => {
    return apiClient.get<Cab[]>('/api/cabs');
  },

  getCabById: async (id: string): Promise<Cab | null> => {
    try {
      return await apiClient.get<Cab>(`/api/cabs/${id}`);
    } catch {
      return null;
    }
  },

  searchCabs: async (filters?: {
    maxPrice?: number;
    minRating?: number;
    seats?: number;
  }): Promise<Cab[]> => {
    const params = new URLSearchParams();
    if (filters?.maxPrice !== undefined) {
      params.append('maxPrice', filters.maxPrice.toString());
    }
    if (filters?.minRating !== undefined) {
      params.append('minRating', filters.minRating.toString());
    }
    if (filters?.seats !== undefined) {
      params.append('seats', filters.seats.toString());
    }

    const query = params.toString();
    const endpoint = query ? `/api/cabs/search?${query}` : '/api/cabs/search';
    return apiClient.get<Cab[]>(endpoint);
  },

  calculatePrice: (
    pricePerKm: number,
    pricePerHour: number,
    distance: number,
    duration: number
  ): number => {
    return pricePerKm * distance + pricePerHour * (duration / 60);
  },

  createBooking: async (bookingRequest: BookingRequest): Promise<Booking> => {
    type RideResponse = {
      _id: string;
      rider?: { _id?: string } | string;
      cab?: { _id?: string } | string;
      pickup?: { address?: string };
      dropoff?: { address?: string };
      distanceKm?: number;
      fare?: number;
      status?: string;
      createdAt?: string;
    };

    const payload = {
      cabId: bookingRequest.cabId,
      pickup: { address: bookingRequest.pickupLocation },
      dropoff: { address: bookingRequest.dropoffLocation },
      distanceKm: bookingRequest.estimatedDistance,
      fare: bookingRequest.totalPrice,
    };

    try {
      const ride = await apiClient.post<RideResponse>('/api/rides', payload, getAuthToken());

      const rideStatus = (ride.status || 'requested').toLowerCase();
      const statusMap: Record<string, Booking['status']> = {
        requested: 'pending',
        assigned: 'confirmed',
        accepted: 'confirmed',
        enroute: 'confirmed',
        completed: 'completed',
        cancelled: 'cancelled',
      };

      const riderId =
        typeof ride.rider === 'string' ? ride.rider : ride.rider?._id ?? '';

      const cabId =
        typeof ride.cab === 'string' ? ride.cab : ride.cab?._id ?? bookingRequest.cabId;

      return {
        id: ride._id,
        cabId,
        userId: riderId,
        pickupLocation: ride.pickup?.address ?? bookingRequest.pickupLocation,
        dropoffLocation: ride.dropoff?.address ?? bookingRequest.dropoffLocation,
        pickupDate: bookingRequest.pickupDate,
        pickupTime: bookingRequest.pickupTime,
        estimatedDistance: bookingRequest.estimatedDistance,
        estimatedDuration: bookingRequest.estimatedDuration,
        totalPrice: ride.fare ?? bookingRequest.totalPrice ?? 0,
        status: statusMap[rideStatus] ?? 'pending',
        bookingDate: ride.createdAt ?? new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  getBookings: async (userId?: string): Promise<Booking[]> => {
    type RideResponse = {
      _id: string;
      rider?: { _id?: string } | string;
      cab?: { _id?: string } | string;
      pickup?: { address?: string };
      dropoff?: { address?: string };
      distanceKm?: number;
      fare?: number;
      status?: string;
      createdAt?: string;
    };

    const token = getAuthToken();
    const params = userId ? `?riderId=${userId}` : '';
    const rides = await apiClient.get<RideResponse[]>(`/api/rides${params}`, token);

    return rides.map((ride) => {
      const rideStatus = (ride.status || 'requested').toLowerCase();
      const statusMap: Record<string, Booking['status']> = {
        requested: 'pending',
        assigned: 'confirmed',
        accepted: 'confirmed',
        enroute: 'confirmed',
        completed: 'completed',
        cancelled: 'cancelled',
      };

      const riderId =
        typeof ride.rider === 'string' ? ride.rider : ride.rider?._id ?? '';

      const cabId =
        typeof ride.cab === 'string' ? ride.cab : ride.cab?._id ?? '';

      return {
        id: ride._id,
        cabId,
        userId: riderId,
        pickupLocation: ride.pickup?.address ?? '',
        dropoffLocation: ride.dropoff?.address ?? '',
        pickupDate: ride.createdAt || new Date().toISOString(),
        pickupTime: ride.createdAt ? new Date(ride.createdAt).toLocaleTimeString() : '',
        estimatedDistance: ride.distanceKm ?? 0,
        estimatedDuration: 0,
        totalPrice: ride.fare ?? 0,
        status: statusMap[rideStatus] ?? 'pending',
        bookingDate: ride.createdAt ?? new Date().toISOString(),
      };
    });
  },
};
