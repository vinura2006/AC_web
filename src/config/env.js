const dotenv = require('dotenv');
const { z } = require('zod');

// Load environment variables from .env file if present
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().optional().default(''),
  SESSION_SECRET: z.string().default('change_this_to_a_random_secret_at_least_32_chars_long'),
  STORAGE_DRIVER: z.enum(['local', 'cloudinary']).default('local'),
  CLOUDINARY_URL: z.string().optional(),
  SITE_URL: z.string().default('http://localhost:3000'),
  TIMEZONE: z.string().default('Asia/Colombo')
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production') {
    if (!data.DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DATABASE_URL'],
        message: 'DATABASE_URL is required in production environment'
      });
    }
    if (!data.SESSION_SECRET || data.SESSION_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SESSION_SECRET'],
        message: 'SESSION_SECRET must be at least 32 characters in production'
      });
    }
    if (data.STORAGE_DRIVER === 'cloudinary' && !data.CLOUDINARY_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CLOUDINARY_URL'],
        message: 'CLOUDINARY_URL is required when STORAGE_DRIVER=cloudinary'
      });
    }
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  parsed.error.issues.forEach(issue => {
    console.error(` - ${issue.path.join('.')}: ${issue.message}`);
  });
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
  throw new Error('Invalid environment variables');
}

module.exports = parsed.data;
