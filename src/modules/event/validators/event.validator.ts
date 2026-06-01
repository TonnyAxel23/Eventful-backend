import { z } from 'zod';

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(5000),
    category: z.string().min(2).max(50),
    bannerImage: z.string().url().optional(),
    venue: z.string().min(3).max(200),
    location: z.string().min(3).max(200),
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().transform(str => new Date(str)),
    price: z.number().min(0),
    quantity: z.number().int().positive(),
    reminderSettings: z.object({
      oneHour: z.boolean().optional(),
      oneDay: z.boolean().optional(),
      threeDays: z.boolean().optional(),
      oneWeek: z.boolean().optional(),
    }).optional(),
  }),
});

export const updateEventSchema = z.object({
  body: createEventSchema.shape.body.partial(),
  params: z.object({
    id: z.string(),
  }),
});

export const eventIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const eventFiltersSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string().transform(str => new Date(str)).optional(),
    endDate: z.string().transform(str => new Date(str)).optional(),
    minPrice: z.string().transform(Number).optional(),
    maxPrice: z.string().transform(Number).optional(),
    search: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});
