import { z } from 'zod';

const articleDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date, expected YYYY-MM-DD').nullable().optional();
const optionalText = (max) => z.string().trim().max(max).nullable().optional();

export const newsletterSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Invalid email address').max(255),
  })
  .strict();

const articleFields = {
  category: z.enum(['news', 'health_library']),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(255),
  date: articleDate,
  readTime: optionalText(30),
  excerpt: optionalText(3000),
  body: optionalText(50000),
  url: optionalText(255),
};

export const createArticleSchema = z.object(articleFields).strict();

export const updateArticleSchema = z
  .object({
    category: z.enum(['news', 'health_library']).optional(),
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(255).optional(),
    date: articleDate,
    readTime: optionalText(30),
    excerpt: optionalText(3000),
    body: optionalText(50000),
    url: optionalText(255),
  })
  .strict();

export const storySchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
    title: optionalText(255),
    tag: optionalText(80),
    quote: z.string().trim().min(10, 'Please share a little more of your story.').max(3000),
    consent: z.boolean().refine((v) => v === true, 'Please confirm we may share your story.'),
  })
  .strict();