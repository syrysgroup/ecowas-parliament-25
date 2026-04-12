/**
 * CRMAvatar — Universal avatar component for the ECOWAS Parliament CRM.
 *
 * Features:
 *  - Photo or initials fallback with deterministic colour
 *  - Five sizes: xs | sm | md | lg | xl
 *  - Shape: circle (default) | rounded | square
 *  - Status dot: online | away | busy | offline | none
 *  - Badge slot for count/notification overlays
 */

import { useMemo } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
export type AvatarSize   = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape  = "circle" | "rounded" | "square";
export type AvatarStatus = "online" | "away" | "busy" | "offline" | "none";

interface CRMAvatarProps {
  /** Image URL — falls back to initials if absent or broken */
  src?: string | null;
  /** Display name — used to derive initials and avatar colour */
  name?: string;
  /** xs=24 sm=32 md=40 lg=56 xl=72 */
  size?: AvatarSize;
  /** circle (default) | rounded | square */
  shape?: AvatarShape;
  /** Presence status dot */
  status?: AvatarStatus;
  /** Small badge overlay (top-right) — e.g. unread count */
  badge?: number | string;
  className?: string;
}

// ── Size map ──────────────────────────────────────────────────────────────────
const SIZE: Record<AvatarSize, { wh: string; text: string; dot: string; dotPos: string; badge: string }> = {
  xs: { wh: "w-6 h-6",   text: "text-[9px]",  dot: "w-1.5 h-1.5", dotPos: "bottom-0 right-0",     badge: "w-3.5 h-3.5 text-[8px]"  },
  sm: { wh: "w-8 h-8",   text: "text-[11px]", dot: "w-2 h-2",     dotPos: "bottom-0 right-0",     badge: "w-4 h-4 text-[9px]"     },
  md: { wh: "w-10 h-10", text: "text-[13px]", dot: "w-2.5 h-2.5", dotPos: "bottom-0.5 right-0.5", badge: "w-5 h-5 text-[10px]"    },
  lg: { wh: "w-14 h-14", text: "text-[18px]", dot: "w-3 h-3",     dotPos: "bottom-1 right-1",     badge: "w-5 h-5 text-[10px]"    },
  xl: { wh: "w-[72px] h-[72px]", text: "text-[22px]", dot: "w-3.5 h-3.5", dotPos: "bottom-1 right-1", badge: "w-6 h-6 text-[11px]" },
};

// ── Shape map ─────────────────────────────────────────────────────────────────
const SHAPE: Record<AvatarShape, string> = {
  circle:  "rounded-full",
  rounded: "rounded-xl",
  square:  "rounded-none",
};

// ── Status colours ────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<AvatarStatus, string> = {
  online:  "bg-[#71dd37] ring-2 ring-crm-card",
  away:    "bg-[#ffab00] ring-2 ring-crm-card",
  busy:    "bg-[#ff3e1d] ring-2 ring-crm-card",
  offline: "bg-[#a8aaae] ring-2 ring-crm-card",
  none:    "hidden",
};

// ── Deterministic initials colour (8 options) ─────────────────────────────────
const PALETTE = [
  "bg-[#696cff] text-white",  // purple
  "bg-[#03c3ec] text-white",  // cyan
  "bg-[#71dd37] text-white",  // green
  "bg-[#ffab00] text-white",  // amber
  "bg-[#ff3e1d] text-white",  // red
  "bg-[#6f42c1] text-white",  // violet
  "bg-[#20c997] text-white",  // teal
  "bg-[#fd7e14] text-white",  // orange
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CRMAvatar({
  src,
  name = "",
  size  = "md",
  shape = "circle",
  status = "none",
  badge,
  className = "",
}: CRMAvatarProps) {
  const s   = SIZE[size];
  const sh  = SHAPE[shape];
  const pal = useMemo(() => PALETTE[hashName(name || "?") % PALETTE.length], [name]);
  const ini = useMemo(() => name ? getInitials(name) : "?", [name]);

  return (
    <span className={`relative inline-flex shrink-0 ${s.wh} ${className}`}>
      {/* Image or initials */}
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${s.wh} ${sh} object-cover`}
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <span
          className={`${s.wh} ${sh} ${pal} flex items-center justify-center font-bold select-none`}
        >
          <span className={s.text}>{ini}</span>
        </span>
      )}

      {/* Status dot */}
      {status !== "none" && (
        <span
          className={`absolute ${s.dotPos} ${s.dot} rounded-full border border-crm-card ${STATUS_COLOR[status]}`}
          title={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      )}

      {/* Badge overlay */}
      {badge !== undefined && (
        <span className={`absolute -top-1 -right-1 ${s.badge} rounded-full bg-red-500 text-white font-bold flex items-center justify-center border border-crm-card`}>
          {badge}
        </span>
      )}
    </span>
  );
}

// ── Avatar Group (stack of avatars) ──────────────────────────────────────────
interface CRMAvatarGroupProps {
  items: Array<{ src?: string | null; name: string; status?: AvatarStatus }>;
  size?: AvatarSize;
  max?: number;
}

export function CRMAvatarGroup({ items, size = "sm", max = 4 }: CRMAvatarGroupProps) {
  const visible = items.slice(0, max);
  const overflow = items.length - max;
  const s = SIZE[size];

  return (
    <div className="flex items-center">
      {visible.map((item, i) => (
        <span key={i} className="-ml-2 first:ml-0 relative" style={{ zIndex: visible.length - i }}>
          <CRMAvatar
            src={item.src}
            name={item.name}
            size={size}
            status={item.status}
            className="ring-2 ring-crm-card"
          />
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={`-ml-2 relative ${s.wh} rounded-full bg-crm-surface border-2 border-crm-card flex items-center justify-center ring-2 ring-crm-card`}
        >
          <span className={`${s.text} font-bold text-crm-text-muted`}>+{overflow}</span>
        </span>
      )}
    </div>
  );
}
