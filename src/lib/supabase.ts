import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize real client if keys are present
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// --- Mock / Simulated Supabase Database Database Layer ---
// This guarantees that the TripPilot AI SaaS works immediately out of the box locally and on Vercel without key setup.

interface MockUser {
  id: string;
  email: string;
  subscription_status: 'Free' | 'Pro' | 'Enterprise';
  created_at: string;
}

interface MockTrip {
  id: string;
  user_id: string;
  title: string;
  start_location: string;
  destinations: string[];
  total_days: number;
  budget: number;
  travel_style: string;
  preferred_transport: string;
  vehicle_rental: boolean;
  summary: {
    totalDays: number;
    totalDistance: number;
    totalCost: number;
    bestPeriod: string;
  };
  itinerary: any[]; // day-wise
  budgetBreakdown: any;
  vehicleDetails: any;
  destinationsDetails: any[];
  packingList: any[];
  hiddenGems?: any[];
  weatherForecast?: any[];
  created_at: string;
}

const LOCAL_STORAGE_KEYS = {
  USER: 'trippilot_user',
  TRIPS: 'trippilot_trips',
  FEEDBACK: 'trippilot_feedback',
};

const getStoredUser = (): MockUser | null => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

const setStoredUser = (user: MockUser | null) => {
  if (user) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  }
};

const getStoredTrips = (): MockTrip[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.TRIPS);
  return data ? JSON.parse(data) : [];
};

const setStoredTrips = (trips: MockTrip[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.TRIPS, JSON.stringify(trips));
};

const getStoredFeedback = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.FEEDBACK);
  return data ? JSON.parse(data) : [];
};

const setStoredFeedback = (feedback: any[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.FEEDBACK, JSON.stringify(feedback));
};

