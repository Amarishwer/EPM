ALTER TABLE "properties" ADD COLUMN "locality" TEXT;
ALTER TABLE "properties" ADD COLUMN "latitude" DECIMAL;
ALTER TABLE "properties" ADD COLUMN "longitude" DECIMAL;
ALTER TABLE "properties" ADD COLUMN "propertyType" TEXT NOT NULL DEFAULT 'RESIDENTIAL';
ALTER TABLE "properties" ADD COLUMN "bedrooms" INTEGER;
ALTER TABLE "properties" ADD COLUMN "bathrooms" INTEGER;
