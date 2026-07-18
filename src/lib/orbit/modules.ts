export type OrbitModule = {
  slug: string;
  label: string;
  description: string;
  icon: string;
  group: "Content" | "Operations" | "Platform";
  singular: string;
  capabilities: string[];
};

export const orbitModules: OrbitModule[] = [
  { slug: "homepage", label: "Homepage", singular: "section", icon: "layout-template", group: "Content", description: "Hero, booking widget and every public homepage section.", capabilities: ["Section order", "Copy and links", "Images and overlays", "Animation settings", "Visibility"] },
  { slug: "rooms", label: "Rooms", singular: "room", icon: "bed-double", group: "Content", description: "Inventory, pricing, availability, amenities and room SEO.", capabilities: ["Room details", "Rates and discounts", "Availability", "Gallery", "Policies", "SEO"] },
  { slug: "dining", label: "Dining", singular: "restaurant", icon: "utensils", group: "Content", description: "Restaurants, chefs, menus, wine and reservations.", capabilities: ["Venues", "Chef profiles", "Menus", "Opening hours", "Reservations"] },
  { slug: "spa", label: "Spa", singular: "treatment", icon: "flower-2", group: "Content", description: "Wellness treatments, packages, pricing and imagery.", capabilities: ["Treatments", "Packages", "Duration", "Pricing", "Images"] },
  { slug: "gallery", label: "Gallery", singular: "gallery item", icon: "images", group: "Content", description: "Curated hotel galleries, categories and captions.", capabilities: ["Collections", "Ordering", "Alt text", "Captions", "Visibility"] },
  { slug: "offers", label: "Offers", singular: "offer", icon: "badge-percent", group: "Content", description: "Seasonal offers, packages, gift cards and promo codes.", capabilities: ["Offer details", "Validity", "Promo codes", "Benefits", "SEO"] },
  { slug: "experiences", label: "Experiences", singular: "experience", icon: "compass", group: "Content", description: "Tours, adventure, culture, wellness and private experiences.", capabilities: ["Categories", "Highlights", "Duration", "Booking link", "SEO"] },
  { slug: "wedding", label: "Wedding", singular: "wedding package", icon: "heart-handshake", group: "Content", description: "Wedding spaces, packages, galleries and enquiries.", capabilities: ["Venues", "Packages", "Capacity", "Gallery", "Enquiries"] },
  { slug: "meetings", label: "Meetings", singular: "meeting space", icon: "presentation", group: "Content", description: "Meeting rooms, capacities, layouts and event services.", capabilities: ["Spaces", "Layouts", "Capacity", "Equipment", "Enquiries"] },
  { slug: "blog", label: "Blog", singular: "article", icon: "notebook-pen", group: "Content", description: "Editorial CMS with drafting, scheduling and SEO.", capabilities: ["Rich text", "Categories and tags", "Authors", "Preview", "Schedule", "SEO"] },
  { slug: "testimonials", label: "Testimonials", singular: "testimonial", icon: "quote", group: "Content", description: "Curated guest stories featured across the website.", capabilities: ["Guest details", "Quote", "Stay details", "Featured state"] },
  { slug: "reviews", label: "Reviews", singular: "review", icon: "star", group: "Operations", description: "Moderate verified guest reviews and ratings.", capabilities: ["Moderation", "Rating", "Source", "Feature review", "Publish"] },
  { slug: "newsletter", label: "Newsletter", singular: "subscriber", icon: "mail-plus", group: "Operations", description: "Search, export and manage newsletter subscribers.", capabilities: ["Search", "CSV export", "Delete", "Growth reporting"] },
  { slug: "bookings", label: "Bookings", singular: "booking", icon: "calendar-check", group: "Operations", description: "Upcoming, confirmed, cancelled and completed stays.", capabilities: ["Status", "Guests", "Payment", "Search", "CSV export"] },
  { slug: "contact-messages", label: "Contact Messages", singular: "message", icon: "messages-square", group: "Operations", description: "Read, reply, archive and manage guest enquiries.", capabilities: ["Inbox", "Reply", "Archive", "Search", "Delete"] },
  { slug: "media-library", label: "Media Library", singular: "asset", icon: "folder-image", group: "Operations", description: "Optimized images, folders, search and bulk management.", capabilities: ["Upload", "Replace", "Optimize", "Folders", "Alt and caption", "Bulk delete"] },
  { slug: "seo", label: "SEO", singular: "SEO record", icon: "search-check", group: "Platform", description: "Page metadata, schema, social cards, robots and sitemap.", capabilities: ["Metadata", "OpenGraph", "Twitter", "Schema", "Robots", "Sitemap"] },
  { slug: "menus", label: "Menus", singular: "menu", icon: "menu-square", group: "Platform", description: "Header, footer and contextual navigation management.", capabilities: ["Navigation trees", "Ordering", "Visibility", "External links"] },
  { slug: "site-settings", label: "Site Settings", singular: "setting", icon: "settings-2", group: "Platform", description: "Global brand, contact, social, map and booking settings.", capabilities: ["Brand assets", "Contact", "Social media", "WhatsApp", "Booking URL"] },
  { slug: "users", label: "Users", singular: "user", icon: "users-round", group: "Platform", description: "Administrator accounts, roles and access state.", capabilities: ["Accounts", "Roles", "Deactivate", "Last login"] },
  { slug: "security", label: "Security", singular: "security event", icon: "shield-check", group: "Platform", description: "Sessions, login activity, lockouts and security posture.", capabilities: ["Active sessions", "Failed logins", "Revoke", "Timeout policy"] },
  { slug: "backup", label: "Backup", singular: "backup", icon: "database-backup", group: "Platform", description: "Track database and media backup operations.", capabilities: ["Database backup", "Media manifest", "Integrity", "History"] },
  { slug: "system-logs", label: "System Logs", singular: "audit event", icon: "scroll-text", group: "Platform", description: "Immutable administrative activity and operational logs.", capabilities: ["Audit trail", "Module filter", "Action filter", "Export"] },
];

export const moduleBySlug = new Map(
  orbitModules.map((module) => [module.slug, module])
);
