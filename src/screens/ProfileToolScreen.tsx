import { User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { db } from "@/config/firebase";
import {
  BodyMetricsContent,
  CalorieCounterContent,
  ContactUsContent,
  FaqsContent,
  NotificationSettingsContent,
  PaymentMethodContent,
  PersonalDataContent,
  UpgradePlanContent
} from "@/screens/profile/ProfileSubpages";
import { AppRoute, UserProfile } from "@/types";

type Props = {
  user: User;
  title: string;
  onNavigate: (route: AppRoute) => void;
};

export function ProfileToolScreen({ user, title, onNavigate }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    return onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      setProfile(snapshot.exists() ? snapshot.data() as UserProfile : null);
    });
  }, [user.uid]);

  return (
    <Screen scroll>
      <Header title={title} subtitle="Nutrio account utility" onBack={() => onNavigate({ name: "main" })} />
      {title === "Nutrio Pro" ? <UpgradePlanContent user={user} onPayment={() => onNavigate({ name: "profileTool", title: "Payment Method" })} /> : null}
      {title === "Payment Method" ? <PaymentMethodContent user={user} /> : null}
      {title === "Notifications" ? <NotificationSettingsContent /> : null}
      {title === "Contact Us" ? <ContactUsContent user={user} onDone={() => onNavigate({ name: "main" })} /> : null}
      {title === "Help & Support" ? <FaqsContent /> : null}
      {title === "Personal Data" ? <PersonalDataContent profile={profile} onEdit={() => onNavigate({ name: "editProfile" })} /> : null}
      {title === "Body Metrics (TDEE/BMI)" ? <BodyMetricsContent profile={profile} /> : null}
      {title === "Calorie Counter" ? <CalorieCounterContent profile={profile} /> : null}
    </Screen>
  );
}
