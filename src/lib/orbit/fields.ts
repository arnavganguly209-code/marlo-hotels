export type OrbitField = {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "url"
    | "toggle"
    | "select"
    | "datetime"
    | "richtext"
    | "media"
    | "media-video";
  required?: boolean;
  options?: string[];
  help?: string;
};

const mediaFields: OrbitField[] = [
  {
    key: "imageUrl",
    label: "Featured image",
    type: "media",
    required: true,
    help: "Select or upload from the Media Library. Original quality is preserved.",
  },
  { key: "imageAlt", label: "Image alt text", type: "text", required: true },
  { key: "imageCaption", label: "Image caption", type: "text" },
  { key: "mediaAssetId", label: "Media asset id", type: "text", help: "Set automatically when choosing media." },
];

const seoFields: OrbitField[] = [
  { key: "metaTitle", label: "Meta title", type: "text" },
  { key: "metaDescription", label: "Meta description", type: "textarea" },
  { key: "canonicalUrl", label: "Canonical URL", type: "url" },
  { key: "ogImageUrl", label: "OpenGraph image", type: "url" },
];

const commonFields: OrbitField[] = [
  { key: "heading", label: "Heading", type: "text", required: true },
  { key: "subheading", label: "Subheading", type: "textarea" },
  { key: "enabled", label: "Visible on website", type: "toggle" },
];

