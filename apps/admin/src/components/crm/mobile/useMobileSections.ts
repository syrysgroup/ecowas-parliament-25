import type { AppRole } from "@/contexts/AuthContext";
import { getModulesForRoles } from "../crmModules";
import { PRIMARY_TAB_PRIORITY, MORE_TAB, type MobileTab } from "./MobileNavConfig";

export function useMobileSections(roles: AppRole[]): MobileTab[] {
  const accessibleSections = new Set(getModulesForRoles(roles).map(m => m.section));

  const primaries = PRIMARY_TAB_PRIORITY
    .filter(tab => tab.requiresSection == null || accessibleSections.has(tab.requiresSection))
    .slice(0, 4);

  return [...primaries, MORE_TAB];
}
