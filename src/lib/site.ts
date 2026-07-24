export const siteConfig = {
  name: "Marlo Hotels",
  legalName: "Marlo Hotels & Resorts Pvt. Ltd.",
  tagline: "Stay Beyond Extraordinary",
  description:
    "Marlo Hotels is a five-star luxury sanctuary in the heart of Kathmandu — an address of timeless elegance, celebrated dining, restorative wellness and Himalayan hospitality.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://marlo.theglobalorbit.com",
  currency: "USD",
  contact: {
    address: "Durbar Marg, Kathmandu 44600, Nepal",
    phone: "+977 1 5970 800",
    reservations: "+977 1 5970 801",
    whatsapp: "+9779801234567",
    email: "hello@marlohotels.com",
    reservationsEmail: "reservations@marlohotels.com",
    mapUrl: "https://maps.google.com/?q=Durbar+Marg,+Kathmandu",
    geo: { lat: 27.7108, lng: 85.3172 },
  },
  hours: {
    frontDesk: "24 hours",
    checkIn: "2:00 PM",
    checkOut: "12:00 PM",
    concierge: "6:00 AM – 11:00 PM",
  },
  social: {
    instagram: "https://instagram.com/marlohotels",
    facebook: "https://facebook.com/marlohotels",
    twitter: "https://x.com/marlohotels",
    youtube: "https://youtube.com/@marlohotels",
  },
  booking: {
    maxAdults: 8,
    maxChildren: 6,
    maxRooms: 5,
    maxNights: 30,
  },
} as const;

export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export const mainNav: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Rooms & Suites", href: "/rooms", icon: "bed-double" },
  { label: "Dining", href: "/dining", icon: "utensils" },
  { label: "Spa & Wellness", href: "/spa", icon: "flower" },
  { label: "Experiences", href: "/experiences", icon: "compass" },
  { label: "Gallery", href: "/gallery", icon: "image" },
  { label: "Offers", href: "/offers", icon: "gift" },
  { label: "Blog", href: "/blog", icon: "book-open" },
  { label: "Contact", href: "/contact", icon: "phone" },
];

export const footerNav = {
  hotel: [
    { label: "About Marlo", href: "/about" },
    { label: "Rooms & Suites", href: "/rooms" },
    { label: "Dining", href: "/dining" },
    { label: "Spa & Wellness", href: "/spa" },
    { label: "Gallery", href: "/gallery" },
  ],
  discover: [
    { label: "Experiences", href: "/experiences" },
    { label: "Offers & Packages", href: "/offers" },
    { label: "The Journal", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Legal", href: "/legal" },
  ],
} as const;
