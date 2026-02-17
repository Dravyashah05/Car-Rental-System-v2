# 🔌 API Integration Guide for CabRental App

This guide explains how to integrate real backend APIs with the existing CabRental application.

## Current Architecture

The app currently uses a **Mock Service Layer** at `src/services/cabService.ts` that simulates API responses. To integrate with a real backend, you'll replace these mock functions with actual API calls.

## Service Layer Structure

### Current Mock Service

```typescript
// src/services/cabService.ts
export const cabService = {
  getAllCabs: async (): Promise<Cab[]> => { ... },
  getCabById: async (id: string): Promise<Cab | null> => { ... },
  searchCabs: async (filters?: {...}): Promise<Cab[]> => { ... },
  calculatePrice: (pricePerKm, pricePerHour, distance, duration) => { ... },
  createBooking: async (bookingRequest: BookingRequest): Promise<Booking> => { ... },
  getBookings: async (userId: string): Promise<Booking[]> => { ... },
};
```

## Integration Steps

### 1. Replace Mock Service with Real API Calls

**Before (Mock):**
```typescript
export const cabService = {
  getAllCabs: async (): Promise<Cab[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCabs), 500);
    });
  },
};
```

**After (Real API):**
```typescript
export const cabService = {
  getAllCabs: async (): Promise<Cab[]> => {
    const response = await fetch('https://api.example.com/cabs');
    if (!response.ok) throw new Error('Failed to fetch cabs');
    return response.json();
  },
};
```

### 2. Add Environment Variables

Create `.env` file:
```env
VITE_API_BASE_URL=https://api.example.com
VITE_API_KEY=your-api-key-here
```

Update service to use environment variables:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const cabService = {
  getAllCabs: async (): Promise<Cab[]> => {
    const response = await fetch(`${API_BASE_URL}/cabs`);
    return response.json();
  },
};
```

### 3. Create API Client Utility

Create `src/services/api.ts`:
```typescript
class ApiClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    const headers = token ? { ...this.headers, Authorization: `Bearer ${token}` } : this.headers;
    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }

  async post<T>(endpoint: string, data: any, token?: string): Promise<T> {
    const headers = token ? { ...this.headers, Authorization: `Bearer ${token}` } : this.headers;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }

  async put<T>(endpoint: string, data: any, token?: string): Promise<T> {
    const headers = token ? { ...this.headers, Authorization: `Bearer ${token}` } : this.headers;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    const headers = token ? { ...this.headers, Authorization: `Bearer ${token}` } : this.headers;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL);
```

### 4. Update cabService.ts

```typescript
import { apiClient } from './api';
import { Cab, Booking, BookingRequest } from '../types';

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
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.minRating) params.append('minRating', filters.minRating.toString());
    if (filters?.seats) params.append('seats', filters.seats.toString());

    return apiClient.get<Cab[]>(`/api/cabs/search?${params.toString()}`);
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
    const token = localStorage.getItem('authToken');
    return apiClient.post<Booking>('/api/bookings', bookingRequest, token);
  },

  getBookings: async (userId: string): Promise<Booking[]> => {
    const token = localStorage.getItem('authToken');
    return apiClient.get<Booking[]>(`/api/bookings?userId=${userId}`, token);
  },
};
```

## Backend API Endpoints

### Required Endpoints

```
GET    /api/cabs                    - Get all cabs
GET    /api/cabs/:id               - Get cab by ID
GET    /api/cabs/search             - Search cabs with filters
POST   /api/bookings                - Create new booking
GET    /api/bookings?userId=:id    - Get user bookings
PUT    /api/bookings/:id            - Update booking status
DELETE /api/bookings/:id            - Cancel booking
POST   /api/auth/login              - User login
POST   /api/auth/signup             - User registration
GET    /api/auth/verify             - Verify token
```

## Authentication Integration

Add authentication service:

```typescript
// src/services/authService.ts
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getAuthToken: () => localStorage.getItem('authToken'),

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};
```

Update BookingContext to use auth service:

```typescript
import { authService } from '../services/authService';

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (user) {
      cabService.getBookings(user.id).then(setBookings);
    }
  }, [user]);

  // ... rest of context
};
```

## Error Handling

Add error interceptor to API client:

```typescript
async get<T>(endpoint: string, token?: string): Promise<T> {
  try {
    const headers = token ? { ...this.headers, Authorization: `Bearer ${token}` } : this.headers;
    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });
    
    if (response.status === 401) {
      // Token expired, logout user
      authService.logout();
      window.location.href = '/login';
    }
    
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
}
```

## Loading States

Update components to show loading states:

```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadCabs = async () => {
    try {
      setLoading(true);
      const allCabs = await cabService.getAllCabs();
      setCabs(allCabs);
      setError(null);
    } catch (err) {
      setError('Failed to load cabs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  loadCabs();
}, []);

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
```

## Testing API Integration

Use these tools to test your API:

1. **Postman** - HTTP request testing
2. **Insomnia** - REST client
3. **cURL** - Command line tool
4. **Browser DevTools** - Network tab

Example cURL request:
```bash
curl -X POST https://api.example.com/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cabId": "cab-1",
    "pickupLocation": "Times Square",
    "dropoffLocation": "Central Park",
    "pickupDate": "2024-02-15",
    "pickupTime": "10:30",
    "estimatedDistance": 5,
    "estimatedDuration": 20
  }'
```

## Environment-Specific Configuration

Create different environment files:

```
.env.development
.env.staging
.env.production
```

Update vite.config.ts:
```typescript
export default defineConfig({
  define: {
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL),
  },
});
```

## Data Validation

Add request/response validation:

```typescript
// src/services/validation.ts
import { Cab, Booking } from '../types';

export const validateCab = (data: unknown): Cab => {
  if (typeof data !== 'object' || !data) throw new Error('Invalid cab data');
  
  const cab = data as Cab;
  if (!cab.id || !cab.make || !cab.model) throw new Error('Missing required fields');
  
  return cab;
};

export const validateBooking = (data: unknown): Booking => {
  // Similar validation logic
  return data as Booking;
};
```

## Performance Optimization

Add caching:

```typescript
const cabCache = new Map<string, Cab>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cabService = {
  getCabById: async (id: string): Promise<Cab | null> => {
    if (cabCache.has(id)) return cabCache.get(id) || null;
    
    const cab = await apiClient.get<Cab>(`/api/cabs/${id}`);
    cabCache.set(id, cab);
    
    setTimeout(() => cabCache.delete(id), CACHE_DURATION);
    return cab;
  },
};
```

## Migration Checklist

- [ ] Create `.env` file with API base URL
- [ ] Create `api.ts` client utility
- [ ] Update `cabService.ts` with real endpoints
- [ ] Create `authService.ts`
- [ ] Update `BookingContext.tsx` for authentication
- [ ] Add error handling in components
- [ ] Add loading states
- [ ] Test all API endpoints
- [ ] Implement request/response validation
- [ ] Add caching where appropriate
- [ ] Test on different network speeds
- [ ] Deploy and monitor

---

For questions or issues, refer to your backend documentation or API specification.
