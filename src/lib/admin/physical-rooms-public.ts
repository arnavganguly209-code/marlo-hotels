export const PHYSICAL_ROOM_STATUSES = [
  "AVAILABLE",
  "OCCUPIED",
  "MAINTENANCE",
  "OUT_OF_SERVICE",
  "CLEANING",
  "BLOCKED",
] as const;

export type PhysicalRoomStatusValue = (typeof PHYSICAL_ROOM_STATUSES)[number];

export type MarloRoomCategory = {
  id: string;
  key: string;
  title: string;
  slug: string;
  roomType: "Room" | "Suite";
  inventory: number;
  sortOrder: number;
};

export type PhysicalRoomRow = {
  id: string;
  number: string;
  roomCategorySlug: string;
  roomCategoryName: string;
  status: PhysicalRoomStatusValue;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type InventoryCategoryRow = {
  slug: string;
  name: string;
  roomType: "Room" | "Suite";
  sortOrder: number;
  /** Bookable rooms for online booking (ContentEntry inventory). */
  inventory: number;
  total: number;
  occupied: number;
  available: number;
  blocked: number;
  maintenance: number;
  cleaning: number;
  outOfService: number;
  sellableInventory: number;
};