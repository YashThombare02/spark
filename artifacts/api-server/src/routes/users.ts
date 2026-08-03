import { Router, type IRouter } from "express";
import { eq, and, ne, notInArray, sql } from "drizzle-orm";
import { db, usersTable, swipesTable, matchesTable } from "@workspace/db";
import { UpdateMeBody, DiscoverUsersQueryParams } from "@workspace/api-zod";
import { userToResponse } from "./auth";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

router.get("/users/me", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json(userToResponse(user));
});

router.patch("/users/me/update", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof usersTable.$inferInsert> = {};
  if (parsed.data.bio != null) updateData.bio = parsed.data.bio;
  if (parsed.data.city != null) updateData.city = parsed.data.city;
  if (parsed.data.interests != null) updateData.interests = parsed.data.interests;

  const [updated] = await db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, userId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(userToResponse(updated));
});

router.get("/users/discover", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const qp = DiscoverUsersQueryParams.safeParse(req.query);
  const params = qp.success ? qp.data : {};

  const [me] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!me) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  // Find users already swiped
  const alreadySwiped = await db
    .select({ toUserId: swipesTable.toUserId })
    .from(swipesTable)
    .where(eq(swipesTable.fromUserId, userId));
  const swipedIds = alreadySwiped.map((s) => s.toUserId);

  let query = db
    .select()
    .from(usersTable)
    .where(
      and(
        ne(usersTable.id, userId),
        eq(usersTable.gender, me.interestedIn),
        swipedIds.length > 0 ? notInArray(usersTable.id, swipedIds) : undefined,
      ),
    );

  const users = await query;

  let filtered = users;
  if (params.minAge) filtered = filtered.filter((u) => u.age >= params.minAge!);
  if (params.maxAge) filtered = filtered.filter((u) => u.age <= params.maxAge!);
  if (params.city) {
    const cityLower = params.city.toLowerCase();
    filtered = filtered.filter((u) => u.city.toLowerCase().includes(cityLower));
  }

  res.json(filtered.map(userToResponse));
});

router.get("/users/stats", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const [likesSentRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(swipesTable)
    .where(
      and(
        eq(swipesTable.fromUserId, userId),
        sql`${swipesTable.action} IN ('like', 'superlike')`,
      ),
    );

  const [likesReceivedRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(swipesTable)
    .where(
      and(
        eq(swipesTable.toUserId, userId),
        sql`${swipesTable.action} IN ('like', 'superlike')`,
      ),
    );

  const [superLikesRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(swipesTable)
    .where(
      and(eq(swipesTable.fromUserId, userId), eq(swipesTable.action, "superlike")),
    );

  const [matchesRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(matchesTable)
    .where(
      sql`${matchesTable.user1Id} = ${userId} OR ${matchesTable.user2Id} = ${userId}`,
    );

  res.json({
    likesSent: likesSentRow?.count ?? 0,
    likesReceived: likesReceivedRow?.count ?? 0,
    matches: matchesRow?.count ?? 0,
    superLikes: superLikesRow?.count ?? 0,
    profileViews: Math.floor(Math.random() * 50) + 5,
  });
});

export default router;
