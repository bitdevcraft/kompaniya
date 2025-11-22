import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgRealEstateProjectsTable } from "./org-real-estate-projects";

export const orgRealEstatePropertyTypeEnum = pgEnum(
  "org_real_estate_property_type",
  ["unit", "plot", "villa", "apartment", "other"],
);

export const orgRealEstatePropertyListingTypeEnum = pgEnum(
  "org_real_estate_property_listing_type",
  ["sale", "rent"],
);

export const orgRealEstatePropertyStatusEnum = pgEnum(
  "org_real_estate_property_status",
  ["available", "reserved", "sold", "rented", "inactive"],
);

export const orgRealEstatePropertiesTable = pgTable(
  "org_real_estate_properties",
  {
    ...baseIdModel,
    ...baseTimestampModel,
    ...baseOrganizationModel,
    ...baseOwnerModel,

    name: varchar("name", { length: 255 }),
    description: text("description"),
    propertyCode: varchar("property_code", { length: 100 }),
    projectId: uuid("project_id").references(
      () => orgRealEstateProjectsTable.id,
      { onDelete: "restrict" },
    ),
    propertyType: orgRealEstatePropertyTypeEnum("property_type"),
    listingType: orgRealEstatePropertyListingTypeEnum("listing_type"),
    status: orgRealEstatePropertyStatusEnum("status").default("available"),
    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    floor: varchar("floor", { length: 50 }),
    area: numeric("area", { precision: 12, scale: 2 }),
    areaUnit: varchar("area_unit", { length: 50 }),
    addressLine1: varchar("address_line_1", { length: 255 }),
    addressLine2: varchar("address_line_2", { length: 255 }),
    city: varchar("city", { length: 150 }),
    state: varchar("state", { length: 150 }),
    country: varchar("country", { length: 150 }),
    postalCode: varchar("postal_code", { length: 20 }),
    askingPrice: numeric("asking_price", { precision: 14, scale: 2 }),
    askingRent: numeric("asking_rent", { precision: 14, scale: 2 }),
    currencyCode: varchar("currency_code", { length: 3 }),
    isFurnished: boolean("is_furnished").default(false),
    parkingSpots: integer("parking_spots"),
  },
);

export type NewOrgRealEstateProperty =
  typeof orgRealEstatePropertiesTable.$inferInsert;
export type OrgRealEstateProperty =
  typeof orgRealEstatePropertiesTable.$inferSelect;
