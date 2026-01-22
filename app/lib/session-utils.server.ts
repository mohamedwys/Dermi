/**
 * Session utilities for handling session management and locale changes
 *
 * This module provides utilities to handle session locale changes without
 * requiring re-authentication, fixing the issue where changing Shopify
 * language causes the app to require re-login.
 */

import { prisma as db } from "../db.server";
import { logger } from "./logger.server";

/**
 * Update session locale without invalidating the session
 * This fixes the issue where changing Shopify admin language requires re-login
 */
export async function updateSessionLocale(
  sessionId: string,
  newLocale: string
): Promise<void> {
  try {
    await db.session.update({
      where: { id: sessionId },
      data: { locale: newLocale },
    });

    logger.debug(
      { sessionId: sessionId.substring(0, 10) + "...", newLocale },
      "Updated session locale"
    );
  } catch (error) {
    logger.error(
      { error, sessionId: sessionId.substring(0, 10) + "...", newLocale },
      "Failed to update session locale"
    );
    // Don't throw - this is a non-critical update
  }
}

/**
 * Ensure session exists and is valid for the given shop
 * Returns true if session is valid, false otherwise
 */
export async function validateSession(shop: string): Promise<boolean> {
  try {
    const session = await db.session.findFirst({
      where: { shop },
      orderBy: { expires: "desc" },
    });

    if (!session) {
      logger.debug({ shop }, "No session found for shop");
      return false;
    }

    // Check if session is expired
    if (session.expires && new Date(session.expires) < new Date()) {
      logger.debug({ shop }, "Session expired");
      return false;
    }

    return true;
  } catch (error) {
    logger.error({ error, shop }, "Error validating session");
    return false;
  }
}

/**
 * Get session locale for a shop
 */
export async function getSessionLocale(shop: string): Promise<string | null> {
  try {
    const session = await db.session.findFirst({
      where: { shop },
      orderBy: { expires: "desc" },
      select: { locale: true },
    });

    return session?.locale || null;
  } catch (error) {
    logger.error({ error, shop }, "Error getting session locale");
    return null;
  }
}
