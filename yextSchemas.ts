import { z } from "zod";

export const CoordinateSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const AddressSchema = z.object({
  line1: z.string(),
  city: z.string(),
  region: z.string().optional(),
  postalCode: z.string(),
  countryCode: z.string(),
});

export const MetaSchema = z.object({
  accountId: z.string(),
  uid: z.string(),
  id: z.string(),
  timestamp: z.string(),
  folderId: z.string(),
  language: z.string(),
  countryCode: z.string(),
  entityType: z.string(),
});

export const WeddingGuestSchema = z.object({
  address: AddressSchema.optional(),
  name: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  cityCoordinate: CoordinateSchema.optional(),
  c_hasPlusOne: z.boolean().optional(),
  c_side: z.string().optional(),
  geocodedCoordinate: CoordinateSchema.optional(),
  yextDisplayCoordinate: CoordinateSchema.optional(),
  yextRoutableCoordinate: CoordinateSchema.optional(),
  meta: MetaSchema,
});

export const APIResponseSchema = z.object({
  meta: z.object({
    uuid: z.string(),
    errors: z.array(z.any()),
  }),
  response: z.object({
    entities: z.array(z.any()),
    pageToken: z.string().optional(),
  }),
});

export type WeddingGuest = z.infer<typeof WeddingGuestSchema>;
export type APIResponse = z.infer<typeof APIResponseSchema>;
