import type { Room } from "@/types/content";

const rooms: Room[] = [
  {
    slug: "deluxe-garden-room",
    name: "Deluxe Garden Room",
    category: "room",
    tagline: "A serene retreat above the courtyard gardens",
    shortDescription:
      "Calm, light-filled quarters overlooking the hotel's private gardens, finished in cream oak, brushed brass and hand-loomed textiles.",
    description: [
      "The Deluxe Garden Room is where Marlo's design language begins — warm cream plaster, deep forest-green upholstery and hand-finished brass details that catch the evening light. Floor-to-ceiling windows frame the courtyard gardens below, filling the room with soft, filtered daylight throughout the day.",
      "A king bed dressed in 400-thread-count Egyptian cotton anchors the room, while a velvet reading chaise and writing desk invite slower moments. The marble bathroom features a walk-in rain shower, heated floors and amenities blended exclusively for Marlo Hotels.",
    ],
    priceFrom: 240,
    size: "42 m²",
    occupancy: "2 adults, 1 child",
    bed: "King or Twin",
    view: "Courtyard Garden",
    featured: false,
    images: [
      { src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1920&auto=format&fit=crop", alt: "Deluxe Garden Room with king bed and garden view" },
      { src: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=1920&auto=format&fit=crop", alt: "Seating corner of the Deluxe Garden Room" },
      { src: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1920&auto=format&fit=crop", alt: "Marble bathroom with rain shower" },
    ],
    amenities: ["King bed", "Rain shower", "Nespresso machine", "Smart TV 55\"", "Minibar", "In-room safe", "Bathrobe & slippers", "High-speed Wi-Fi"],
    features: ["Garden-facing floor-to-ceiling windows", "Handcrafted Nepali textiles", "Heated bathroom floors", "Blackout drapery", "Twice-daily housekeeping"],
  },
  {
    slug: "premier-valley-room",
    name: "Premier Valley Room",
    category: "room",
    tagline: "Sunset views across the Kathmandu Valley",
    shortDescription:
      "Elevated corner rooms with panoramic valley views, a window-side daybed and an oversized soaking tub.",
    description: [
      "Set on the upper floors, the Premier Valley Room turns the city into theatre. A full-width window wall follows the valley to the hills beyond, and on clear mornings the Himalayan range appears above the ridgeline like a painting.",
      "The window-side daybed is made for long afternoons, and the bathroom — clad in honed travertine — pairs a freestanding soaking tub with a separate rain shower. Every detail, from the mother-of-pearl inlay tables to the brass reading lamps, is chosen to feel quietly precious.",
    ],
    priceFrom: 320,
    size: "48 m²",
    occupancy: "2 adults, 1 child",
    bed: "King",
    view: "Kathmandu Valley",
    featured: false,
    images: [
      { src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1920&auto=format&fit=crop", alt: "Premier Valley Room with panoramic windows" },
      { src: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1920&auto=format&fit=crop", alt: "King bed with valley views" },
      { src: "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?q=80&w=1920&auto=format&fit=crop", alt: "Travertine bathroom with soaking tub" },
    ],
    amenities: ["King bed", "Soaking tub", "Rain shower", "Nespresso machine", "Smart TV 65\"", "Minibar", "In-room safe", "High-speed Wi-Fi"],
    features: ["Corner panoramic windows", "Window-side daybed", "Evening turndown ritual", "Pillow menu", "Valley & Himalaya views"],
  },
  {
    slug: "marlo-signature-suite",
    name: "Marlo Signature Suite",
    category: "suite",
    tagline: "The essence of Marlo, composed in one address",
    shortDescription:
      "A residential suite with a private living salon, dining corner and wraparound terrace above the infinity pool.",
    description: [
      "The Signature Suite is Marlo distilled: a private salon wrapped in forest-green lacquer and cream bouclé, a dining corner for four, and a terrace that hovers directly above the infinity pool with the valley beyond.",
      "The bedroom is a sanctuary of its own — an emperor bed, a dressing room lined in cedar, and a five-fixture marble bathroom where the tub sits beneath its own picture window. Guests of the suite enjoy dedicated concierge service and daily pressing.",
    ],
    priceFrom: 620,
    size: "86 m²",
    occupancy: "3 adults, or 2 adults & 2 children",
    bed: "Emperor King",
    view: "Infinity Pool & Valley",
    featured: true,
    images: [
      { src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1920&auto=format&fit=crop", alt: "Signature Suite living salon" },
      { src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1920&auto=format&fit=crop", alt: "Suite bedroom with emperor bed" },
      { src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=1920&auto=format&fit=crop", alt: "Suite terrace lounge" },
    ],
    amenities: ["Emperor bed", "Private terrace", "Dining for four", "Walk-in dressing room", "Soaking tub", "Butler pantry", "Bose sound system", "High-speed Wi-Fi"],
    features: ["Dedicated concierge", "Daily pressing service", "Terrace above the infinity pool", "Private in-suite check-in", "Complimentary minibar"],
  },
  {
    slug: "royal-heritage-suite",
    name: "Royal Heritage Suite",
    category: "suite",
    tagline: "Nepal's craft heritage, rendered in grand scale",
    shortDescription:
      "Our most storied suite — hand-carved Newari woodwork, a private study and sweeping twin-aspect views.",
    description: [
      "Conceived with master craftsmen from Bhaktapur, the Royal Heritage Suite carries three centuries of Newari artistry into the present. Hand-carved timber screens filter the light, and antique bronze work sits beside contemporary Italian furniture in quiet conversation.",
      "The suite unfolds across a great room, private study, and a principal bedroom with twin-aspect views of the palace quarter and the hills. A six-seat dining room, guest powder room and butler service complete an address made for occasions.",
    ],
    priceFrom: 950,
    size: "118 m²",
    occupancy: "4 adults",
    bed: "Emperor King + Study Daybed",
    view: "Palace Quarter & Hills",
    featured: true,
    images: [
      { src: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1920&auto=format&fit=crop", alt: "Royal Heritage Suite great room" },
      { src: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1920&auto=format&fit=crop", alt: "Suite terrace with sweeping views" },
      { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1920&auto=format&fit=crop", alt: "Private study with carved woodwork" },
    ],
    amenities: ["Emperor bed", "Private study", "Six-seat dining room", "Guest powder room", "Twin-aspect windows", "Butler service", "Wine cabinet", "High-speed Wi-Fi"],
    features: ["Hand-carved Newari woodwork", "Curated Nepali art collection", "24-hour butler", "Airport transfer by private car", "In-suite spa treatments on request"],
  },
  {
    slug: "family-terrace-room",
    name: "Family Terrace Room",
    category: "room",
    tagline: "Generous space for travelling together",
    shortDescription:
      "Interconnecting-ready rooms with a furnished terrace, window banquette and thoughtful touches for younger guests.",
    description: [
      "Designed for families who refuse to compromise, the Family Terrace Room pairs a king bedroom with a deep window banquette that converts for children, plus a furnished terrace for breakfast in the morning sun.",
      "Rooms can interconnect to create a private family wing, and our team prepares age-appropriate amenities before arrival — from bathrobes in small sizes to bedtime milk and cookies from the patisserie.",
    ],
    priceFrom: 380,
    size: "56 m²",
    occupancy: "2 adults, 2 children",
    bed: "King + Convertible Banquette",
    view: "Terrace & Gardens",
    featured: false,
    images: [
      { src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1920&auto=format&fit=crop", alt: "Family Terrace Room interior" },
      { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1920&auto=format&fit=crop", alt: "Furnished private terrace" },
      { src: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1920&auto=format&fit=crop", alt: "Family bathroom with double vanity" },
    ],
    amenities: ["King bed", "Convertible banquette", "Furnished terrace", "Double vanity", "Nespresso machine", "Smart TV 55\"", "Minibar", "High-speed Wi-Fi"],
    features: ["Interconnecting rooms available", "Children's amenity programme", "Babysitting on request", "Terrace breakfast service"],
  },
  {
    slug: "wellness-pool-room",
    name: "Wellness Pool Room",
    category: "room",
    tagline: "Direct access to water, light and stillness",
    shortDescription:
      "Ground-level rooms that open directly onto the pool deck, with in-room wellness amenities and spa privileges.",
    description: [
      "Step from your room straight onto the warm stone of the pool deck. The Wellness Pool Room is built around ritual — morning laps in the infinity pool, in-room yoga with mats and blocks provided, and evening herbal infusions delivered at turndown.",
      "Guests enjoy priority booking at Marlo Spa and a daily 30-minute wellness credit, redeemable against treatments, private yoga or the thermal circuit.",
    ],
    priceFrom: 410,
    size: "45 m²",
    occupancy: "2 adults",
    bed: "King",
    view: "Infinity Pool Deck",
    featured: false,
    images: [
      { src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1920&auto=format&fit=crop", alt: "Wellness Pool Room opening to the deck" },
      { src: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1920&auto=format&fit=crop", alt: "Infinity pool at dusk" },
      { src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1920&auto=format&fit=crop", alt: "In-room wellness amenities" },
    ],
    amenities: ["King bed", "Direct pool access", "Yoga kit", "Rain shower", "Herbal minibar", "Smart TV 55\"", "In-room safe", "High-speed Wi-Fi"],
    features: ["Daily wellness credit", "Priority spa booking", "Sunrise yoga on the deck", "Turndown herbal infusions"],
  },
];

export const roomPolicies = [
  { title: "Check-in / Check-out", detail: "Check-in from 2:00 PM, check-out until 12:00 PM. Early arrival and late departure on request, subject to availability." },
  { title: "Cancellation", detail: "Complimentary cancellation until 48 hours before arrival. Later cancellations are charged one night's stay." },
  { title: "Children", detail: "Children of all ages are welcome. Cots and extra beds are available; children under 6 stay free in existing bedding." },
  { title: "Smoking", detail: "All rooms and suites are non-smoking. Designated outdoor smoking areas are available." },
  { title: "Pets", detail: "With regret, pets cannot be accommodated, with the exception of certified assistance animals." },
];

export async function getRooms(): Promise<Room[]> {
  return rooms;
}

export async function getRoomBySlug(slug: string): Promise<Room | undefined> {
  return rooms.find((room) => room.slug === slug);
}

export async function getFeaturedRooms(): Promise<Room[]> {
  return rooms.filter((room) => room.featured);
}

export async function getRelatedRooms(slug: string, limit = 3): Promise<Room[]> {
  return rooms.filter((room) => room.slug !== slug).slice(0, limit);
}
