import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { userToResponse } from "./auth";

const router: IRouter = Router();

const DEMO_CREDENTIALS = [
  { loginType: "gmail", usernameOrEmail: "emma@gmail.com", password: "Demo123" },
  { loginType: "gmail", usernameOrEmail: "sophia@gmail.com", password: "Demo123" },
  { loginType: "gmail", usernameOrEmail: "olivia@gmail.com", password: "Demo123" },
  { loginType: "gmail", usernameOrEmail: "james@gmail.com", password: "Demo123" },
  { loginType: "gmail", usernameOrEmail: "ethan@gmail.com", password: "Demo123" },
  { loginType: "gmail", usernameOrEmail: "noah@gmail.com", password: "Demo123" },
  { loginType: "instagram", usernameOrEmail: "@emma_life", password: "Insta123" },
  { loginType: "instagram", usernameOrEmail: "@sophia.xx", password: "Insta123" },
  { loginType: "instagram", usernameOrEmail: "@olivia_21", password: "Insta123" },
  { loginType: "instagram", usernameOrEmail: "@james.fit", password: "Insta123" },
  { loginType: "instagram", usernameOrEmail: "@ethan_official", password: "Insta123" },
  { loginType: "instagram", usernameOrEmail: "@noah_07", password: "Insta123" },
];

router.get("/demo-credentials", async (_req, res): Promise<void> => {
  const gmailCreds = [];
  const instaCreds = [];

  for (const cred of DEMO_CREDENTIALS) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.usernameOrEmail, cred.usernameOrEmail));

    const entry = {
      loginType: cred.loginType as "gmail" | "instagram",
      usernameOrEmail: cred.usernameOrEmail,
      password: cred.password,
      fullName: user?.fullName ?? cred.usernameOrEmail,
      profileImage: user?.profileImage ?? "",
    };

    if (cred.loginType === "gmail") {
      gmailCreds.push(entry);
    } else {
      instaCreds.push(entry);
    }
  }

  res.json({ gmail: gmailCreds, instagram: instaCreds });
});

export default router;
