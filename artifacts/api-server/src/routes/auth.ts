import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

function userToResponse(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    fullName: user.fullName,
    gender: user.gender,
    interestedIn: user.interestedIn,
    age: user.age,
    city: user.city,
    bio: user.bio,
    profileImage: user.profileImage,
    loginType: user.loginType,
    usernameOrEmail: user.usernameOrEmail,
    interests: user.interests,
    verified: user.verified,
    isOnline: user.isOnline,
  };
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { loginType, usernameOrEmail, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.usernameOrEmail, usernameOrEmail));

  if (!user || user.password !== password || user.loginType !== loginType) {
    res.status(401).json({ error: "Invalid username/email or password." });
    return;
  }

  req.session.userId = user.id;

  res.json({
    user: userToResponse(user),
    token: `session-${user.id}`,
  });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

export { userToResponse };
export default router;
