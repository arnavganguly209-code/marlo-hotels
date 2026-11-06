export type InventoryManageDay = {
  date: string;
  weekday: string;
  day: number;
  inventory: number;
  booked: number;
  available: number;
  blocked: boolean;
  rate1Adult: number;
  rate2Adult: number;
  rate3Adult: number;
  inventoryOverridden: boolean;
  rateOverridden: boolean;
};

export type InventoryManageCategory = {
  slug: string;
  name: string;
  roomType: "Room" | "Suite";
  baseInventory: number;
  days: InventoryManageDay[];
};

export type InventoryManageGrid = {
  from: string;
  days: number;
  dates: { date: string; weekday: string; day: number }[];
  categories: InventoryManageCategory[];
};
