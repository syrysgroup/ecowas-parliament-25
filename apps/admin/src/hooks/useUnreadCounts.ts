import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UnreadCounts {
  "contact-submissions": number;
  "sponsor-inquiries": number;
  "volunteer": number;
  "media-accreditation": number;
  "forms": number;
  "youth-sub-pillars": number;
}

const ZERO: UnreadCounts = {
  "contact-submissions": 0,
  "sponsor-inquiries": 0,
  "volunteer": 0,
  "media-accreditation": 0,
  "forms": 0,
  "youth-sub-pillars": 0,
};

export function useUnreadCounts(): UnreadCounts {
  const { data } = useQuery<UnreadCounts>({
    queryKey: ["unread-counts"],
    queryFn: async () => {
      const [contacts, sponsors, volunteers, media, forms, youth] = await Promise.all([
        supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("sponsor_inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("volunteer_applications").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("media_accreditations").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("form_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("youth_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      return {
        "contact-submissions": contacts.count ?? 0,
        "sponsor-inquiries":   sponsors.count ?? 0,
        "volunteer":           volunteers.count ?? 0,
        "media-accreditation": media.count ?? 0,
        "forms":               forms.count ?? 0,
        "youth-sub-pillars":   youth.count ?? 0,
      };
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  return data ?? ZERO;
}
