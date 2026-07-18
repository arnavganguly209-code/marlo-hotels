import type { GalleryImage, Testimonial, Award, Attraction } from "@/types/content";

export const galleryImages: GalleryImage[] = [
  { src: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop", alt: "Marlo Hotels facade glowing at dusk", category: "Architecture" },
  { src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop", alt: "Infinity pool and resort architecture", category: "Architecture" },
  { src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1600&auto=format&fit=crop", alt: "Deluxe room with garden views", category: "Rooms" },
  { src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1600&auto=format&fit=crop", alt: "Signature Suite living salon", category: "Rooms" },
  { src: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1600&auto=format&fit=crop", alt: "Royal Heritage Suite bedroom", category: "Rooms" },
  { src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1600&auto=format&fit=crop", alt: "Premier room with valley panorama", category: "Rooms" },
  { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1600&auto=format&fit=crop", alt: "Amaya restaurant at night", category: "Dining" },
  { src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1600&auto=format&fit=crop", alt: "Tasting menu course at Amaya", category: "Dining" },
  { src: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1600&auto=format&fit=crop", alt: "Signature cocktails at Bar 1959", category: "Dining" },
  { src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1600&auto=format&fit=crop", alt: "The Terrace set for a long lunch", category: "Dining" },
  { src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1600&auto=format&fit=crop", alt: "Spa treatment in a private suite", category: "Wellness" },
  { src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1600&auto=format&fit=crop", alt: "Morning ritual at Marlo Spa", category: "Wellness" },
  { src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop", alt: "Poolside daybeds at first light", category: "Wellness" },
  { src: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1600&auto=format&fit=crop", alt: "Infinity pool meeting the horizon", category: "Wellness" },
  { src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1600&auto=format&fit=crop", alt: "Wedding reception under chandeliers", category: "Events" },
  { src: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop", alt: "Gala dinner service", category: "Events" },
  { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1600&auto=format&fit=crop", alt: "Terrace wedding at golden hour", category: "Events" },
  { src: "https://images.unsplash.com/photo-1524230572899-a752b3835840?q=80&w=1600&auto=format&fit=crop", alt: "Architectural detail in warm light", category: "Architecture" },
];

export const galleryCategories = ["All", "Rooms", "Dining", "Wellness", "Architecture", "Events"] as const;

export const testimonials: Testimonial[] = [
  {
    name: "Charlotte Whitmore",
    origin: "London, United Kingdom",
    quote:
      "We have stayed at Amans and Four Seasons across Asia, and Marlo held its own effortlessly. The suite was extraordinary, but it is the staff we still talk about — they remembered everything, anticipated more.",
    rating: 5,
    stay: "Royal Heritage Suite, March 2026",
  },
  {
    name: "Daniel & Yuki Okafor",
    origin: "Singapore",
    quote:
      "Our honeymoon was composed like a piece of music. The private sunrise breakfast overlooking the Himalaya is the single best travel memory we own.",
    rating: 5,
    stay: "Marlo Signature Suite, February 2026",
  },
  {
    name: "Amelia Rousseau",
    origin: "Paris, France",
    quote:
      "Amaya deserves every accolade coming its way. A tasting menu with a genuine sense of place — I extended my stay two nights simply to eat there again.",
    rating: 5,
    stay: "Premier Valley Room, May 2026",
  },
  {
    name: "Rajiv Menon",
    origin: "Mumbai, India",
    quote:
      "Flawless from airport to farewell. The spa's singing bowl ritual is unlike anything I have experienced, and the infinity pool at dusk belongs on canvas.",
    rating: 5,
    stay: "Wellness Pool Room, April 2026",
  },
  {
    name: "The Harrison Family",
    origin: "Sydney, Australia",
    quote:
      "Travelling with two children and it felt like the hotel had prepared for ours specifically. Warm milk at bedtime, a treasure map of the gardens — thoughtful beyond expectation.",
    rating: 5,
    stay: "Family Terrace Rooms, January 2026",
  },
];

export const awards: Award[] = [
  { title: "World's Leading New Luxury Hotel", issuer: "World Travel Awards", year: "2026" },
  { title: "Top 10 City Hotels in Asia", issuer: "Condé Nast Traveller Readers' Choice", year: "2025" },
  { title: "Best Hotel Spa, South Asia", issuer: "World Spa Awards", year: "2026" },
  { title: "One Michelin Key", issuer: "Michelin Guide", year: "2025" },
  { title: "Design Hotel of the Year", issuer: "AHEAD Asia Awards", year: "2025" },
];

export const attractions: Attraction[] = [
  {
    name: "Kathmandu Durbar Square",
    distance: "5 min walk",
    description: "Seventeenth-century palaces, living temples and the residence of the Kumari — the city's ceremonial heart, at our doorstep.",
    image: { src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop", alt: "Historic temples of Durbar Square" },
  },
  {
    name: "Swayambhunath Stupa",
    distance: "15 min drive",
    description: "The painted eyes of the valley's oldest stupa watch over the city from a forested hilltop — magical at first and last light.",
    image: { src: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=1600&auto=format&fit=crop", alt: "Stupa with prayer flags at dawn" },
  },
  {
    name: "Patan City of Artisans",
    distance: "20 min drive",
    description: "Bronze casters, thangka painters and the finest museum in the Himalaya, set around a palace square of astonishing grace.",
    image: { src: "https://images.unsplash.com/photo-1524230572899-a752b3835840?q=80&w=1600&auto=format&fit=crop", alt: "Artisan quarter architecture" },
  },
  {
    name: "Nagarkot Valley Rim",
    distance: "90 min drive",
    description: "Pine ridges with a horizon of eight-thousand-metre peaks — the classic sunrise and sunset excursion from the city.",
    image: { src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop", alt: "Mountain panorama from Nagarkot" },
  },
];

export const instagramFeed: { src: string; alt: string }[] = [
  { src: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800&auto=format&fit=crop", alt: "Infinity pool at dusk" },
  { src: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=800&auto=format&fit=crop", alt: "Cocktail hour at Bar 1959" },
  { src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop", alt: "Morning light in a garden room" },
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop", alt: "Himalayan sunrise" },
  { src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=800&auto=format&fit=crop", alt: "A course at Amaya" },
  { src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop", alt: "Spa ritual details" },
];
