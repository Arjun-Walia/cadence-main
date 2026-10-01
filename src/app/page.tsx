import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { HomePage } from "@/components/marketing/home";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    absolute: "Proofline — decide who to contact first",
  },
  description:
    "Rank open deals from your own records, see why each one matters, and approve the next step.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/decisions");

  return <HomePage />;
}
