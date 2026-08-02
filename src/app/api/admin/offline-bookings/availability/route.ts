import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getAvailableCapacity, getAvailablePhysicalRooms } from "@/lib/admin/availability";
import { getMarloRoomCategories } from "@/lib/admin/physical-rooms";

export async function GET(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const query = new URL(request.url).searchParams;
  const slug = query.get("slug") || "";
  const checkIn = query.get("checkIn");
  const checkOut = query.get("checkOut");
  if (!slug || !checkIn || !checkOut || !(await getMarloRoomCategories()).some((category) => category.slug === slug)) {
    return NextResponse.json({ error: "Valid category and dates are required." }, { status: 400 });
  }
  const [capacity, rooms] = await Promise.all([getAvailableCapacity(slug, checkIn, checkOut), getAvailablePhysicalRooms(slug, checkIn, checkOut)]);
  return NextResponse.json({ available: capacity.available, capacity: capacity.capacity, rooms });
}
