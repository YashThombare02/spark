import { Router, type IRouter } from "express";
import { eq, and, or, sql } from "drizzle-orm";
import { db, swipesTable, matchesTable, usersTable } from "@workspace/db";
import { userToResponse } from "./auth";

const router: IRouter = Router();

router.get("/likes", async (req, res): Promise<void> => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  // Get all users the current user has liked or super-liked
  const liked = await db
    .select({ toUserId: swipesTable.toUserId })
    .from(swipesTable)
    .where(
      and(
        eq(swipesTable.fromUserId, userId),
        sql`${swipesTable.action} IN ('like', 'superlike')`,
      ),
    );

  if (liked.length === 0) {
    res.json([]);
    return;
  }

  const likedIds = liked.map((l) => l.toUserId);
  const users = await db
    .select()
    .from(usersTable)
    .where(sql`${usersTable.id} = ANY(${likedIds})`);

  res.json(users.map(userToResponse));
});

router.get("/matches", async (req, res): Promise<void> => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const matches = await db
    .select()
    .from(matchesTable)
    .where(
      or(
        eq(matchesTable.user1Id, userId),
        eq(matchesTable.user2Id, userId),
      ),
    )
    .orderBy(matchesTable.createdAt);

  const result = [];
  for (const match of matches) {
    const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, otherUserId));

    if (user) {
      result.push({
        id: match.id,
        matchedAt: match.createdAt.toISOString(),
        user: userToResponse(user),
      });
    }
  }

  res.json(result);
});

export default router;
