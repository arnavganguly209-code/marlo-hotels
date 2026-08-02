import { AdminModulePage } from "@/components/admin/admin-module-page";
import { AdminRoomNumbersManager } from "@/components/admin/admin-room-numbers-manager";
import {
  getMarloRoomCategories,
  listPhysicalRooms,
} from "@/lib/admin/physical-rooms";

export const dynamic = "force-dynamic";

export default async function AdminRoomNumbersPage() {
  const [categories, rooms] = await Promise.all([
    getMarloRoomCategories(),
    listPhysicalRooms(),
  ]);

  return (
    <AdminModulePage
      title="Room Numbers"
      description="Physical room identifiers for every Marlo Hotels room category — add, edit, delete and set status."
    >
      <AdminRoomNumbersManager
        categories={categories}
        initialRooms={rooms}
      />
    </AdminModulePage>
  );
}
