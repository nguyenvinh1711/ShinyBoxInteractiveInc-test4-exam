import { z } from 'zod/v4';

// * Get Item Schema
const getItemSchema = z.object({
    id: z.coerce.number(), // automatically convert string to number
});

// * Create Item Schema
const createItemSchema = z.object({
    // id: z.int32().positive(), // assume large data with int32 range, always increase 
    name: z.string(),
    price: z.number().min(100), // assume price >= 100 USD
    category: z.string(),
});

// * Query Item Schema
const queryItemSchema = z.object({
    limit: z.coerce.number().min(1).max(1000).default(10),
    q: z.string().optional(),
    page: z.coerce.number().min(1).default(1)
});

export { createItemSchema, getItemSchema, queryItemSchema };