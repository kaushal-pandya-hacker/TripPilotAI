import { OpenAI } from 'openai';
// Initialize dynamic OpenAI client if key is available
export function getOpenAIClient(customKey) {
    const apiKey = customKey || process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
        return new OpenAI({ apiKey });
    }
    return null;
}
// Semantic Rule Engine: Pre-compiled premium templates for immediate mock support
export function generateOfflineItinerary(params) {
    const start = params.start_location || 'Ahmedabad';
    const destList = params.destinations || ['Delhi', 'Leh-Ladakh'];
    const days = Number(params.total_days) || 10;
    const budget = Number(params.budget) || 40000;
    const style = params.travel_style || 'Adventure';
    const transport = params.preferred_transport || 'Mixed';
    const rental = params.vehicle_rental || false;
    // Detect the user's specific complex Leh-Ladakh trip query
    const includesLeh = destList.some((d) => d.toLowerCase().includes('leh') || d.toLowerCase().includes('ladakh'));
    const includesKedar = destList.some((d) => d.toLowerCase().includes('kedar'));
    if (includesLeh && includesKedar && days >= 14) {
        // Generate the user's 18-day epic itinerary (Ahmedabad - Delhi - Kedarnath - Badrinath - Manali - Leh - etc.)
        return getLehKedarEpicPreset(start, destList, days, budget, style, transport, rental);
    }
    // Fallback Dynamic generator for other queries
    return getDynamicGeneratedPreset(start, destList, days, budget, style, transport, rental);
}
// Express backend interface to trigger AI or mock
export async function generateItinerary(params, customKey) {
    const client = getOpenAIClient(customKey);
    if (client) {
        try {
            const prompt = `
        You are TripPilot AI, a production-ready world-class travel planner.
        Generate a complete travel itinerary in strict JSON format based on the following parameters:
        - Start Location: ${params.start_location}
        - Destinations: ${JSON.stringify(params.destinations)}
        - Total Days: ${params.total_days}
        - Budget: INR ${params.budget}
        - Travel Style: ${params.travel_style}
        - Preferred Transport: ${params.preferred_transport}
        - Need Vehicle Rental: ${params.vehicle_rental}
        - Food Preferences: ${params.food_preference || 'No specific preference'}
        - Driving Limit: ${params.driving_hours || 6} hours/day
        
        The JSON response MUST match this structure exactly, with no markdown styling outside the JSON block:
        {
          "title": "String",
          "start_location": "String",
          "destinations": ["String"],
          "total_days": Number,
          "budget": Number,
          "travel_style": "String",
          "preferred_transport": "String",
          "vehicle_rental": Boolean,
          "summary": { "totalDays": Number, "totalDistance": Number, "totalCost": Number, "bestPeriod": "String" },
          "itinerary": [
            { "day": Number, "title": "String", "activities": ["String"], "transport": { "type": "String", "distance": Number, "duration": "String" }, "hotel": { "name": "String", "price": Number, "rating": Number } }
          ],
          "budgetBreakdown": { "flights": Number, "trains": Number, "rental": Number, "fuel": Number, "hotel": Number, "food": Number, "permits": Number, "attractions": Number, "buffer": Number },
          "vehicleDetails": { "suggestedVehicle": "String", "rentalPerDay": Number, "totalRentalDays": Number, "fuelEfficiency": "String", "fuelPrice": Number, "estimatedFuelLitres": Number, "totalFuelCost": Number },
          "destinationsDetails": [
            { "name": "String", "lat": Number, "lng": Number, "attractions": ["String"], "temp": "String", "rain": "String" }
          ],
          "packingList": [
            { "category": "String", "items": ["String"] }
          ],
          "hiddenGems": [
            { "destination": "String", "title": "String", "description": "String", "type": "String" }
          ],
          "weatherForecast": [
            { "day": Number, "temp": "String", "rainProb": "String", "warning": "String" }
          ]
        }
        
        Ensure calculations are correct. If bike/car rental is checked, calculate fuel costs based on distance. Make sure destinationsDetails contain authentic latitude and longitude values so the map can render them.
      `;
            const response = await client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' }
            });
            const resultText = response.choices[0].message.content || '{}';
            return JSON.parse(resultText);
        }
        catch (e) {
            console.warn("OpenAI API call failed, falling back to Local Rule Engine:", e);
            return generateOfflineItinerary(params);
        }
    }
    else {
        // Return offline mock
        return generateOfflineItinerary(params);
    }
}
// Quick edit prompt builder
export async function editItinerary(currentItinerary, message, customKey) {
    const command = message.toLowerCase();
    const client = getOpenAIClient(customKey);
    if (!client) {
        const updated = JSON.parse(JSON.stringify(currentItinerary));
        if (command.includes('cheaper') || command.includes('reduce budget') || command.includes('less budget')) {
            // Modify budget details
            updated.budgetBreakdown.hotel = Math.round(updated.budgetBreakdown.hotel * 0.6);
            updated.budgetBreakdown.food = Math.round(updated.budgetBreakdown.food * 0.8);
            updated.budgetBreakdown.rental = Math.round(updated.budgetBreakdown.rental * 0.7);
            updated.summary.totalCost = Object.values(updated.budgetBreakdown).reduce((a, b) => a + b, 0);
            // Update hotel classes in daily itinerary
            updated.itinerary.forEach(d => {
                d.hotel.name = 'Budget Guest House / Backpackers';
                d.hotel.price = Math.round(d.hotel.price * 0.6);
            });
            updated.title = `${updated.title} (Budget Optimized)`;
        }
        else if (command.includes('goa')) {
            // Append Goa to destinations & adjust days/itinerary
            updated.destinations.push('Goa');
            updated.destinationsDetails.push({
                name: 'Goa',
                lat: 15.2993,
                lng: 74.1240,
                attractions: ['Calangute Beach', 'Basilica of Bom Jesus', 'Dudhsagar Falls'],
                temp: '29°C',
                rain: '70%'
            });
            // Add extra day
            const lastDay = updated.itinerary.length;
            updated.itinerary.push({
                day: lastDay + 1,
                title: 'Transit to Goa beaches',
                activities: ['Arrive at Dabolim Airport in Goa', 'Check into beach resort', 'Evening walk around Vagator Beach and sunset views'],
                transport: { type: 'Flight', distance: 600, duration: '2 hrs' },
                hotel: { name: 'Resort de Goa Calangute', price: 4500, rating: 4.5 }
            });
            updated.total_days += 1;
            updated.summary.totalDays += 1;
            updated.summary.totalCost += 7500;
            updated.budgetBreakdown.flights += 3000;
            updated.budgetBreakdown.hotel += 4500;
        }
        else if (command.includes('train')) {
            updated.preferred_transport = 'Train';
            updated.itinerary.forEach(d => {
                if (d.transport.type === 'Flight' || d.transport.type === 'Bike') {
                    d.transport.type = 'Train';
                }
            });
            updated.budgetBreakdown.flights = 0;
            updated.budgetBreakdown.trains += 4000;
            updated.summary.totalCost = Object.values(updated.budgetBreakdown).reduce((a, b) => a + b, 0);
        }
        else if (command.includes('upgrade') || command.includes('expensive') || command.includes('luxury')) {
            updated.budgetBreakdown.hotel = Math.round(updated.budgetBreakdown.hotel * 2.2);
            updated.summary.totalCost = Object.values(updated.budgetBreakdown).reduce((a, b) => a + b, 0);
            updated.itinerary.forEach(d => {
                d.hotel.name = `Grand Palace Luxury Hotel & Spa`;
                d.hotel.price = Math.round(d.hotel.price * 2.2);
                d.hotel.rating = 4.9;
            });
            updated.title = `${updated.title} (Luxury Upgrade)`;
        }
        else if (command.includes('night')) {
            // Modify warning tags
            updated.weatherForecast.forEach(wf => {
                if (wf.warning) {
                    wf.warning = wf.warning + " & Strictly avoid driving after sunset.";
                }
                else {
                    wf.warning = "Strictly avoid driving after sunset.";
                }
            });
        }
        return updated;
    }
    // Real OpenAI edit logic
    try {
        const editPrompt = `
      You are TripPilot AI. Here is the current travel itinerary in JSON format:
      ${JSON.stringify(currentItinerary)}
      
      The user wants to make this modification: "${message}"
      
      Apply this request immediately. Output the FULL modified itinerary in the same JSON format.
      Make sure to keep maps coordinates (lat, lng), day breakdown, and budget sync correct.
    `;
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: editPrompt }],
            response_format: { type: 'json_object' }
        });
        return JSON.parse(response.choices[0].message.content || '{}');
    }
    catch (e) {
        console.warn("OpenAI API editing failed:", e);
        return currentItinerary;
    }
}
// Local offline chatbot answers
function getOfflineChatResponse(message) {
    const query = message.toLowerCase();
    if (query.includes('kedarnath') || query.includes('badrinath')) {
        return "Trekking to Kedarnath requires proper physical conditioning. The 16km trail from Gaurikund features oxygen drops. Make sure to pack heavy thermals, altitude medicines (like Diamox), rain covers, and register online for your Yatra pass. Visit Badrinath by road; the highway is scenic but watch for landslips near Joshimath.";
    }
    else if (query.includes('leh') || query.includes('ladakh') || query.includes('pass')) {
        return "The Manali-Leh Highway (NH3) usually opens from early June to September. You will cross high passes like Baralacha La (16,040 ft) and Tanglang La (17,480 ft). Acclimatization in Leh is highly recommended for 48 hours before climbing to Khardung La. Check tire treads and carry spare tubes for motorcycle trips.";
    }
    else if (query.includes('rishikesh') || query.includes('haridwar')) {
        return "Rishikesh is the Yoga capital. Try river rafting from Shivpuri (16km is standard). Don't miss attending the divine evening Ganga Aarti at Parmarth Niketan or walking the Laxman Jhula. For local food, check out Chotiwala Restaurant near Ram Jhula.";
    }
    else if (query.includes('packing') || query.includes('pack')) {
        return "Himalayan travel packing essentials: (1) Windproof riding jacket & rain gear, (2) 3 layers of thermal innerwear, (3) Polarized sunglasses to prevent snow blindness, (4) Power banks since cold temperatures drain phone batteries quickly, (5) Cash, since network connections are sparse near high mountain passes.";
    }
    return "I can help you plan that! For full route optimizations and budget sheets, please start a 'New Trip' from the sidebar Explorer Panel.";
}
// AI Advisor general Chat endpoint
export async function generalChat(message, history, customKey) {
    const client = getOpenAIClient(customKey);
    if (client) {
        try {
            const messages = [
                { role: 'system', content: 'You are TripPilot AI, a world-class travel advisor assistant. Help the user with travel inquiries including itineraries, routes, safety tips, destination recommendations, packing lists, and details on local culture. Keep your response helpful, concise, well-structured, and markdown-formatted.' },
                ...history.map(h => ({ role: h.role, content: h.content })),
                { role: 'user', content: message }
            ];
            const response = await client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: messages
            });
            return { text: response.choices[0].message.content || '' };
        }
        catch (e) {
            console.warn("OpenAI general chat API failed, using fallback:", e);
            return { text: getOfflineChatResponse(message) };
        }
    }
    return { text: getOfflineChatResponse(message) };
}
// Preset generator for 18 days Leh & Kedarnath
function getLehKedarEpicPreset(start, destinations, days, budget, style, transport, rental) {
    return {
        title: 'Epic Himalayan Adventure: Ahmedabad to Leh-Ladakh & Char Dham',
        start_location: start,
        destinations: ['Delhi', 'Haridwar', 'Rishikesh', 'Kedarnath', 'Badrinath', 'Manali', 'Leh-Ladakh'],
        total_days: 18,
        budget: budget,
        travel_style: style,
        preferred_transport: transport,
        vehicle_rental: rental,
        summary: {
            totalDays: 18,
            totalDistance: 2850,
            totalCost: 58500,
            bestPeriod: 'June to September'
        },
        itinerary: [
            {
                day: 1,
                title: 'Board train from Ahmedabad to Delhi',
                activities: ['Depart Ahmedabad Junction by Ashram Express', 'Transit overnight across Rajasthan', 'Prepare trekking and riding gears'],
                transport: { type: 'Train', distance: 930, duration: '15 hrs' },
                hotel: { name: 'Train Sleeper / Premium Transit', price: 1200, rating: 4.2 }
            },
            {
                day: 2,
                title: 'Arrive in Delhi & Rent Bike',
                activities: ['Arrive at New Delhi Station in morning', 'Collect rented Royal Enfield Himalayan 411cc from Karol Bagh', 'Perform gear check and local test ride'],
                transport: { type: 'Bike', distance: 15, duration: '1 hr' },
                hotel: { name: 'Hotel Bloomroots Karol Bagh', price: 2200, rating: 4.4 }
            },
            {
                day: 3,
                title: 'Ride Delhi to Haridwar via NH 58',
                activities: ['Early start bypassing Meerut and Muzaffarnagar', 'Reach Haridwar by afternoon', 'Witness Ganga Aarti at Har Ki Pauri ghat'],
                transport: { type: 'Bike', distance: 220, duration: '5.5 hrs' },
                hotel: { name: 'Ganga Lahari Hotel Haridwar', price: 3200, rating: 4.6 }
            },
            {
                day: 4,
                title: 'Explore Rishikesh Adventure Hub',
                activities: ['Scenic ride along the Ganges river to Rishikesh', 'Experience 16km White Water Rafting from Shivpuri', 'Walk Laxman Jhula and cafe hop in evening'],
                transport: { type: 'Bike', distance: 30, duration: '1 hr' },
                hotel: { name: 'Zostel Rishikesh', price: 1800, rating: 4.5 }
            },
            {
                day: 5,
                title: 'Ride Rishikesh to Guptkashi (Kedarnath Base)',
                activities: ['Mountain ride along Alaknanda river via Devprayag', 'Witness Rudraprayag confluence', 'Check in at Guptkashi camp for registration'],
                transport: { type: 'Bike', distance: 185, duration: '6.5 hrs' },
                hotel: { name: 'Kedar Resort Guptkashi', price: 2800, rating: 4.1 }
            },
            {
                day: 6,
                title: 'Guptkashi to Gaurikund & Trek to Kedarnath Temple',
                activities: ['Early ride to Gaurikund', 'Begin 16km scenic trek up to Kedarnath Temple', 'Perform evening temple darshan under stars'],
                transport: { type: 'Mixed', distance: 40, duration: '8 hrs' },
                hotel: { name: 'Kedarnath Temple Guest House', price: 2500, rating: 4.0 }
            },
            {
                day: 7,
                title: 'Descend to Gaurikund & Ride to Pipalkoti',
                activities: ['Morning prayers at Kedarnath Temple', 'Trek down to Gaurikund base', 'Ride to Pipalkoti to prepare for Badrinath'],
                transport: { type: 'Bike', distance: 95, duration: '7 hrs' },
                hotel: { name: 'Hotel Mount View Pipalkoti', price: 2000, rating: 4.2 }
            },
            {
                day: 8,
                title: 'Ride Pipalkoti to Badrinath & Joshimath',
                activities: ['Climb to Badrinath temple (10,170 ft)', 'Bathe in holy Tapt Kund hot water springs', 'Explore Mana, the Last Indian Village, then return to Joshimath'],
                transport: { type: 'Bike', distance: 110, duration: '4 hrs' },
                hotel: { name: 'The Himalayan Abode Joshimath', price: 3200, rating: 4.7 }
            },
            {
                day: 9,
                title: 'Joshimath to Karnaprayag',
                activities: ['Winding road descent along gorges', 'Enjoy local Garhwali lunch near Alaknanda river', 'Check tires and chain kit on motorcycles'],
                transport: { type: 'Bike', distance: 85, duration: '3 hrs' },
                hotel: { name: 'Riverview Tourist Lodge', price: 1600, rating: 4.0 }
            },
            {
                day: 10,
                title: 'Karnaprayag to Mandi (Himachal link)',
                activities: ['Long transit day connecting Uttarakhand and Himachal', 'Pass through beautiful alpine valleys and remote villages', 'Stay at Mandi for overnight sleep'],
                transport: { type: 'Bike', distance: 340, duration: '10 hrs' },
                hotel: { name: 'Hotel Valley View Mandi', price: 2400, rating: 4.3 }
            },
            {
                day: 11,
                title: 'Mandi to Manali',
                activities: ['Ride along Beas River and cross Aut Tunnel', 'Relax in Old Manali, visit Solang valley', 'Procure Leh Ladakh Inner Line permits'],
                transport: { type: 'Bike', distance: 110, duration: '3.5 hrs' },
                hotel: { name: 'Zostel Manali', price: 1800, rating: 4.6 }
            },
            {
                day: 12,
                title: 'Cross Atal Tunnel to Keylong',
                activities: ['Cross the historic 9.02km Atal Tunnel', 'Enter Lahaul valley dry cold desert', 'Walk around Keylong to adapt to elevation'],
                transport: { type: 'Bike', distance: 80, duration: '3 hrs' },
                hotel: { name: 'Hotel Dekyid Keylong', price: 2200, rating: 4.2 }
            },
            {
                day: 13,
                title: 'Keylong to Sarchu High-Altitude Camps',
                activities: ['Cross Baralacha La pass (16,040 ft)', 'Stop by scenic emerald Deepak Tal lake', 'Stay in comfortable swiss tents at Sarchu'],
                transport: { type: 'Bike', distance: 110, duration: '5 hrs' },
                hotel: { name: 'Sarchu Adventure Camps', price: 3000, rating: 4.1 }
            },
            {
                day: 14,
                title: 'Sarchu to Leh via Gata Loops',
                activities: ['Negotiate 21 hairpin loops of Gata Loops', 'Cross Nakee La and Tanglang La passes', 'Arrive in Leh and celebrate completion of highway'],
                transport: { type: 'Bike', distance: 250, duration: '8 hrs' },
                hotel: { name: 'The Grand Dragon Ladakh', price: 6500, rating: 4.8 }
            },
            {
                day: 15,
                title: 'Leh Local Exploration & Shanti Stupa',
                activities: ['Visit Leh Palace, Spituk Monastery', 'Watch sunset from Shanti Stupa', 'Stroll around Leh Main Bazar for souvenirs'],
                transport: { type: 'Bike', distance: 30, duration: '1 hr' },
                hotel: { name: 'The Grand Dragon Ladakh', price: 6500, rating: 4.8 }
            },
            {
                day: 16,
                title: 'Ride Leh to Khardung La & Nubra Valley',
                activities: ['Ascend to Khardung La (17,582 ft) for snow photographs', 'Descend to Hunder cold desert dunes', 'Enjoy Bactrian double-humped camel safari'],
                transport: { type: 'Bike', distance: 125, duration: '4.5 hrs' },
                hotel: { name: 'Nubra Organic Retreat', price: 3800, rating: 4.5 }
            },
            {
                day: 17,
                title: 'Nubra to Pangong Tso Lake via Shyok Route',
                activities: ['Drive along fast flowing Shyok river', 'Reach deep blue Pangong Saltwater Lake', 'Overnight stay in wooden cottage at lake-shore'],
                transport: { type: 'Bike', distance: 150, duration: '5.5 hrs' },
                hotel: { name: 'Pangong Lake View Cottage', price: 3400, rating: 4.3 }
            },
            {
                day: 18,
                title: 'Pangong to Leh & Fly Home to Ahmedabad',
                activities: ['Ride back to Leh via Chang La pass', 'Return rented bikes at Karol Bagh partners', 'Board evening flight Leh to Ahmedabad (via Delhi)'],
                transport: { type: 'Flight', distance: 1100, duration: '6 hrs' },
                hotel: { name: 'Home Sweet Home', price: 0, rating: 5.0 }
            }
        ],
        budgetBreakdown: {
            flights: 11500,
            trains: 2200,
            rental: 16800,
            fuel: 9400,
            hotel: 11000,
            food: 5500,
            permits: 1100,
            attractions: 1000,
            buffer: 0 // adjust to exactly fit budget or buffer
        },
        vehicleDetails: {
            suggestedVehicle: 'Royal Enfield Himalayan 411cc / KTM Adv 390',
            rentalPerDay: 1200,
            totalRentalDays: 14,
            fuelEfficiency: '28 km/l',
            fuelPrice: 105,
            estimatedFuelLitres: 89,
            totalFuelCost: 9345
        },
        destinationsDetails: [
            { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, attractions: ['Adalaj Stepwell', 'Calico Museum'], temp: '33°C', rain: '12%' },
            { name: 'Delhi', lat: 28.6139, lng: 77.2090, attractions: ['Connaught Place', 'Karol Bagh Market'], temp: '36°C', rain: '20%' },
            { name: 'Haridwar', lat: 29.9457, lng: 78.1642, attractions: ['Har Ki Pauri Ganga Aarti', 'Mansa Devi Temple'], temp: '32°C', rain: '30%' },
            { name: 'Rishikesh', lat: 30.0869, lng: 78.2676, attractions: ['Ram Jhula rafting', 'Beatles Ashram'], temp: '30°C', rain: '45%' },
            { name: 'Kedarnath', lat: 30.7352, lng: 79.0669, attractions: ['Ancient Kedarnath Shrine', 'Mandakini River valley'], temp: '7°C', rain: '60%' },
            { name: 'Badrinath', lat: 30.7433, lng: 79.4938, attractions: ['Alaknanda River origin', 'Vyas Gufa Mana'], temp: '9°C', rain: '55%' },
            { name: 'Manali', lat: 32.2396, lng: 77.1887, attractions: ['Old Manali Cafes', 'Solang Valley paragliding'], temp: '19°C', rain: '48%' },
            { name: 'Leh-Ladakh', lat: 34.1526, lng: 77.5771, attractions: ['Pangong Tso', 'Khardung La Pass', 'Hunder Camel Desert'], temp: '14°C', rain: '4%' }
        ],
        packingList: [
            { category: 'Riding & Warm Gear', items: ['Heavy waterproof riding jacket', 'Thermal inners (3 pairs)', 'Fleece jacket', 'Riding pants & boots'] },
            { category: 'Safety & Tools', items: ['Bungee straps', 'Chain lube & cleaner', 'Spare headlight bulb', 'Helmet with action camera mount'] },
            { category: 'Medicals', items: ['Diamox altitude tablets', 'Pain relief spray', 'Sunscreen lotion SPF 50', 'Bandages & ORS'] },
            { category: 'Documents', items: ['Original Driving License', 'Aadhaar Card with 5 photocopies', 'Inner Line Permit printouts'] }
        ],
        hiddenGems: [
            { destination: 'Rishikesh', title: 'Secret Ganga Beach near Shivpuri', description: 'White sand cove hidden from normal crowds, accessible via a short trail.', type: 'scenic' },
            { destination: 'Kedarnath', title: 'Bhairav Temple Viewpoint', description: 'A 1km steep walk above Kedarnath offering a full panoramic bird-eye view of the temple valley.', type: 'viewpoint' },
            { destination: 'Manali', title: 'Jogini Waterfalls Trail', description: 'Scenic forest walk leading to cascading water pools, famous for photography.', type: 'photo' },
            { destination: 'Leh-Ladakh', title: 'Double Hump Camels in Hunder', description: 'Unique cultural experience with historic camels along Silk Route tracks.', type: 'culture' }
        ],
        weatherForecast: [
            { day: 1, temp: '35°C', rainProb: '10%' },
            { day: 5, temp: '30°C', rainProb: '45%' },
            { day: 6, temp: '6°C', rainProb: '60%', warning: 'Extreme cold in high altitudes. Carry thermals.' },
            { day: 13, temp: '4°C', rainProb: '25%', warning: 'Sub-zero night temperatures expected at Sarchu.' },
            { day: 16, temp: '12°C', rainProb: '10%' }
        ]
    };
}
// Dynamic presets for other locations
function getDynamicGeneratedPreset(start, destinations, days, budget, style, transport, rental) {
    // Center coordinates for map (default to Delhi coordinates if list is empty)
    const coords = [
        { name: start, lat: 23.0, lng: 72.5 },
        ...destinations.map((d, i) => ({
            name: d,
            lat: 25.0 + (i * 2.0) + (Math.random() - 0.5),
            lng: 75.0 + (i * 2.5) + (Math.random() - 0.5)
        }))
    ];
    const totalDistance = destinations.length * 250 + 100;
    const flightsCost = transport === 'Flight' ? 12000 : 0;
    const trainCost = transport === 'Train' ? 2500 : 0;
    const hotelDaily = Math.round(budget * 0.3 / days);
    const foodDaily = Math.round(budget * 0.2 / days);
    const budgetBreakdown = {
        flights: flightsCost,
        trains: trainCost,
        rental: rental ? days * 1100 : 0,
        fuel: rental ? Math.round(totalDistance * 3.5) : 0,
        hotel: hotelDaily * days,
        food: foodDaily * days,
        permits: 800,
        attractions: 1500,
        buffer: Math.round(budget * 0.1)
    };
    const totalCalculated = Object.values(budgetBreakdown).reduce((sum, val) => sum + val, 0);
    // Day list
    const itinerary = Array.from({ length: days }).map((_, i) => {
        const fromCity = i === 0 ? start : destinations[Math.min(i - 1, destinations.length - 1)];
        const toCity = destinations[Math.min(i, destinations.length - 1)];
        return {
            day: i + 1,
            title: i === 0 ? `Depart from ${start} to ${toCity}` : `Explore sights in ${toCity}`,
            activities: [
                `Morning checking and travel planning briefs.`,
                `Visit famous local viewpoints and historical landmarks around ${toCity}.`,
                `Evening market walking tour, dinner featuring native traditional recipes.`
            ],
            transport: {
                type: transport,
                distance: i === 0 ? 300 : 80,
                duration: i === 0 ? '5 hrs' : '2 hrs'
            },
            hotel: {
                name: `${toCity} Royal Grand Residency`,
                price: hotelDaily,
                rating: 4.4
            }
        };
    });
    return {
        title: `AI Curated Travel: ${start} to ${destinations.join(' & ')}`,
        start_location: start,
        destinations: destinations,
        total_days: days,
        budget: budget,
        travel_style: style,
        preferred_transport: transport,
        vehicle_rental: rental,
        summary: {
            totalDays: days,
            totalDistance: totalDistance,
            totalCost: totalCalculated,
            bestPeriod: 'October to March'
        },
        itinerary,
        budgetBreakdown,
        vehicleDetails: {
            suggestedVehicle: rental ? (transport === 'Bike' ? 'Royal Enfield Bullet 350' : 'Maruti Swift Hatchback') : 'None',
            rentalPerDay: rental ? 1100 : 0,
            totalRentalDays: rental ? days : 0,
            fuelEfficiency: '32 km/l',
            fuelPrice: 102,
            estimatedFuelLitres: rental ? Math.round(totalDistance / 32) : 0,
            totalFuelCost: rental ? Math.round((totalDistance / 32) * 102) : 0
        },
        destinationsDetails: coords.map(c => ({
            name: c.name,
            lat: c.lat,
            lng: c.lng,
            attractions: [`Main Heritage Fort`, `Nature River Point`, `Photography Street`],
            temp: '26°C',
            rain: '10%'
        })),
        packingList: [
            { category: 'Apparel', items: ['Cotton tees', 'Light wind-breaker', 'Walking sneakers', 'Sun hat'] },
            { category: 'Tech & Gadgets', items: ['Power bank (10,000mAh)', 'Phone chargers', 'Camera equipment'] },
            { category: 'Utilities', items: ['Aadhaar copy', 'Sanitizer', 'Refillable water bottle'] }
        ],
        hiddenGems: destinations.map(d => ({
            destination: d,
            title: `Charming local alleyway in ${d}`,
            description: `Hidden street known only to locals, offering the finest local food stalls and scenic views.`,
            type: 'food'
        })),
        weatherForecast: Array.from({ length: Math.min(5, days) }).map((_, i) => ({
            day: i * 3 + 1,
            temp: '26°C',
            rainProb: '10%'
        }))
    };
}
