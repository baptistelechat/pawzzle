import { useState } from "react";
import { Menu, User, X } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { haptics } from "@/lib/haptics";
import { EASE_DRAWER } from "@/lib/motion";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#niveaux", label: "Niveaux", active: true },
  { href: "#regle", label: "Règles" },
  { href: "#profile", label: "Profil" },
];

export const Nav = () => {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <nav className="border-b border-border bg-background">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <img src="/icon.svg" alt="" className="size-8 rounded-lg" />
          <span className="font-heading text-xl font-bold">Pawzzle</span>
        </div>

        <div className="hidden items-center gap-4 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                link.active
                  ? "font-medium text-primary"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* ponytail: avatar factice, compte utilisateur pas encore implémenté */}
          <Avatar>
            <AvatarFallback>
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => {
              haptics.cancel();
              haptics.trigger("selection");
              sounds.play(open ? "menu_close" : "menu_open");
              setOpen((prev) => !prev);
            }}
            className="text-foreground md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <m.div
            key="mobile-nav"
            id="mobile-nav"
            className="overflow-hidden border-t border-border px-4 text-sm md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { duration: 0.22, ease: EASE_DRAWER }
            }
          >
            <div className="flex flex-col gap-3 py-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    sounds.play("ui_click");
                    setOpen(false);
                  }}
                  className={cn(
                    link.active
                      ? "font-medium text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
