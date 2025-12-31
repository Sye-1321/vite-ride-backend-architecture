import { z } from 'zod';

export const firebaseConfigSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().nonempty(),
  FIREBASE_CLIENT_EMAIL: z.string().nonempty(),
  FIREBASE_PRIVATE_KEY: z.string().nonempty(),
});

export type FirebaseConfig = z.infer<typeof firebaseConfigSchema>;
