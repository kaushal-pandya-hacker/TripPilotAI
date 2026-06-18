import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Wallet, 
  Compass, 
  CloudSun, 
  Bike, 
  Share2, 
  FileDown, 
  HelpCircle, 
  ArrowRight,
  Star,
  Users
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    { icon: Sparkles, title: 'AI Trip Planner', desc: 'Describe your dream journey in plain natural language and watch the AI assemble it in seconds.' },
    { icon: MapPin, title: 'Route Optimization', desc: 'Smart sorting algorithms plot the shortest path to reduce travel hours and fatigue.' },
    { icon: Wallet, title: 'Budget Calculator', desc: 'Pre-calculated ticket bookings, vehicle hire costs, fuel consumption estimates, and buffer funds.' },
    { icon: Compass, title: 'Hotel Finder', desc: 'Curated lists of budget stays, mid-range boutique hotels, and luxury suites along your routes.' },
    { icon: Bike, title: 'Bike & Road Trips', desc: 'Tailored paths optimized specifically for bikes, cars, or public transport with elevation profiles.' },
    { icon: CloudSun, title: 'Weather Forecast', desc: 'Daily meteorological projections along with route-specific travel warnings and safety advisories.' },
    { icon: FileDown, title: 'PDF Export', desc: 'Download comprehensive high-fidelity travel documents for offline availability.' },
    { icon: Share2, title: 'Trip Sharing', desc: 'Create instantly shareable web URLs for friends, families, or rental partners.' },
  ];

  const steps = [
    { num: '01', title: 'Tell AI About Your Trip', desc: 'Explain your travel vision - origins, dates, budget limits, or ride preferences.' },
    { num: '02', title: 'AI Asks Smart Questions', desc: 'Our conversational AI interviews you to nail down rentals, driving comfort, and dining choices.' },
    { num: '03', title: 'AI Builds Your Journey', desc: 'Get a full map layout, itemized budget sheets, and hotel recommendations.' },
    { num: '04', title: 'Export, Modify, & Share', desc: 'Refine details using the chat assistant, download as PDF, or send sharing links.' }
  ];

  const testimonials = [
    { name: 'Kunal Shah', role: 'Adventure Biker', text: 'Used TripPilot AI to design an 18-day circuit through Leh. The bike rental calculation and fuel estimation were spot on. The maps are gorgeous!', rating: 5 },
    { name: 'Pooja Hegde', role: 'Backpacker', text: 'I requested a cheap trip from Haridwar to Badrinath. The system recommended budget homestays and hidden trekking viewpoints I never would have found.', rating: 5 },
    { name: 'Rohit Sharma', role: 'Family Traveler', text: 'The conversational interview feels like talking to a real travel guide. Best part is typing "make it family friendly" and seeing it update instantly.', rating: 5 }
  ];

  const faqs = [
    { q: 'How does the AI create the itineraries?', a: 'Our system analyzes your natural language queries using advanced GPT-4o models and local geographic data. It processes distances, maps pins, average accommodations pricing, and seasonal weather trends to compose structured itineraries.' },
    { q: 'Can I edit the generated plan later?', a: 'Yes! Our real-time AI Chat Editor lets you type instructions like "change to train travel," "add Goa," or "make the hotels cheaper." The plan regenerates instantly.' },
    { q: 'Is there a limit to how many trips I can plan?', a: 'Free accounts get up to 3 itineraries with standard details. Upgrading to Pro or Enterprise unlocks unlimited planning, advanced weather forecasting, and priority AI speeds.' },
    { q: 'Does it work offline?', a: 'You can export any itinerary to PDF. Premium members can download offline trip packs containing maps, hotel listings, and emergency contact details.' }
  ];

  return (
    <div className="min-h-screen text-white relative">
      {/* Background ambient glows */}
      <div className="absolute top-20 left-1/4 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[800px] right-1/4 translate-x-1/2 w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 animate-pulse-glow">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Intelligent Travel Agent</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Plan Any Trip In Minutes <br />
          <span className="text-gradient font-display">With AI Technology</span>
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Tell TripPilot AI where you want to go and get a complete travel plan including transport guides, hotels, route maps, budgets, and daily itineraries.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => onNavigate('register')}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 text-white transition duration-200 group"
          >
            <span>Start Planning Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
          </button>
          <button 
            onClick={() => alert("TripPilot Demo video coming soon! Click 'Start Planning' to try it immediately.")}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-semibold text-gray-200 transition duration-200"
          >
            Watch Video Demo
          </button>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-24 px-6 border-t border-white/5 bg-slate-950/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-display">Supercharged Travel Planner</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">Everything you need to craft high-adrenaline expeditions or relaxing family vacations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 mb-5 border border-indigo-500/25">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 font-display text-white">{feat.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-display">How TripPilot AI Works</h2>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">From initial description to ready sitemaps in four simple steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              <div className="text-5xl font-black text-indigo-900/30 group-hover:text-indigo-600/30 transition duration-300 font-display mb-4">
                {step.num}
              </div>
              <h3 className="text-lg font-bold mb-2 text-white font-display">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 border-t border-white/5 bg-slate-950/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-display">Simple Transparent Plans</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">Choose the license level that matches your travel frequency.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between border-white/5">
              <div>
                <h3 className="text-xl font-bold font-display">Free Plan</h3>
                <p className="text-gray-400 text-sm mt-1">For occasional weekenders</p>
                <div className="my-6">
                  <span className="text-4xl font-black font-display">₹0</span>
                  <span className="text-gray-400 text-sm"> / forever</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-300 border-t border-white/5 pt-6">
                  <li className="flex items-center gap-2">✓ Plan up to 3 trips</li>
                  <li className="flex items-center gap-2">✓ Conversational AI interview</li>
                  <li className="flex items-center gap-2">✓ Standard route details</li>
                  <li className="flex items-center gap-2 text-gray-500">✗ Priority AI speed</li>
                  <li className="flex items-center gap-2 text-gray-500">✗ PDF Export & Prints</li>
                </ul>
              </div>
              <button 
                onClick={() => onNavigate('register')}
                className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition"
              >
                Sign Up Free
              </button>
            </div>

            {/* Pro */}
            <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between border-indigo-500/30 relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md shadow-indigo-600/30">
                Most Popular
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-indigo-400">Pro Plan</h3>
                <p className="text-gray-400 text-sm mt-1">For active explorers & road-trippers</p>
                <div className="my-6">
                  <span className="text-4xl font-black font-display">₹1,500</span>
                  <span className="text-gray-400 text-sm"> / year</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-300 border-t border-white/5 pt-6">
                  <li className="flex items-center gap-2">✓ Unlimited itineraries</li>
                  <li className="flex items-center gap-2">✓ 2x Faster AI generations</li>
                  <li className="flex items-center gap-2">✓ PDF Download exports</li>
                  <li className="flex items-center gap-2">✓ Advanced vehicle & fuel plans</li>
                  <li className="flex items-center gap-2">✓ Weather intelligence guides</li>
                </ul>
              </div>
              <button 
                onClick={() => onNavigate('register')}
                className="w-full mt-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition shadow-lg shadow-indigo-600/20"
              >
                Go Pro Now
              </button>
            </div>

            {/* Enterprise */}
            <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between border-white/5">
              <div>
                <h3 className="text-xl font-bold font-display">Enterprise Plan</h3>
                <p className="text-gray-400 text-sm mt-1">For tourism agencies & operators</p>
                <div className="my-6">
                  <span className="text-4xl font-black font-display">₹4,000</span>
                  <span className="text-gray-400 text-sm"> / year</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-300 border-t border-white/5 pt-6">
                  <li className="flex items-center gap-2">✓ All features in Pro</li>
                  <li className="flex items-center gap-2">✓ Custom API Access integration</li>
                  <li className="flex items-center gap-2">✓ Client branding dashboards</li>
                  <li className="flex items-center gap-2">✓ Multi-agent planning features</li>
                  <li className="flex items-center gap-2">✓ Priority 24/7 technical support</li>
                </ul>
              </div>
              <button 
                onClick={() => onNavigate('register')}
                className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition"
              >
                Contact Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-display">Loved By Adventure Lovers</h2>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">Discover how other travelers are executing their Himalayan bike tours and family treks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <div key={idx} className="glass-panel p-8 rounded-2xl flex flex-col justify-between border-white/5">
              <div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm italic leading-relaxed mb-6">"{test.text}"</p>
              </div>
              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center font-bold text-indigo-400 font-display">
                  {test.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{test.name}</h4>
                  <p className="text-xs text-gray-500">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 max-w-4xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-display">Frequently Asked Questions</h2>
          <p className="text-gray-400 mt-3">Answers to basic questions about TripPilot AI SaaS capabilities.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel rounded-2xl overflow-hidden border-white/5">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left p-6 flex justify-between items-center hover:bg-white/5 transition duration-200"
              >
                <span className="font-bold text-sm sm:text-base text-gray-100">{faq.q}</span>
                <span className="text-indigo-400 font-bold">{activeFaq === idx ? '−' : '+'}</span>
              </button>
              {activeFaq === idx && (
                <div className="p-6 pt-0 text-sm text-gray-400 leading-relaxed border-t border-white/5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-indigo-400" />
            <span className="font-bold text-lg font-display text-white">TripPilot AI</span>
          </div>
          <p className="text-xs text-gray-500">© 2026 TripPilot AI Inc. All rights reserved. Plan Your Entire Journey With AI.</p>
          <div className="flex gap-4 text-xs text-gray-400">
            <a href="#" className="hover:text-indigo-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-indigo-400 transition">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
