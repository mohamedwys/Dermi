/**
 * Database Migration: Update Legacy Plan Codes
 *
 * This script updates existing widgetSettings records that use legacy plan codes
 * (BASIC, UNLIMITED) to use the new standardized codes (STARTER, PROFESSIONAL).
 */

import { prisma as db } from "../db.server";
import { PlanCode, normalizePlanCode } from "../lib/plans.config";
import { createLogger } from "../lib/logger.server";

const logger = createLogger({ service: 'plan-migration' });

/**
 * Migrate all widget settings to use new plan codes
 */
export async function migratePlanCodes(): Promise<{ updated: number; errors: number }> {
  let updated = 0;
  let errors = 0;

  try {
    // Get all widget settings
    const allSettings = await db.widgetSettings.findMany({
      select: {
        id: true,
        shop: true,
        plan: true
      }
    });

    logger.info({ count: allSettings.length }, 'Starting plan code migration');

    for (const setting of allSettings) {
      try {
        const currentPlan = setting.plan || 'BASIC';
        const normalizedPlan = normalizePlanCode(currentPlan);

        // Only update if plan code changed
        if (currentPlan !== normalizedPlan) {
          await db.widgetSettings.update({
            where: { id: setting.id },
            data: { plan: normalizedPlan }
          });

          logger.info({
            shop: setting.shop,
            oldPlan: currentPlan,
            newPlan: normalizedPlan
          }, 'Updated plan code');

          updated++;
        }
      } catch (error) {
        logger.error({
          error: error instanceof Error ? error.message : String(error),
          shop: setting.shop,
          plan: setting.plan
        }, 'Failed to update plan code for shop');
        errors++;
      }
    }

    logger.info({ updated, errors }, 'Plan code migration complete');
    return { updated, errors };
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error)
    }, 'Plan code migration failed');
    throw error;
  }
}

/**
 * Migrate a single shop's plan code
 */
export async function migrateSingleShopPlan(shop: string): Promise<boolean> {
  try {
    const setting = await db.widgetSettings.findUnique({
      where: { shop },
      select: { id: true, plan: true }
    });

    if (!setting) {
      logger.warn({ shop }, 'Shop not found for plan migration');
      return false;
    }

    const currentPlan = setting.plan || 'BASIC';
    const normalizedPlan = normalizePlanCode(currentPlan);

    if (currentPlan !== normalizedPlan) {
      await db.widgetSettings.update({
        where: { id: setting.id },
        data: { plan: normalizedPlan }
      });

      logger.info({
        shop,
        oldPlan: currentPlan,
        newPlan: normalizedPlan
      }, 'Migrated single shop plan code');

      return true;
    }

    return false;
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      shop
    }, 'Failed to migrate single shop plan code');
    return false;
  }
}
