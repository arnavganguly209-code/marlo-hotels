export type ImageAsset = {
  src: string;
  alt: string;
};

export type Room = {
  slug: string;
  name: string;
  category: "room" | "suite";
  tagline: string;
  shortDescription: string;
  description: string[];
  priceFrom: number;
  currency: string;
  breakfastPrice: number;
  inventory: number;
  /** Guests included in the base rate (no extra charge). */
  includedAdults: number;
  includedChildren: number;
  extraAdultPrice: number;
  extraChildPrice: number;
  size: string;
  floor?: string;
  occupancy: string;
  bed: string;
  view: string;
  featured: boolean;
  published?: boolean;
  sortOrder?: number;
  images: ImageAsset[];
  amenities: string[];
  features: string[];
  policies?: string[];
  cancellationPolicy?: string;
  checkInTime?: string;
  checkOutTime?: string;
  buttonText?: string;
  buttonLink?: string;
};

export type MenuSection = {
  title: string;
  items: { name: string; description: string; price: string }[];
};

export type Restaurant = {
  slug: string;
  name: string;
  cuisine: string;
  tagline: string;
  shortDescription: string;
  description: string[];
  hours: string;
  dressCode: string;
  location: string;
  images: ImageAsset[];
  chef: {
    name: string;
    title: string;
    bio: string;
    image: ImageAsset;
  };
  menu: MenuSection[];
  wine?: string;
};

export type SpaTreatment = {
  name: string;
  category: "Massage" | "Facial" | "Body Ritual" | "Signature Journey";
  duration: string;
  price: number;
  description: string;
};

export type SpaPackage = {
  name: string;
  duration: string;
  price: number;
  description: string;
  inclusions: string[];
};

export type Offer = {
  slug: string;
  title: string;
  category: "Seasonal" | "Package" | "Gift Card";
  tagline: string;
  description: string;
  perks: string[];
  validity: string;
  code: string;
  discount: string;
  image: ImageAsset;
};

export type Experience = {
  slug: string;
  title: string;
  category: "Culture" | "Adventure" | "Wellness" | "Private";
  duration: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  image: ImageAsset;
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readingTime: string;
  author: { name: string; role: string };
  image: ImageAsset;
  content: { heading?: string; paragraphs: string[] }[];
  tags: string[];
};

export type GalleryImage = ImageAsset & {
  category: "Rooms" | "Dining" | "Wellness" | "Architecture" | "Events";
};

export type Testimonial = {
  name: string;
  origin: string;
  quote: string;
  rating: number;
  stay: string;
};

export type Award = {
  title: string;
  issuer: string;
  year: string;
};

export type Attraction = {
  name: string;
  distance: string;
  description: string;
  image: ImageAsset;
};
