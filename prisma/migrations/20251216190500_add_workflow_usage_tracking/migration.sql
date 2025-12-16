-- AddWorkflowUsageTracking
-- Add workflowUsage field to ChatAnalytics table to track default vs custom workflow usage

-- AlterTable
ALTER TABLE "ChatAnalytics" ADD COLUMN "workflowUsage" TEXT NOT NULL DEFAULT '{}';
