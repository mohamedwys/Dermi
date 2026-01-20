-- CreateEnum
CREATE TYPE "WorkflowType" AS ENUM ('DEFAULT', 'CUSTOM');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WidgetSettings" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "position" TEXT NOT NULL DEFAULT 'bottom-right',
    "buttonText" TEXT NOT NULL DEFAULT 'Ask AI Assistant',
    "chatTitle" TEXT NOT NULL DEFAULT 'AI Sales Assistant',
    "welcomeMessage" TEXT NOT NULL DEFAULT 'Hello! I''m your AI sales assistant. I can help you find products, answer questions about pricing, shipping, and provide personalized recommendations. How can I assist you today?',
    "inputPlaceholder" TEXT NOT NULL DEFAULT 'Ask me anything about our products...',
    "primaryColor" TEXT NOT NULL DEFAULT '#ee5cee',
    "webhookUrl" TEXT,
    "interfaceLanguage" TEXT NOT NULL DEFAULT 'en',
    "plan" TEXT NOT NULL DEFAULT 'BASIC',
    "openaiApiKey" TEXT,
    "apiKeyLastTested" TIMESTAMP(3),
    "apiKeyLastUpdated" TIMESTAMP(3),
    "apiKeyStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowType" "WorkflowType" NOT NULL DEFAULT 'DEFAULT',
    "ratingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "ratingCustomTitle" TEXT,
    "ratingCustomThankYou" TEXT,

    CONSTRAINT "WidgetSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductEmbedding" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productHandle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "embedding" TEXT NOT NULL,
    "embeddingModel" TEXT NOT NULL DEFAULT 'text-embedding-3-small',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "customerId" TEXT,
    "sessionId" TEXT NOT NULL,
    "preferences" TEXT NOT NULL DEFAULT '{}',
    "browsingHistory" TEXT NOT NULL DEFAULT '[]',
    "purchaseHistory" TEXT NOT NULL DEFAULT '[]',
    "interactions" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "context" TEXT NOT NULL DEFAULT '{}',
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" INTEGER,
    "ratingComment" TEXT,
    "ratedAt" TIMESTAMP(3),

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "intent" TEXT,
    "sentiment" TEXT,
    "confidence" DOUBLE PRECISION,
    "productsShown" TEXT NOT NULL DEFAULT '[]',
    "productClicked" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatAnalytics" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topIntents" TEXT NOT NULL DEFAULT '{}',
    "topProducts" TEXT NOT NULL DEFAULT '{}',
    "sentimentBreakdown" TEXT NOT NULL DEFAULT '{}',
    "conversionsTracked" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowUsage" TEXT NOT NULL DEFAULT '{}',

    CONSTRAINT "ChatAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playing_with_neon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" REAL,

    CONSTRAINT "playing_with_neon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'BASIC',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ByokUsage" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalApiCalls" INTEGER NOT NULL DEFAULT 0,
    "totalTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "plan" TEXT NOT NULL DEFAULT 'BYOK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ByokUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WidgetSettings_shop_key" ON "WidgetSettings"("shop");

-- CreateIndex
CREATE INDEX "ProductEmbedding_shop_productHandle_idx" ON "ProductEmbedding"("shop", "productHandle");

-- CreateIndex
CREATE UNIQUE INDEX "ProductEmbedding_shop_productId_key" ON "ProductEmbedding"("shop", "productId");

-- CreateIndex
CREATE INDEX "UserProfile_shop_customerId_idx" ON "UserProfile"("shop", "customerId");

-- CreateIndex
CREATE INDEX "UserProfile_shop_updatedAt_idx" ON "UserProfile"("shop", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_shop_sessionId_key" ON "UserProfile"("shop", "sessionId");

-- CreateIndex
CREATE INDEX "ChatSession_shop_userProfileId_idx" ON "ChatSession"("shop", "userProfileId");

-- CreateIndex
CREATE INDEX "ChatSession_shop_lastMessageAt_idx" ON "ChatSession"("shop", "lastMessageAt");

-- CreateIndex
CREATE INDEX "ChatSession_shop_ratedAt_idx" ON "ChatSession"("shop", "ratedAt");

-- CreateIndex
CREATE INDEX "ChatMessage_sessionId_timestamp_idx" ON "ChatMessage"("sessionId", "timestamp");

-- CreateIndex
CREATE INDEX "ChatMessage_role_timestamp_idx" ON "ChatMessage"("role", "timestamp");

-- CreateIndex
CREATE INDEX "ChatAnalytics_shop_date_idx" ON "ChatAnalytics"("shop", "date");

-- CreateIndex
CREATE INDEX "ChatAnalytics_date_idx" ON "ChatAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ChatAnalytics_shop_date_key" ON "ChatAnalytics"("shop", "date");

-- CreateIndex
CREATE INDEX "Conversation_shop_sessionId_idx" ON "Conversation"("shop", "sessionId");

-- CreateIndex
CREATE INDEX "Conversation_shop_timestamp_idx" ON "Conversation"("shop", "timestamp");

-- CreateIndex
CREATE INDEX "ByokUsage_shop_date_idx" ON "ByokUsage"("shop", "date");

-- CreateIndex
CREATE INDEX "ByokUsage_date_idx" ON "ByokUsage"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ByokUsage_shop_date_key" ON "ByokUsage"("shop", "date");

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
