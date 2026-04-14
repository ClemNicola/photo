import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/categories' }),
  schema: z.object({
    category: z.string(),
  }),
});

const photos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/photos' }),
  schema: z.object({
    id: z.coerce.string(),
    title: z.string(),
    date: z.coerce.date(),
    image: z.string(),
    category: z.string(),
    place: z.string(),
  }),
});

export const collections = { categories, photos };
