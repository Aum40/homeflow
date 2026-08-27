-- CreateTable
CREATE TABLE "app_settings" (
    "id" UUID NOT NULL,
    "company_name" TEXT,
    "company_address" TEXT,
    "company_logo_url" TEXT,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);
