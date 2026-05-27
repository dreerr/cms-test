import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const galleryItemSchema = z.object({
  type: z.enum(['image', 'video']),
  src: z.string(),
  caption: z.string().optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    sort: z.number(),
    year: z.number().optional(),
    tagline: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    summary: z.string().optional(),
    gallery: z.array(galleryItemSchema).optional().default([]),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { projects, pages };
