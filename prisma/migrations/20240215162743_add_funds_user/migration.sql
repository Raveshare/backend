-- AlterTable
ALTER TABLE "canvases" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- CreateTable
CREATE TABLE "user_funds" (
    "id" SERIAL NOT NULL,
    "topup" INTEGER NOT NULL DEFAULT 0,
    "wallet" VARCHAR(255),
    "wallet_pvtKey" VARCHAR(255),
    "userId" INTEGER NOT NULL,

    CONSTRAINT "user_funds_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_funds" ADD CONSTRAINT "user_funds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
