-- Subscription payments recorded by the super-admin. Bookkeeping only: a row
-- says "this restaurant paid for N months starting on that day" — it does not
-- switch any feature on or off.
--
-- Additive and idempotent. `paidUntil` is stored (paidAt + months, computed in
-- src/super-admin/billing.ts) so the restaurant list can read the current
-- period without date maths in SQL.

CREATE TABLE IF NOT EXISTS "restaurant_payments" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "paidAt" DATE NOT NULL,
    "months" INTEGER NOT NULL,
    "paidUntil" DATE NOT NULL,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "restaurant_payments_months_check" CHECK ("months" IN (1, 3, 6, 12)),
    CONSTRAINT "restaurant_payments_period_check" CHECK ("paidUntil" > "paidAt")
);

CREATE INDEX IF NOT EXISTS "restaurant_payments_restaurantId_paidUntil_idx"
    ON "restaurant_payments"("restaurantId", "paidUntil");

DO $$ BEGIN
    ALTER TABLE "restaurant_payments"
        ADD CONSTRAINT "restaurant_payments_restaurantId_fkey"
        FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
