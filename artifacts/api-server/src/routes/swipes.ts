import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, swipesTable, matchesTable, usersTable } from "@workspace/db";
import { RecordSwipeBody } from "@workspace/api-zod";
import { userToResponse } from "./auth";

const router: IRouter = Router();

router.post("/swipes", async (req, res): Promise<void> => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = RecordSwipeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { targetUserId, action } = parsed.data;

  // Upsert: delete existing swipe if any, then insert
  await db
    .delete(swipesTable)
    .where(
      and(
        eq(swipesTable.fromUserId, userId),
        eq(swipesTable.toUserId, targetUserId),
      ),
    );

  await db.insert(swipesTable).values({
    fromUserId: userId,
    toUserId: targetUserId,
    action,
  });

  // Check for mutual match if the action is a like/superlike
  let isMatch = false;
  let matchedUser: ReturnType<typeof userToResponse> | undefined;

  if (action === "like" || action === "superlike") {
    const [theirSwipe] = await db
      .select()
      .from(swipesTable)
      .where(
        and(
          eq(swipesTable.fromUserId, targetUserId),
          eq(swipesTable.toUserId, userId),
          eq(swipesTable.action, "like"),
        ),
      );

    const [theirSuperSwipe] = !theirSwipe
      ? await db
          .select()
          .from(swipesTable)
          .where(
            and(
              eq(swipesTable.fromUserId, targetUserId),
              eq(swipesTable.toUserId, userId),
              eq(swipesTable.action, "superlike"),
            ),
          )
      : [theirSwipe];

    if (theirSwipe || theirSuperSwipe) {
      // Check if match already exists
      const existingMatch = await db
        .select()
        .from(matchesTable)
        .where(
          and(
            eq(matchesTable.user1Id, Math.min(userId, targetUserId)),
            eq(matchesTable.user2Id, Math.max(userId, targetUserId)),
          ),
        );

      if (existingMatch.length === 0) {
        await db.insert(matchesTable).values({
          user1Id: Math.min(userId, targetUserId),
          user2Id: Math.max(userId, targetUserId),
        });
        isMatch = true;

        const [matchUser] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, targetUserId));
        if (matchUser) matchedUser = userToResponse(matchUser);
      }
    }
  }

  res.json({
    isMatch,
    action,
    ...(matchedUser ? { matchedUser } : {}),
  });
});

export default router;
