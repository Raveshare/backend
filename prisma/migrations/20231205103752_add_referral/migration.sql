-- CreateTable
CREATE TABLE "referral" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "referralCode" TEXT NOT NULL,
    "referred" VARCHAR(255),
    "hasClaimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referral_referralCode_key" ON "referral"("referralCode");

-- AddForeignKey
ALTER TABLE "referral" ADD CONSTRAINT "referral_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
