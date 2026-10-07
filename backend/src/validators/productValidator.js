import { z } from 'zod';

const uuid = z.string().uuid('Invalid ID format');

const money = z.coerce
  .number({ invalid_type_error: 'Price must be a number' })
  .min(0, 'Price must be non-negative')
  .max(999999.99, 'Price is too high');

const stock = z.coerce
  .number({ invalid_type_error: 'Stock must be a number' })
  .int('Stock must be a whole number')
  .min(0, 'Stock must be non-negative');

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(100),
  description: z.string().max(1000).optional().nullable(),
  image: z.string().max(255).optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProductSchema = z.object({
  categoryId: uuid,
  name: z.string().trim().min(1, 'Product name cannot be empty').max(255),
  description: z.string().max(2000).optional().nullable(),
  price: money,
  discountPrice: money.optional().nullable(),
  stockQuantity: stock.optional(),
  minimumStock: stock.optional(),
  image: z.string().max(255).optional().nullable(),
  brand: z.string().trim().max(100).optional().nullable(),
  requiresPrescription: z.coerce.boolean().optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  category: uuid.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  stockStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock']).optional(),
  requiresPrescription: z.enum(['true', 'false']).optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: uuid,
        quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'Order must contain at least one item'),
  deliveryAddress: z.string().max(2000).optional().nullable(),
});

export const verifyPrescriptionSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  paymentStatus: z.enum(['pending', 'paid', 'refunded']).optional(),
});

export default {
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  createOrderSchema,
  verifyPrescriptionSchema,
  updateOrderStatusSchema,
};