// Seed initial data if empty
if (getStoredTrips().length === 0) {
  const demoTrip: MockTrip = {
    id: 'demo-leh-ladakh',
    user_id: 'guest-user-id',
    title: 'Trip to Leh-Ladakh & Himalayas',
    start_location: 'Ahmedabad',
    destinations: ['Delhi', 'Haridwar', 'Rishikesh', 'Kedarnath', 'Badrinath', 'Manali', 'Leh-Ladakh'],
    total_days: 18,
    budget: 60000,
    travel_style: 'Adventure',
    preferred_transport: 'Mixed',
    vehicle_rental: true,
    summary: {
      totalDays: 18,
      totalDistance: 2450,
      totalCost: 58500,
      bestPeriod: 'June to September'
    },
    itinerary: [
      {
        day: 1,
        title: 'Board train from Ahmedabad to Delhi',
        activities: ['Depart from Ahmedabad Junction railway station', 'Transit overnight by train to New Delhi (Ashram Express)'],
        transport: { type: 'Train', distance: 930, duration: '15 hrs' },
        hotel: { name: 'Train Sleeper / Premium Transit', price: 1200, rating: 4.2 }
      },
      {
        day: 2,
        title: 'Arrive in Delhi & Rent Bike',
        activities: ['Arrive at New Delhi Railway Station', 'Transfer to Karol Bagh to collect rented Himalayan 411cc bike', 'Evening ride around Connaught Place'],
        transport: { type: 'Bike', distance: 15, duration: '1 hr' },
        hotel: { name: 'Hotel Bloomroots Karol Bagh', price: 2200, rating: 4.4 }
      },
      {
        day: 3,
        title: 'Ride from Delhi to Haridwar',
        activities: ['Early morning start towards Haridwar via NH 58', 'Attend evening Ganga Aarti at Har Ki Pauri', 'Explore local temples and markets'],
        transport: { type: 'Bike', distance: 220, duration: '5.5 hrs' },
        hotel: { name: 'Ganga Lahari Hotel Haridwar', price: 3500, rating: 4.6 }
      },
      {
        day: 4,
        title: 'Haridwar to Rishikesh & Rafting',
        activities: ['Short scenic ride to Rishikesh', 'Check in and head to Shivpuri for 16km white water rafting', 'Evening cafe hopping near Laxman Jhula'],
        transport: { type: 'Bike', distance: 30, duration: '1 hr' },
        hotel: { name: 'Zostel Rishikesh', price: 1800, rating: 4.5 }
      },
      {
        day: 5,
        title: 'Rishikesh to Guptkashi (Kedarnath Base)',
        activities: ['Ride alongside the Ganges and Alaknanda rivers', 'Pass through Devprayag confluence', 'Check in at Guptkashi, register for Kedarnath Yatra'],
        transport: { type: 'Bike', distance: 185, duration: '6.5 hrs' },
        hotel: { name: 'Kedar Resort Guptkashi', price: 2800, rating: 4.1 }
      },
      {
        day: 6,
        title: 'Guptkashi to Gaurikund & Trek to Kedarnath',
        activities: ['Ride to Sonprayag/Gaurikund', 'Begin 16km trek up to Kedarnath Temple', 'Evening darshan at the holy shrine under snowpeaks'],
        transport: { type: 'Mixed', distance: 40, duration: '8 hrs trek' },
        hotel: { name: 'Kedarnath Temple Guest House', price: 2500, rating: 4.0 }
      },
      {
        day: 7,
        title: 'Kedarnath Descent & Ride to Pipalkoti',
        activities: ['Morning prayers at temple', 'Trek down to Gaurikund', 'Ride to Pipalkoti to prepare for Badrinath'],
        transport: { type: 'Bike', distance: 95, duration: '7 hrs' },
        hotel: { name: 'Hotel Mount View Pipalkoti', price: 2000, rating: 4.2 }
      },
      {
        day: 8,
        title: 'Pipalkoti to Badrinath & Joshimath',
        activities: ['Ride to Badrinath Temple', 'Bath in Tapt Kund hot springs and temple darshan', 'Visit Mana Village, the last Indian village', 'Stay in Joshimath'],
        transport: { type: 'Bike', distance: 110, duration: '4 hrs' },
        hotel: { name: 'The Himalayan Abode Joshimath', price: 3200, rating: 4.7 }
      },
      {
        day: 9,
        title: 'Joshimath to Karnaprayag',
        activities: ['Descent down the winding mountain loops', 'Stop at Karnaprayag (confluence of Alaknanda & Pindar rivers)', 'Rest and maintain bikes'],
        transport: { type: 'Bike', distance: 85, duration: '3 hrs' },
        hotel: { name: 'Riverview Tourist Lodge', price: 1600, rating: 4.0 }
      },
      {
        day: 10,
        title: 'Karnaprayag to Mandi (Long Transit)',
        activities: ['Drive through foothills connecting Uttarakhand to Himachal Pradesh', 'Scenic highway ride bypassing major cities', 'Arrive in Mandi for night rest'],
        transport: { type: 'Bike', distance: 340, duration: '10 hrs' },
        hotel: { name: 'Hotel Valley View Mandi', price: 2400, rating: 4.3 }
      },
      {
        day: 11,
        title: 'Mandi to Manali',
        activities: ['Leisurely ride to Manali via Beas River valley', 'Visit Hadimba Temple and Mall Road', 'Prepare permits for Leh-Ladakh highway ride'],
        transport: { type: 'Bike', distance: 110, duration: '3.5 hrs' },
        hotel: { name: 'Zostel Manali', price: 1800, rating: 4.6 }
      },
      {
        day: 12,
        title: 'Manali to Keylong via Atal Tunnel',
        activities: ['Cross the engineering marvel: Atal Tunnel', 'Enter Lahaul Valley with dry landscape', 'Rest at Keylong for acclimatization'],
        transport: { type: 'Bike', distance: 80, duration: '3 hrs' },
        hotel: { name: 'Hotel Dekyid Keylong', price: 2200, rating: 4.2 }
      },
      {
        day: 13,
        title: 'Keylong to Sarchu (Challenging Ride)',
        activities: ['Cross Baralacha La pass (16,040 ft)', 'Ride along Deepak Tal and Suraj Tal lakes', 'Camp at Sarchu in high altitude tents'],
        transport: { type: 'Bike', distance: 110, duration: '5 hrs' },
        hotel: { name: 'Sarchu Adventure Camps', price: 3000, rating: 4.1 }
      },
      {
        day: 14,
        title: 'Sarchu to Leh via Gata Loops',
        activities: ['Ride up the famous 21 Gata Loops hairpins', 'Cross Lachung La and Tanglang La (17,480 ft)', 'Arrive in Leh and enjoy dynamic local cuisines'],
        transport: { type: 'Bike', distance: 250, duration: '8 hrs' },
        hotel: { name: 'The Grand Dragon Ladakh', price: 6500, rating: 4.8 }
      },
      {
        day: 15,
        title: 'Leh local & Pangong Lake Excursion',
        activities: ['Ride to Pangong Tso Lake via Chang La pass', 'Observe the shifting colors of salt lake', 'Return to Leh for overnight stay'],
        transport: { type: 'Bike', distance: 220, duration: '7 hrs' },
        hotel: { name: 'The Grand Dragon Ladakh', price: 6500, rating: 4.8 }
      },
      {
        day: 16,
        title: 'Leh to Khardung La & Nubra Valley',
        activities: ['Ride up to Khardung La (17,582 ft) - world highest motorable pass', 'Descend to Hunder dunes, double-humped camel ride', 'Stay in Nubra Valley'],
        transport: { type: 'Bike', distance: 125, duration: '4.5 hrs' },
        hotel: { name: 'Nubra Organic Retreat', price: 3800, rating: 4.5 }
      },
      {
        day: 17,
        title: 'Nubra Valley back to Leh & Drop Bike',
        activities: ['Ride back to Leh via alternative scenic tracks', 'Drop off the rented motorcycle', 'Evening flight booking confirmations'],
        transport: { type: 'Bike', distance: 125, duration: '4.5 hrs' },
        hotel: { name: 'Zostel Leh', price: 1500, rating: 4.4 }
      },
      {
        day: 18,
        title: 'Fly Leh to Ahmedabad (via Delhi)',
        activities: ['Morning flight from Kushok Bakula Rimpochee Airport to Delhi', 'Connecting flight or train back to Ahmedabad home'],
        transport: { type: 'Flight', distance: 1100, duration: '6 hrs' },
        hotel: { name: 'Home Sweet Home', price: 0, rating: 5.0 }
      }
    ],
    budgetBreakdown: {
      flights: 8500,
      trains: 2500,
      rental: 18000,
      fuel: 9500,
      hotel: 12000,
      food: 6000,
      permits: 1000,
      attractions: 1000,
      buffer: 3000
    },
    vehicleDetails: {
      suggestedVehicle: 'Royal Enfield Himalayan 411cc',
      rentalPerDay: 1200,
      totalRentalDays: 15,
      fuelEfficiency: '30 km/l',
      fuelPrice: 105,
      estimatedFuelLitres: 90,
      totalFuelCost: 9450
    },
    destinationsDetails: [
      { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, attractions: ['Sabarmati Ashram', 'Adalaj Stepwell'], temp: '34°C', rain: '10%' },
      { name: 'Delhi', lat: 28.6139, lng: 77.2090, attractions: ['India Gate', 'Red Fort', 'Qutub Minar'], temp: '38°C', rain: '20%' },
      { name: 'Haridwar', lat: 29.9457, lng: 78.1642, attractions: ['Har Ki Pauri', 'Chandi Devi Temple'], temp: '32°C', rain: '35%' },
      { name: 'Rishikesh', lat: 30.0869, lng: 78.2676, attractions: ['Laxman Jhula', 'Triveni Ghat', 'Beatles Ashram'], temp: '30°C', rain: '40%' },
      { name: 'Kedarnath', lat: 30.7352, lng: 79.0669, attractions: ['Kedarnath Temple', 'Bhairav Temple'], temp: '8°C', rain: '65%' },
      { name: 'Badrinath', lat: 30.7433, lng: 79.4938, attractions: ['Badrinath Temple', 'Tapt Kund', 'Mana Village'], temp: '10°C', rain: '60%' },
      { name: 'Manali', lat: 32.2396, lng: 77.1887, attractions: ['Solang Valley', 'Hadimba Temple', 'Jogini Waterfall'], temp: '20°C', rain: '50%' },
      { name: 'Leh-Ladakh', lat: 34.1526, lng: 77.5771, attractions: ['Leh Palace', 'Shanti Stupa', 'Magnetic Hill', 'Pangong Tso'], temp: '15°C', rain: '5%' }
    ],
    packingList: [
      { category: 'Clothing', items: ['Thermal innerwear (3 sets)', 'Windproof riding jacket & pants', 'Fleece sweaters (2)', 'Sturdy hiking shoes', 'Woolen socks (5 pairs)', 'Balaclava & riding gloves'] },
      { category: 'Documents', items: ['Aadhaar Card / Passport (original & copies)', 'Driving License (Motorcycle with gear)', 'Leh Inner Line Permits (ILP)', 'Passport size photos (4)'] },
      { category: 'Bike Essentials', items: ['Bungee cords & luggage nets', 'Basic tools (spanner, chain lube)', 'Spare tube & spark plug', 'Gopro or action camera mounts'] },
      { category: 'Medical', items: ['Diamox (for acute mountain sickness)', 'Painkillers & band-aids', 'ORS packets & rehydration tablets', 'Sunscreen SPF 50+ & lip balm'] }
    ],
    created_at: new Date().toISOString()
  };
  setStoredTrips([demoTrip]);
}

