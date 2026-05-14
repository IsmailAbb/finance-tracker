import { useAuth } from "../auth/AuthContext";
import ProfileSection from "./settings/ProfileSection";
import PasswordSection from "./settings/PasswordSection";
import AccountsSection from "./settings/AccountsSection";
import CategoriesSection from "./settings/CategoriesSection";
import DangerSection from "./settings/DangerSection";

export default function Settings() {
  const { user, setUser, signOut } = useAuth();
  if (!user) return null;
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <ProfileSection user={user} setUser={setUser} />
      <PasswordSection />
      <AccountsSection currency={user.currency} />
      <CategoriesSection />
      <DangerSection signOut={signOut} />
    </div>
  );
}
