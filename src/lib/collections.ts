import { getCollection, type CollectionEntry } from 'astro:content';

type DraftCollection = 'blog' | 'projects';

export async function getPublishedEntries<T extends DraftCollection>(
  collection: T,
): Promise<CollectionEntry<T>[]> {
  const entries = await getCollection(collection);
  return entries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
