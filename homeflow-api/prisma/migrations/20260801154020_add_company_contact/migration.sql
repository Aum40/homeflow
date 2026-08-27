-- CreateTable
CREATE TABLE "company_contacts" (
    "id" UUID NOT NULL,
    "is_singleton" BOOLEAN NOT NULL DEFAULT true,
    "company_name" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "business_hours" TEXT,
    "line_id" TEXT,
    "facebook" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "company_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_contacts_is_singleton_key" ON "company_contacts"("is_singleton");
