import { z } from 'zod';

export const afroMessageSchema = z.object({
  AFROMESSAGE_API_TOKEN: z.string().nonempty(),
});

export type AfroMessageConfig = z.infer<typeof afroMessageSchema>;