// Simulated Client Functions
export const mockDb = {
  // Auth Functions
  auth: {
    getUser: async () => {
      const user = getStoredUser();
      if (!user) return { data: { user: null }, error: null };
      return { data: { user: { id: user.id, email: user.email, user_metadata: { subscription_status: user.subscription_status } } }, error: null };
    },
    signUp: async ({ email, password }: any) => {
      const usersList = JSON.parse(localStorage.getItem('trippilot_all_users') || '[]');
      if (usersList.some((u: any) => u.email === email)) {
        return { data: null, error: { message: 'User already exists' } };
      }
      const newUser: MockUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        subscription_status: 'Free',
        created_at: new Date().toISOString()
      };
      usersList.push({ email, password, profile: newUser });
      localStorage.setItem('trippilot_all_users', JSON.stringify(usersList));
      setStoredUser(newUser);
      return { data: { user: { id: newUser.id, email: newUser.email, user_metadata: { subscription_status: newUser.subscription_status } } }, error: null };
    },
    signInWithPassword: async ({ email, password }: any) => {
      const usersList = JSON.parse(localStorage.getItem('trippilot_all_users') || '[]');
      const match = usersList.find((u: any) => u.email === email && u.password === password);
      if (!match) {
        // Fallback convenience: Auto-register or allow guest login
        if (email.startsWith('demo') || email === 'admin@trippilot.ai' || email === 'user@trippilot.ai') {
          const guestUser: MockUser = {
            id: email === 'admin@trippilot.ai' ? 'admin-user-id' : 'guest-user-id',
            email,
            subscription_status: email === 'admin@trippilot.ai' ? 'Enterprise' : 'Free',
            created_at: new Date().toISOString()
          };
          setStoredUser(guestUser);
          return { data: { user: { id: guestUser.id, email: guestUser.email, user_metadata: { subscription_status: guestUser.subscription_status } } }, error: null };
        }
        return { data: null, error: { message: 'Invalid login credentials' } };
      }
      setStoredUser(match.profile);
      return { data: { user: { id: match.profile.id, email: match.profile.email, user_metadata: { subscription_status: match.profile.subscription_status } } }, error: null };
    },
    signOut: async () => {
      setStoredUser(null);
      return { error: null };
    },
    signInWithOAuth: async ({ provider }: any) => {
      // Simulate Google Login redirection
      const googleUser: MockUser = {
        id: 'google-oauth-user-id',
        email: 'google.user@gmail.com',
        subscription_status: 'Free',
        created_at: new Date().toISOString()
      };
      setStoredUser(googleUser);
      return { data: { provider, url: '#' }, error: null };
    },
    resetPasswordForEmail: async (email: string) => {
      return { data: {}, error: null };
    }
  },

  // Trips Database Functions
  trips: {
    list: async () => {
      const user = getStoredUser();
      const trips = getStoredTrips();
      // If user logged in, filter by user. Otherwise return all
      const filtered = user ? trips.filter(t => t.user_id === user.id || t.user_id === 'guest-user-id') : trips;
      return { data: filtered, error: null };
    },
    get: async (id: string) => {
      const trips = getStoredTrips();
      const trip = trips.find(t => t.id === id);
      if (!trip) return { data: null, error: { message: 'Trip not found' } };
      return { data: trip, error: null };
    },
    create: async (tripData: Omit<MockTrip, 'id' | 'user_id' | 'created_at'>) => {
      const user = getStoredUser();
      const trips = getStoredTrips();
      const newTrip: MockTrip = {
        ...tripData,
        id: 'trip_' + Math.random().toString(36).substring(2, 9),
        user_id: user?.id || 'guest-user-id',
        created_at: new Date().toISOString()
      };
      trips.push(newTrip);
      setStoredTrips(trips);
      
      // Log for Admin API analytics
      mockDb.admin.logApiCall('Generate Trip Itinerary');
      
      return { data: newTrip, error: null };
    },
    update: async (id: string, updates: Partial<MockTrip>) => {
      const trips = getStoredTrips();
      const index = trips.findIndex(t => t.id === id);
      if (index === -1) return { data: null, error: { message: 'Trip not found' } };
      trips[index] = { ...trips[index], ...updates } as MockTrip;
      setStoredTrips(trips);
      return { data: trips[index], error: null };
    },
    duplicate: async (id: string) => {
      const trips = getStoredTrips();
      const trip = trips.find(t => t.id === id);
      if (!trip) return { data: null, error: { message: 'Trip not found' } };
      const duplicated: MockTrip = {
        ...trip,
        id: 'trip_' + Math.random().toString(36).substring(2, 9),
        title: `${trip.title} (Copy)`,
        created_at: new Date().toISOString()
      };
      trips.push(duplicated);
      setStoredTrips(trips);
      return { data: duplicated, error: null };
    },
    delete: async (id: string) => {
      const trips = getStoredTrips();
      const filtered = trips.filter(t => t.id !== id);
      setStoredTrips(filtered);
      return { data: true, error: null };
    }
  },

  // Subscription Billing
  subscriptions: {
    updatePlan: async (plan: 'Free' | 'Pro' | 'Enterprise') => {
      const user = getStoredUser();
      if (!user) return { error: { message: 'Must be logged in' } };
      user.subscription_status = plan;
      setStoredUser(user);
      
      // Update users list database
      const usersList = JSON.parse(localStorage.getItem('trippilot_all_users') || '[]');
      const uIndex = usersList.findIndex((u: any) => u.profile.id === user.id);
      if (uIndex !== -1) {
        usersList[uIndex].profile.subscription_status = plan;
        localStorage.setItem('trippilot_all_users', JSON.stringify(usersList));
      }
      
      // Log revenue metric
      const revenue = plan === 'Pro' ? 19 : plan === 'Enterprise' ? 49 : 0;
      if (revenue > 0) {
        const sales = JSON.parse(localStorage.getItem('trippilot_revenue_sales') || '[]');
        sales.push({ date: new Date().toLocaleDateString(), plan, amount: revenue });
        localStorage.setItem('trippilot_revenue_sales', JSON.stringify(sales));
      }
      
      return { data: user, error: null };
    }
  },

  // Feedback Management
  feedback: {
    submit: async (rating: number, comments: string) => {
      const user = getStoredUser();
      const feedbackList = getStoredFeedback();
      const newFeedback = {
        id: Math.random().toString(36).substring(2, 9),
        user_email: user?.email || 'anonymous@gmail.com',
        rating,
        comments,
        created_at: new Date().toISOString()
      };
      feedbackList.push(newFeedback);
      setStoredFeedback(feedbackList);
      return { data: newFeedback, error: null };
    },
    list: async () => {
      return { data: getStoredFeedback(), error: null };
    }
  },

  // Admin Analytics & Usage Details
  admin: {
    getStats: async () => {
      const usersList = JSON.parse(localStorage.getItem('trippilot_all_users') || '[]');
      const trips = getStoredTrips();
      const feedback = getStoredFeedback();
      const sales = JSON.parse(localStorage.getItem('trippilot_revenue_sales') || '[]');
      const apiCalls = JSON.parse(localStorage.getItem('trippilot_api_logs') || '[]');
      
      const revenueTotal = sales.reduce((sum: number, s: any) => sum + s.amount, 0);

      return {
        usersCount: usersList.length + 1, // Add current active guest
        tripsCount: trips.length,
        feedbackCount: feedback.length,
        revenue: revenueTotal,
        sales,
        apiCalls,
        feedbackList: feedback
      };
    },
    logApiCall: (action: string) => {
      const logs = JSON.parse(localStorage.getItem('trippilot_api_logs') || '[]');
      logs.push({
        id: Math.random().toString(36).substring(2, 9),
        action,
        timestamp: new Date().toLocaleTimeString(),
        cost: 0.02 // average OpenAI API call cost simulation
      });
      localStorage.setItem('trippilot_api_logs', JSON.stringify(logs.slice(-20))); // Keep last 20
    }
  }
};
