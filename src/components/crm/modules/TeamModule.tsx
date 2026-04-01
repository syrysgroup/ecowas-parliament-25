import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CRM_ROLE_META } from "../crmRoles";
import type { AppRole } from "@/contexts/AuthContext";

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  country: string;
  roles: AppRole[];
}

export default function TeamModule() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<AppRole | "">("");

  const { data: members = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["crm-team"],
    queryFn: async () => {
      const [profilesRes, rolesRes] = await Promise.all([
        (supabase as any)
          .from("profiles")
          .select("id, full_name, email, country")
          .order("full_name", { ascending: true }),
        (supabase as any)
          .from("user_roles")
          .select("user_id, role"),
      ]);

      const profiles: any[] = profilesRes.data ?? [];
      const roleRows: any[] = rolesRes.data ?? [];

      const rolesByUser: Record<string, AppRole[]> = {};
      for (const r of roleRows) {
        if (!rolesByUser[r.user_id]) rolesByUser[r.user_id] = [];
        rolesByUser[r.user_id].push(r.role as AppRole);
      }

      return profiles
        .filter(p => (rolesByUser[p.id]?.length ?? 0) > 0)
        .map(p => ({
          id: p.id,
          full_name: p.full_name ?? "Unnamed",
          email: p.email ?? "",
          country: p.country ?? "—",
          roles: rolesByUser[p.id] ?? [],
        }));
    },
  });

  const allRoles = Array.from(new Set(members.flatMap(m => m.roles))).sort();

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      m.full_name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.country.toLowerCase().includes(q);
    const matchesRole = !filterRole || m.roles.includes(filterRole);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#c8e0cc]">Team Directory</h2>
          <p className="text-[12px] text-[#6b8f72] mt-0.5">
            {members.length} team member{members.length !== 1 ? "s" : ""} with system roles
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value as AppRole | "")}
            className="bg-[#0d1610] border border-[#1e2d22] text-[#a0c4a8] text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-700"
          >
            <option value="">All roles</option>
            {allRoles.map(r => (
              <option key={r} value={r}>{CRM_ROLE_META[r as AppRole]?.label ?? r}</option>
            ))}
          </select>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4a6650]" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-[#0d1610] border border-[#1e2d22] text-[#a0c4a8] text-xs rounded-lg pl-7 pr-3 py-1.5 w-40 focus:outline-none focus:border-emerald-700 placeholder:text-[#3a5040]"
            />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
          <div className="h-14 w-14 rounded-2xl bg-[#111a14] border border-[#1e2d22] flex items-center justify-center">
            <Users className="h-6 w-6 text-[#4a6650]" />
          </div>
          <p className="text-sm text-[#6b8f72]">
            {search || filterRole ? "No members match your filter." : "No team members found."}
          </p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(member => {
            const initials = member.full_name
              .split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

            return (
              <div
                key={member.id}
                className="bg-[#0d1610] border border-[#1e2d22] rounded-xl p-4 flex items-start gap-3 hover:border-[#2a3d2d] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#1e2d22] flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0 uppercase">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[#c8e0cc] truncate">{member.full_name}</p>
                  <p className="text-[11px] text-[#6b8f72] truncate">{member.email}</p>
                  <p className="text-[10px] text-[#4a6650] mt-0.5">{member.country}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.roles.map(role => {
                      const m = CRM_ROLE_META[role];
                      if (!m) return null;
                      return (
                        <span
                          key={role}
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${m.bgColour} ${m.colour} ${m.borderColour}`}
                        >
                          {m.shortLabel}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
