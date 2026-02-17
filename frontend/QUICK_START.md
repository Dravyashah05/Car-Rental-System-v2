# 🚀 CabRental App - Quick Start Guide

## What's Included

A complete cab rental service web application with:
- ✅ Home page with featured services
- ✅ Browse and filter available cabs
- ✅ Detailed booking page with price calculator
- ✅ Booking management dashboard
- ✅ Responsive mobile-first design
- ✅ Beautiful gradient UI with animations
- ✅ Mock API with 5 sample cabs

## 🏃 Quick Start (Already Running!)

The development server is already running at:
**http://localhost:5173/**

### To Access the App:
1. Open your browser
2. Navigate to `http://localhost:5173/`
3. Start exploring!

## 📍 Navigation Guide

### Home Page (/)
- Landing page with search functionality
- Features and testimonials section
- Quick access to browse cabs

### Browse Cabs (/cabs)
- Grid view of all available cabs
- Filter by:
  - Max price per km (₹5-50)
  - Minimum rating (0-5 stars)
  - Minimum seats (0-7)
- Click "Book Now" on any cab to proceed

### Book Cab (/book/:cabId)
- Detailed booking form
- Real-time price calculation
- Breakdown of costs:
  - Distance-based pricing
  - Hourly rate pricing
- Confirm booking button

### My Bookings (/bookings)
- View all your bookings
- Filter by status:
  - All bookings
  - Upcoming (confirmed)
  - Completed
  - Cancelled
- Booking details including:
  - Route information
  - Driver details
  - Total amount
  - Action buttons

## 🎯 Sample Cabs Available

1. **Toyota Corolla** - ₹15/km, ₹300/hr (5 seats)
2. **Honda Civic** - ₹12/km, ₹280/hr (5 seats)
3. **Hyundai Verna** - ₹10/km, ₹250/hr (5 seats)
4. **Maruti Swift** - ₹8/km, ₹200/hr (5 seats)
5. **Mahindra XUV500** - ₹20/km, ₹400/hr (7 seats)

## 💡 How to Use

### Step 1: Search or Browse
- From home page, enter pickup/dropoff locations and dates
- OR navigate to "Browse Cabs" to see all options

### Step 2: Filter Cabs
- Use sidebar filters to narrow down options
- Apply price, rating, and seat filters

### Step 3: Book a Cab
- Click "Book Now" on your preferred cab
- Fill in booking details:
  - Pickup/Dropoff locations
  - Date and time
  - Estimated distance and duration
- Review price breakdown

### Step 4: Confirm Booking
- Click "Confirm Booking"
- Your booking will appear in "My Bookings"

### Step 5: Manage Bookings
- Go to "My Bookings" to see all your bookings
- View booking details, driver information
- Cancel bookings or leave reviews

## 🎨 Design Highlights

- **Modern UI** with purple and gold gradient colors
- **Smooth Animations** on hover and interactions
- **Responsive Design** works on all devices
- **Clean Layout** with intuitive navigation
- **Icon-based Labels** for quick understanding
- **Status Indicators** for booking status

## 🛠️ Terminal Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm lint
```

## 📦 Project Files

All files are located in: `e:\final year project\front\`

### Key Folders:
- **src/pages/** - Page components (Home, Cabs, Booking, Bookings)
- **src/components/** - Reusable components (Navbar, Footer, CabCard)
- **src/services/** - Mock API calls (cabService)
- **src/context/** - State management (BookingContext)
- **src/styles/** - CSS stylesheets for each component
- **src/types/** - TypeScript interfaces

## 🔧 Customization Tips

### To Change Colors:
Look for gradient colors in CSS files:
- Current: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Update in any `.css` file under `src/styles/`

### To Add More Cabs:
Edit `src/services/cabService.ts`:
```typescript
const mockCabs: Cab[] = [
  // Add new cab objects here
];
```

### To Add Features:
1. Create new page in `src/pages/`
2. Create components in `src/components/`
3. Add route in `App.tsx`
4. Add navigation link in `Navbar.tsx`

## ⚠️ Important Notes

- **Data Persistence**: Bookings are currently stored in memory (not saved after refresh)
- **Mock Images**: Uses placeholder images from placeholder.com
- **Mock API**: All cab and booking data is mocked
- **No Backend**: Currently frontend-only, ready for backend integration

## 🚀 Next Steps for Production

1. **Add Backend API** - Connect to real database
2. **Authentication** - Implement user login/signup
3. **Payment Integration** - Add payment gateway (Stripe, Razorpay, etc.)
4. **Email Notifications** - Send booking confirmations
5. **SMS Integration** - Send ride updates via SMS
6. **Real GPS Tracking** - Show live cab location
7. **Reviews System** - Let users rate drivers
8. **Admin Dashboard** - Manage cabs and drivers

## 📞 Support

For any issues or questions, check:
1. Browser console (F12) for errors
2. Network tab to see API calls
3. React DevTools for component state

## 🎉 You're All Set!

The app is fully functional and ready for:
- ✅ Testing
- ✅ Demonstration
- ✅ Further customization
- ✅ Backend integration
- ✅ Production deployment

Happy cab renting! 🚖✨
