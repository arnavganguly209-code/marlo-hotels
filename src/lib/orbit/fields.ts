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
    | "richtext";
  required?: boolean;
  options?: string[];
  help?: string;
};

const mediaFields: OrbitField[] = [
  { key: "imageUrl", label: "Featured image URL", type: "url" },
  { key: "imageAlt", label: "Image alt text", type: "text", required: true },
  { key: "imageCaption", label: "Image caption", type: "text" },
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
  ],
  rooms: [
    { key: "roomType", label: "Room type", type: "select", required: true, options: ["Room", "Suite", "Villa", "Residence"] },
    { key: "description", label: "Description", type: "richtext", required: true },
    { key: "price", label: "Base price", type: "number", required: true },
    { key: "discount", label: "Discount %", type: "number" },
    { key: "available", label: "Available", type: "toggle" },
    { key: "featured", label: "Featured", type: "toggle" },
    { key: "maxGuests", label: "Maximum guests", type: "number" },
    { key: "maxChildren", label: "Maximum children", type: "number" },
    { key: "beds", label: "Beds", type: "text" },
    { key: "bathrooms", label: "Bathrooms", type: "number" },
    { key: "floorSize", label: "Floor size", type: "text" },
    { key: "amenities", label: "Amenities (one per line)", type: "textarea" },
    { key: "policies", label: "Policies", type: "richtext" },
    ...mediaFields,
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
    { key: "logoUrl", label: "Primary logo", type: "url" },
    { key: "footerLogoUrl", label: "Footer logo", type: "url" },
    { key: "faviconUrl", label: "Favicon", type: "url" },
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