export const orbitFields: Record<string, OrbitField[]> = {
  homepage: [
    { key: "section", label: "Homepage section", type: "select", required: true, options: ["Hero", "About", "Luxury Rooms", "Featured Suites", "Dining", "Spa & Wellness", "Infinity Pool", "Events", "Wedding", "Meetings", "Gallery", "Experiences", "Nearby Attractions", "Testimonials", "Awards", "Instagram", "Latest Articles", "Newsletter", "Footer"] },
    ...commonFields,
    { key: "buttonText", label: "Button text", type: "text" },
    { key: "buttonLink", label: "Button link", type: "text" },
    { key: "bookingWidget", label: "Show booking widget", type: "toggle" },
    { key: "backgroundOverlay", label: "Background overlay", type: "select", options: ["Light", "Balanced", "Dark", "Custom"] },
    { key: "animation", label: "Animation", type: "select", options: ["Reveal", "Fade", "Parallax", "None"] },
    ...mediaFields,
    {
      key: "heroVideoUrl",
      label: "Hero video (optional)",
      type: "media-video",
      help: "When set for the Hero section, video replaces the still image.",
    },
    { key: "posterUrl", label: "Video poster image", type: "media" },
    { key: "videoAutoplay", label: "Video autoplay", type: "toggle" },
    { key: "videoLoop", label: "Video loop", type: "toggle" },
    { key: "videoMuted", label: "Video muted", type: "toggle" },
    { key: "focalX", label: "Focal point X (0-100)", type: "number" },
    { key: "focalY", label: "Focal point Y (0-100)", type: "number" },
  ],
  rooms: [
    { key: "roomType", label: "Room type", type: "select", required: true, options: ["Room", "Suite"] },
    { key: "subheading", label: "Tagline", type: "text" },
    { key: "description", label: "Description", type: "richtext", required: true },
    { key: "price", label: "Price without breakfast (per night)", type: "number", required: true },
    { key: "currency", label: "Currency", type: "text", required: true },
    { key: "breakfastPrice", label: "Breakfast price per person / night", type: "number", required: true },
    { key: "inventory", label: "Available rooms (inventory)", type: "number", required: true },
    { key: "available", label: "Published / bookable", type: "toggle" },
    { key: "featured", label: "Featured", type: "toggle" },
    { key: "sortOrder", label: "Sort order", type: "number", help: "Lower numbers appear first." },
    { key: "maxGuests", label: "Maximum guests", type: "number" },
    { key: "maxChildren", label: "Maximum children", type: "number" },
    { key: "beds", label: "Beds", type: "text" },
    { key: "bathrooms", label: "Bathrooms", type: "number" },
    { key: "floorSize", label: "Floor size / room size", type: "text" },
    { key: "view", label: "View", type: "text" },
    { key: "amenities", label: "Amenities (one per line)", type: "textarea" },
    { key: "policies", label: "Facilities / policies (one per line)", type: "textarea" },
    ...mediaFields,
    {
      key: "galleryUrls",
      label: "Gallery images (one URL per line)",
      type: "textarea",
      help: "Paste /media/… URLs from the Media Library, one per line. Cover image is separate above.",
    },
    ...seoFields,
  ],
  dining: [
    { key: "restaurant", label: "Restaurant name", type: "text", required: true },
    { key: "cuisine", label: "Cuisine", type: "text" },
    { key: "description", label: "Restaurant description", type: "richtext" },
    { key: "chefName", label: "Chef name", type: "text" },
    { key: "chefBio", label: "Chef biography", type: "richtext" },
    { key: "hours", label: "Opening hours", type: "text" },
    { key: "reservationUrl", label: "Reservation link", type: "url" },
    { key: "menu", label: "Menu content", type: "richtext" },
    ...mediaFields,
    ...seoFields,
  ],
  spa: [
    { key: "type", label: "Type", type: "select", options: ["Treatment", "Package", "Therapy"] },
    { key: "description", label: "Description", type: "richtext" },
    { key: "duration", label: "Duration", type: "text" },
    { key: "price", label: "Price", type: "number" },
    { key: "inclusions", label: "Inclusions (one per line)", type: "textarea" },
    ...mediaFields,
    ...seoFields,
  ],
  blog: [
    { key: "excerpt", label: "Excerpt", type: "textarea", required: true },
    { key: "content", label: "Article content", type: "richtext", required: true },
    { key: "category", label: "Category", type: "text" },
    { key: "tags", label: "Tags (comma separated)", type: "text" },
    { key: "author", label: "Author", type: "text" },
    { key: "readingTime", label: "Reading time", type: "text" },
    ...mediaFields,
    ...seoFields,
  ],
  offers: [
    { key: "type", label: "Offer type", type: "select", options: ["Seasonal", "Package", "Gift Card"] },
    { key: "description", label: "Description", type: "richtext" },
    { key: "code", label: "Promo code", type: "text" },
    { key: "discount", label: "Discount", type: "text" },
    { key: "validFrom", label: "Valid from", type: "datetime" },
    { key: "validUntil", label: "Valid until", type: "datetime" },
    { key: "benefits", label: "Benefits (one per line)", type: "textarea" },
    ...mediaFields,
    ...seoFields,
  ],
  experiences: [
    { key: "category", label: "Category", type: "select", options: ["Culture", "Adventure", "Wellness", "Private"] },
    { key: "description", label: "Description", type: "richtext" },
    { key: "duration", label: "Duration", type: "text" },
    { key: "highlights", label: "Highlights (one per line)", type: "textarea" },
    { key: "bookingUrl", label: "Booking link", type: "url" },
    ...mediaFields,
    ...seoFields,
  ],
  "site-settings": [
    { key: "settingGroup", label: "Settings group", type: "select", options: ["Brand", "Contact", "Location", "Social Media", "Booking", "Footer"] },
    { key: "logoUrl", label: "Primary logo", type: "media" },
    { key: "footerLogoUrl", label: "Footer logo", type: "media" },
    { key: "faviconUrl", label: "Favicon", type: "media" },
    { key: "email", label: "Email", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "address", label: "Address", type: "textarea" },
    { key: "mapUrl", label: "Google Map URL", type: "url" },
    { key: "whatsapp", label: "WhatsApp", type: "text" },
    { key: "bookingUrl", label: "Booking URL", type: "url" },
    { key: "socialLinks", label: "Social links (one per line)", type: "textarea" },
  ],
  seo: [
    { key: "page", label: "Page or entity", type: "text", required: true },
    ...seoFields,
    { key: "schema", label: "Schema.org JSON-LD", type: "textarea" },
    { key: "robots", label: "Robots directive", type: "select", options: ["index, follow", "noindex, follow", "noindex, nofollow"] },
  ],
};

const defaultFields: OrbitField[] = [
  ...commonFields,
  { key: "description", label: "Description", type: "richtext" },
  ...mediaFields,
  ...seoFields,
];

export function fieldsForModule(module: string) {
  return orbitFields[module] ?? defaultFields;
}
