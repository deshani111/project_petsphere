import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, getCachedSessionAccount } from "../../../../modules/auth/auth.service";

export default async function CreateBlogLayout({ children }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const account = await getCachedSessionAccount(sessionToken);

  if (!account) {
    redirect("/login?next=%2Fblog%2Fcreate");
  }

  return children;
}
