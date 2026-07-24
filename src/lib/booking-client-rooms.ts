export function getRoomBySlugSync<
  T extends { slug: string },
>(rooms: T[], slug: string): T | undefined {
  return rooms.find((room) => room.slug === slug);
}
