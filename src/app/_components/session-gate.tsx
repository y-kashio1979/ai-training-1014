import { getSessionUser } from "@/lib/session";
import { LoginScreen } from "./login-screen";
import { LogoutButton } from "./logout-button";
import { LunchLoader } from "./lunch-loader";
import { TokenSync } from "./token-sync";

/** ログインしていればランチの画面、していなければログイン画面を出す。 */
export async function SessionGate() {
  const user = await getSessionUser();
  if (!user) return <LoginScreen />;
  return (
    <>
      <TokenSync />
      <LunchLoader user={user} logoutButton={<LogoutButton />} />
    </>
  );
}
