export type CustomAttributeEntity = {
  slug: string;
  label: string;
  entityType: string;
};

export const customAttributeEntities: CustomAttributeEntity[] = [
  {
    slug: "contacts",
    label: "Contacts",
    entityType: "org_contacts",
  },
];

export const getCustomAttributeEntity = (slug: string) =>
  customAttributeEntities.find((entity) => entity.slug === slug);
