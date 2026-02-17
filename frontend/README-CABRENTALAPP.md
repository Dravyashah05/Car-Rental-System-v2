# 🚖 CabRental - Web App for Cab Renting Service

A modern, responsive web application for booking and managing cab rentals. Built with React, TypeScript, and Vite.

## 📋 Features

### Core Features
- **Browse Available Cabs** - View all available cabs with detailed information
- **Advanced Filtering** - Filter cabs by price, rating, and number of seats
- **Real-time Booking** - Book cabs with flexible date and time selection
- **Price Calculator** - Transparent pricing breakdown based on distance and duration
- **Booking Management** - View and manage all your bookings
- **Booking History** - Track completed, upcoming, and cancelled bookings
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

### Pages
1. **Home Page** - Landing page with search form and service highlights
2. **Browse Cabs** - Grid view of all available cabs with filters
3. **Booking Page** - Detailed booking form with price breakdown
4. **My Bookings** - Dashboard to view and manage all bookings

### Technical Features
- Modern React 19 with TypeScript
- Client-side routing with React Router v6
- Context API for state management
- Mock service layer for data handling
- Responsive CSS Grid and Flexbox layouts
- Gradient backgrounds and smooth animations
- Mobile-first responsive design

## 🏗️ Project Structure

```
front/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── CabsPage.tsx
│   │   ├── BookingPage.tsx
│   │   └── BookingsPage.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── SearchForm.tsx
│   │   ├── CabCard.tsx
│   │   └── Footer.tsx
│   ├── services/
│   │   └── cabService.ts          # Mock API service
│   ├── context/
│   │   └── BookingContext.tsx      # Global state management
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   ├── styles/
│   │   ├── Navbar.css
│   │   ├── HomePage.css
│   │   ├── CabCard.css
│   │   ├── SearchForm.css
│   │   ├── CabsPage.css
│   │   ├── BookingPage.css
│   │   ├── BookingsPage.css
│   │   └── Footer.css
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd "e:\final year project\front"
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build

Build for production:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## 📦 Dependencies

### Production
- **react**: ^19.2.0 - UI library
- **react-dom**: ^19.2.0 - React DOM rendering
- **react-router-dom**: ^6.20.0 - Routing and navigation

### Development
- **typescript**: ~5.9.3 - Type checking
- **vite**: npm:rolldown-vite@7.2.5 - Build tool
- **eslint**: ^9.39.1 - Code linting
- **@vitejs/plugin-react**: ^5.1.1 - React integration for Vite

## 🎨 Design Features

### Color Scheme
- **Primary Gradient**: #667eea to #764ba2 (Purple)
- **Accent**: #ffd700 (Gold)
- **Success**: #4caf50 (Green)
- **Danger**: #f44336 (Red)
- **Background**: #f5f7fa (Light Gray)

### Key Components
- **Navbar**: Sticky navigation with gradient background
- **Search Form**: Responsive form for quick cab search
- **Cab Cards**: Grid layout with hover animations
- **Booking Form**: Comprehensive form with price breakdown
- **Booking Dashboard**: Tabbed interface for booking management
- **Footer**: Multi-section footer with social links

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px to 1023px
- **Mobile**: Below 768px

## 🔄 State Management

The app uses React Context API for global state management:

```typescript
- user: Current logged-in user
- bookings: List of all user bookings
- setUser(): Update user information
- addBooking(): Create new booking
- cancelBooking(): Cancel existing booking
- logout(): Clear user session
```

## 📊 Mock Data

The application includes mock cab data with:
- 5 sample cabs with different specifications
- Realistic pricing models (per km + per hour)
- Mock booking creation system
- Demo driver information

## 🔄 Workflow

1. **Home Page**: User lands on home page with search form
2. **Browse Cabs**: User can either use search or navigate to browse all cabs
3. **Filter Cabs**: Apply filters for price, rating, and seats
4. **View Details**: Click on a cab to see more details
5. **Book Cab**: Fill booking form with locations and dates
6. **Price Calculation**: See real-time price breakdown
7. **Confirm Booking**: Complete the booking process
8. **Track Booking**: View all bookings in My Bookings dashboard

## 🎯 Future Enhancements

- Backend API integration
- Payment gateway integration
- Real-time GPS tracking
- Driver reviews and ratings
- Advanced filtering (car type, fuel type)
- Promo codes and discounts
- Multiple language support
- Push notifications
- Admin dashboard for cab management
- User authentication and profiles

## 📝 Notes

- All cab data is currently mocked using the `cabService` module
- Bookings are stored in React Context (not persistent)
- The app uses placeholder images via placeholder.com
- Pricing is calculated based on distance and hourly rates

## 🤝 Contributing

This is a final year project. Feel free to fork and customize according to your requirements.

## 📄 License

This project is open for educational purposes.

---

**Start building your cab rental empire! 🚖✨**
