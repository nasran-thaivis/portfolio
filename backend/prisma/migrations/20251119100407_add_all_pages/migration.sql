-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_sections" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL DEFAULT 'Welcome',
    "description" TEXT DEFAULT 'This is My First Project.',
    "imageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_sections" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL DEFAULT 'About Me',
    "description" TEXT,
    "imageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_sections_pkey" PRIMARY KEY ("id")
);
