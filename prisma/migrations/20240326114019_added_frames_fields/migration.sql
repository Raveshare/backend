-- CreateTable
CREATE TABLE "assets" (
    "id" SERIAL NOT NULL,
    "tags" VARCHAR(255)[],
    "type" VARCHAR(255),
    "author" VARCHAR(255),
    "image" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "dimensions" INTEGER[],
    "campaign" VARCHAR(255),
    "featured" BOOLEAN DEFAULT false,
    "wallet" VARCHAR(255),

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canvases" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "params" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "ipfsLink" VARCHAR(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    "imageLink" VARCHAR(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "ownerAddress" VARCHAR(255),
    "referredFrom" VARCHAR(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    "isGated" BOOLEAN DEFAULT false,
    "allowList" VARCHAR(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    "gatedWith" VARCHAR(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    "assetsRecipientElementData" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "tags" VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[],
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "canvases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "openseaLink" VARCHAR(255) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contents" (
    "id" SERIAL NOT NULL,
    "tokenId" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "edition" VARCHAR(255),
    "ipfsLink" VARCHAR(255) NOT NULL,
    "imageURL" VARCHAR(255) NOT NULL,
    "openseaLink" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "collectionId" INTEGER,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nftData" (
    "id" SERIAL NOT NULL,
    "tokenId" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "openseaLink" VARCHAR(510) NOT NULL,
    "imageURL" VARCHAR(510),
    "permaLink" VARCHAR(510),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "address" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "ownerAddress" VARCHAR(255),
    "chainId" INTEGER,
    "dimensions" INTEGER[],
    "creators" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "nftData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owners" (
    "mail" VARCHAR(255),
    "farcaster_signer_uuid" VARCHAR(255),
    "farcaster_id" VARCHAR(255),
    "lens_auth_token" JSONB,
    "twitter_auth_token" JSONB,
    "lens_handle" VARCHAR(255),
    "followNftAddress" VARCHAR(255),
    "profileId" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "solana_address" VARCHAR(255),
    "evm_address" VARCHAR(255),
    "points" INTEGER NOT NULL DEFAULT 0,
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255),

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socials" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "lens_auth_token" JSONB,
    "lens_handle" VARCHAR(255),
    "followNftAddress" VARCHAR(255),
    "profileId" VARCHAR(255),
    "farcaster" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "socials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" SERIAL NOT NULL,
    "data" JSON NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "tags" VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploadeds" (
    "id" SERIAL NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "uploadeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_collected_posts" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "postId" VARCHAR(255) NOT NULL,

    CONSTRAINT "user_collected_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "campaign" VARCHAR(255),
    "locked" BOOLEAN DEFAULT true,
    "tag" VARCHAR(255),
    "groupId" VARCHAR(255),
    "taskIdInGroup" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_history" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "taskId" INTEGER,
    "reason" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "points_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "hostId" INTEGER,

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_participants" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER,
    "participantId" INTEGER,

    CONSTRAINT "room_participants_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "user_published_canvases" (
    "id" SERIAL NOT NULL,
    "canvasId" INTEGER,
    "ownerId" INTEGER,
    "platform" VARCHAR(255) NOT NULL,
    "xChain" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledAt" TIMESTAMPTZ(6),
    "txHash" VARCHAR(255),
    "metadata" JSON,

    CONSTRAINT "user_published_canvases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frames" (
    "id" SERIAL NOT NULL,
    "imageUrl" VARCHAR(255) NOT NULL,
    "tokenUri" VARCHAR(255) NOT NULL,
    "minters" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "owner" VARCHAR(255) NOT NULL,
    "isTopUp" BOOLEAN NOT NULL DEFAULT false,
    "allowedMints" INTEGER NOT NULL DEFAULT 0,
    "isLike" BOOLEAN NOT NULL DEFAULT false,
    "isRecast" BOOLEAN NOT NULL DEFAULT false,
    "isFollow" BOOLEAN NOT NULL DEFAULT false,
    "chainId" INTEGER NOT NULL,
    "contract_address" VARCHAR(255) NOT NULL,
    "contract_type" VARCHAR(255) NOT NULL DEFAULT 'ERC721',
    "redirectLink" VARCHAR(255),
    "creatorSponsored" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "gatedChannel" TEXT,
    "gatedCollection" TEXT,

    CONSTRAINT "frames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_canvas" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "canvasId" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_canvas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_mint_canvas" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "canvasId" INTEGER NOT NULL,
    "contract" VARCHAR(255) NOT NULL,
    "hash" VARCHAR(255) NOT NULL,
    "chainId" INTEGER NOT NULL,
    "contractType" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_mint_canvas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_funds" (
    "id" SERIAL NOT NULL,
    "topup" INTEGER NOT NULL DEFAULT 0,
    "wallet" VARCHAR(255),
    "wallet_pvtKey" VARCHAR(255),
    "sponsored" INTEGER NOT NULL DEFAULT 10,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "user_funds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractRegistry" (
    "id" SERIAL NOT NULL,
    "contract" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "contractRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "owners_solana_address_key" ON "owners"("solana_address");

-- CreateIndex
CREATE UNIQUE INDEX "owners_evm_address_key" ON "owners"("evm_address");

-- CreateIndex
CREATE UNIQUE INDEX "owners_username_key" ON "owners"("username");

-- CreateIndex
CREATE UNIQUE INDEX "referral_referralCode_key" ON "referral"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "shared_canvas_slug_key" ON "shared_canvas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "shared_mint_canvas_slug_key" ON "shared_mint_canvas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_funds_userId_key" ON "user_funds"("userId");

-- AddForeignKey
ALTER TABLE "canvases" ADD CONSTRAINT "canvases_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nftData" ADD CONSTRAINT "nftData_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socials" ADD CONSTRAINT "socials_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploadeds" ADD CONSTRAINT "uploadeds_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_history" ADD CONSTRAINT "points_history_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_history" ADD CONSTRAINT "points_history_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_participants" ADD CONSTRAINT "room_participants_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_participants" ADD CONSTRAINT "room_participants_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral" ADD CONSTRAINT "referral_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_published_canvases" ADD CONSTRAINT "user_published_canvases_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_published_canvases" ADD CONSTRAINT "user_published_canvases_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "canvases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frames" ADD CONSTRAINT "frames_owner_fkey" FOREIGN KEY ("owner") REFERENCES "owners"("evm_address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_canvas" ADD CONSTRAINT "shared_canvas_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "canvases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_mint_canvas" ADD CONSTRAINT "shared_mint_canvas_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "canvases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_funds" ADD CONSTRAINT "user_funds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
