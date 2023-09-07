-- CreateTable
CREATE TABLE "Assets" (
    "id" SERIAL NOT NULL,
    "tags" VARCHAR(255)[],
    "type" VARCHAR(255),
    "author" VARCHAR(255),
    "image" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "dimensions" INTEGER[],

    CONSTRAINT "Assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auths" (
    "address" VARCHAR(255) NOT NULL,
    "lens" JSONB,
    "farcaster" JSONB,
    "twitter" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "auths_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "canvases" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "params" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "ipfsLink" VARCHAR(255)[],
    "imageLink" VARCHAR(255)[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "ownerAddress" VARCHAR(255),
    "referredFrom" VARCHAR(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    "isGated" BOOLEAN DEFAULT false,
    "allowList" VARCHAR(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    "gatedWith" VARCHAR(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],

    CONSTRAINT "canvases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "openseaLink" VARCHAR(255) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
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
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
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
    "openseaLink" VARCHAR(255) NOT NULL,
    "imageURL" TEXT,
    "permaLink" VARCHAR(255),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "address" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "ownerAddress" VARCHAR(255),
    "dimensions" INTEGER[],

    CONSTRAINT "nftData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owners" (
    "address" VARCHAR(255) NOT NULL,
    "canvasOwned" INTEGER DEFAULT 0,
    "nftOwned" INTEGER DEFAULT 0,
    "mail" VARCHAR(255),
    "lens_auth_token" JSONB,
    "twitter_auth_token" JSONB,
    "lens_handle" VARCHAR(255),
    "followNftAddress" VARCHAR(255),
    "profileId" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" SERIAL NOT NULL,
    "data" JSON NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploadeds" (
    "id" SERIAL NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "uploadeds_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "canvases" ADD CONSTRAINT "canvases_ownerAddress_fkey" FOREIGN KEY ("ownerAddress") REFERENCES "owners"("address") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nftData" ADD CONSTRAINT "nftData_ownerAddress_fkey" FOREIGN KEY ("ownerAddress") REFERENCES "owners"("address") ON DELETE SET NULL ON UPDATE CASCADE;

