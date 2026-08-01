import { AdminModulePage } from "@/components/admin/admin-module-page";
import { AdminRoomsManager } from "@/components/admin/admin-rooms-manager";
import { getOrbitRoomEntries } from "@/content/rooms";

export default async function AdminRoomsPage() {
  const entries = await getOrbitRoomEntries();

  return (
    <AdminModulePage
      title="Rooms"
      description="Manage the room catalogue that powers the public Marlo Hotels rooms pages."
    >
      <AdminRoomsManager initialEntries={entries} />
    </AdminModulePage>
  );
}
