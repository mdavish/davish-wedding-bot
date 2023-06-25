import { z } from "zod";

export const GuestSchema = z.object({
  "First Name": z.string().optional(),
  "Last Name": z.string().optional(),
  "Entity Type": z.string().optional(),
  Name: z.string().optional(),
  "Entity ID": z.string().optional(),
  "Welcome Drinks": z.coerce.number(),
  Rehearsal: z.coerce.number(),
  Wedding: z.coerce.number(),
  "Plus One?": z.string().optional(),
  "Plus One First": z.string().optional(),
  "Plus One Last": z.string().optional(),
  "Total People": z.string().optional(),
  Side: z.string().optional(),
  Group: z.string().optional(),
  "Mail Invite?": z.string().optional(),
  Phone: z.string().optional(),
});

export type Guest = z.infer<typeof GuestSchema>;
