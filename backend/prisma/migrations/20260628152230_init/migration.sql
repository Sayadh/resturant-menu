-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'OWNER', 'MANAGER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('FOOD', 'DRINKS', 'ALCOHOL');

-- CreateEnum
CREATE TYPE "OrderDraftStatus" AS ENUM ('OPEN', 'SHOWN', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateTable
CREATE TABLE "themes" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceMonthly" INTEGER NOT NULL DEFAULT 0,
    "maxProducts" INTEGER,
    "maxDomains" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nativeName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurants" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "logoUrl" TEXT,
    "coverImageUrl" TEXT,
    "address" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'AMD',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Yerevan',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "themeId" UUID,
    "planId" UUID,
    "defaultLanguageId" UUID,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_translations" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "tagline" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,

    CONSTRAINT "restaurant_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_settings" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#3E2723',
    "secondaryColor" TEXT NOT NULL DEFAULT '#8A7868',
    "backgroundColor" TEXT NOT NULL DEFAULT '#F5EFE2',
    "accentColor" TEXT NOT NULL DEFAULT '#C69A5A',
    "fontFamily" TEXT NOT NULL DEFAULT 'modern',
    "cardRadius" INTEGER NOT NULL DEFAULT 22,
    "showRating" BOOLEAN NOT NULL DEFAULT true,
    "showBasket" BOOLEAN NOT NULL DEFAULT true,
    "showFavorites" BOOLEAN NOT NULL DEFAULT true,
    "showProductDescriptions" BOOLEAN NOT NULL DEFAULT true,
    "animationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_working_hours" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "openTime" TEXT,
    "closeTime" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'OWNER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantId" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domains" (
    "id" UUID NOT NULL,
    "domain" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantId" UUID NOT NULL,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "section" "SectionType" NOT NULL,
    "icon" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" UUID,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_translations" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "price" INTEGER NOT NULL,
    "oldPrice" INTEGER,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_translations" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "product_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT,
    "altText" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantId" UUID,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badge_translations" (
    "id" UUID NOT NULL,
    "badgeId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "badge_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_badges" (
    "productId" UUID NOT NULL,
    "badgeId" UUID NOT NULL,

    CONSTRAINT "product_badges_pkey" PRIMARY KEY ("productId","badgeId")
);

-- CreateTable
CREATE TABLE "order_drafts" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "status" "OrderDraftStatus" NOT NULL DEFAULT 'OPEN',
    "tableCode" TEXT,
    "sessionId" TEXT,
    "totalPriceSnapshot" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_draft_items" (
    "id" UUID NOT NULL,
    "orderDraftId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "order_draft_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "restaurantId" UUID,
    "userId" UUID,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "action" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_views" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "domain" TEXT,
    "path" TEXT,
    "language" TEXT,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_views" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_code_scans" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "tableCode" TEXT,
    "domain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_code_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_languages" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "languageId" UUID NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "restaurant_languages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "themes_key_key" ON "themes"("key");

-- CreateIndex
CREATE UNIQUE INDEX "plans_key_key" ON "plans"("key");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_slug_key" ON "restaurants"("slug");

-- CreateIndex
CREATE INDEX "restaurants_themeId_idx" ON "restaurants"("themeId");

-- CreateIndex
CREATE INDEX "restaurants_planId_idx" ON "restaurants"("planId");

-- CreateIndex
CREATE INDEX "restaurant_translations_languageId_idx" ON "restaurant_translations"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_translations_restaurantId_languageId_key" ON "restaurant_translations"("restaurantId", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_settings_restaurantId_key" ON "restaurant_settings"("restaurantId");

-- CreateIndex
CREATE INDEX "restaurant_working_hours_restaurantId_dayOfWeek_idx" ON "restaurant_working_hours"("restaurantId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_restaurantId_idx" ON "users"("restaurantId");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_tokenHash_idx" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "domains_restaurantId_idx" ON "domains"("restaurantId");

-- CreateIndex
CREATE INDEX "categories_restaurantId_section_idx" ON "categories"("restaurantId", "section");

-- CreateIndex
CREATE INDEX "categories_restaurantId_parentId_idx" ON "categories"("restaurantId", "parentId");

-- CreateIndex
CREATE INDEX "categories_restaurantId_sortOrder_idx" ON "categories"("restaurantId", "sortOrder");

-- CreateIndex
CREATE INDEX "category_translations_languageId_idx" ON "category_translations"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_categoryId_languageId_key" ON "category_translations"("categoryId", "languageId");

-- CreateIndex
CREATE INDEX "products_restaurantId_idx" ON "products"("restaurantId");

-- CreateIndex
CREATE INDEX "products_categoryId_sortOrder_idx" ON "products"("categoryId", "sortOrder");

-- CreateIndex
CREATE INDEX "products_restaurantId_isActive_idx" ON "products"("restaurantId", "isActive");

-- CreateIndex
CREATE INDEX "product_translations_languageId_idx" ON "product_translations"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "product_translations_productId_languageId_key" ON "product_translations"("productId", "languageId");

-- CreateIndex
CREATE INDEX "product_images_productId_idx" ON "product_images"("productId");

-- CreateIndex
CREATE INDEX "badges_restaurantId_idx" ON "badges"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "badges_restaurantId_key_key" ON "badges"("restaurantId", "key");

-- CreateIndex
CREATE INDEX "badge_translations_languageId_idx" ON "badge_translations"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "badge_translations_badgeId_languageId_key" ON "badge_translations"("badgeId", "languageId");

-- CreateIndex
CREATE INDEX "product_badges_badgeId_idx" ON "product_badges"("badgeId");

-- CreateIndex
CREATE INDEX "order_drafts_restaurantId_status_idx" ON "order_drafts"("restaurantId", "status");

-- CreateIndex
CREATE INDEX "order_drafts_restaurantId_createdAt_idx" ON "order_drafts"("restaurantId", "createdAt");

-- CreateIndex
CREATE INDEX "order_drafts_sessionId_idx" ON "order_drafts"("sessionId");

-- CreateIndex
CREATE INDEX "order_draft_items_orderDraftId_idx" ON "order_draft_items"("orderDraftId");

-- CreateIndex
CREATE INDEX "order_draft_items_productId_idx" ON "order_draft_items"("productId");

-- CreateIndex
CREATE INDEX "favorites_restaurantId_idx" ON "favorites"("restaurantId");

-- CreateIndex
CREATE INDEX "favorites_productId_idx" ON "favorites"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_deviceId_productId_key" ON "favorites"("deviceId", "productId");

-- CreateIndex
CREATE INDEX "audit_logs_restaurantId_createdAt_idx" ON "audit_logs"("restaurantId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "menu_views_restaurantId_createdAt_idx" ON "menu_views"("restaurantId", "createdAt");

-- CreateIndex
CREATE INDEX "menu_views_restaurantId_language_createdAt_idx" ON "menu_views"("restaurantId", "language", "createdAt");

-- CreateIndex
CREATE INDEX "product_views_restaurantId_createdAt_idx" ON "product_views"("restaurantId", "createdAt");

-- CreateIndex
CREATE INDEX "product_views_productId_createdAt_idx" ON "product_views"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "qr_code_scans_restaurantId_createdAt_idx" ON "qr_code_scans"("restaurantId", "createdAt");

-- CreateIndex
CREATE INDEX "qr_code_scans_restaurantId_tableCode_createdAt_idx" ON "qr_code_scans"("restaurantId", "tableCode", "createdAt");

-- CreateIndex
CREATE INDEX "restaurant_languages_languageId_idx" ON "restaurant_languages"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_languages_restaurantId_languageId_key" ON "restaurant_languages"("restaurantId", "languageId");

-- AddForeignKey
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_defaultLanguageId_fkey" FOREIGN KEY ("defaultLanguageId") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_translations" ADD CONSTRAINT "restaurant_translations_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_translations" ADD CONSTRAINT "restaurant_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_settings" ADD CONSTRAINT "restaurant_settings_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_working_hours" ADD CONSTRAINT "restaurant_working_hours_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badges" ADD CONSTRAINT "badges_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge_translations" ADD CONSTRAINT "badge_translations_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge_translations" ADD CONSTRAINT "badge_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_badges" ADD CONSTRAINT "product_badges_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_badges" ADD CONSTRAINT "product_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_drafts" ADD CONSTRAINT "order_drafts_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_draft_items" ADD CONSTRAINT "order_draft_items_orderDraftId_fkey" FOREIGN KEY ("orderDraftId") REFERENCES "order_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_draft_items" ADD CONSTRAINT "order_draft_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_views" ADD CONSTRAINT "menu_views_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_views" ADD CONSTRAINT "product_views_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_code_scans" ADD CONSTRAINT "qr_code_scans_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_languages" ADD CONSTRAINT "restaurant_languages_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_languages" ADD CONSTRAINT "restaurant_languages_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
