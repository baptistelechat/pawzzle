import { useState } from "react";
import { Menu, User, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#niveaux", label: "Niveaux", active: true },
  { href: "#regle", label: "Règles" },
  { href: "#profile", label: "Profil" },
];

export const Nav = () => {
  const [open, setOpen] = useState(false);

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
            onClick={() => setOpen((prev) => !prev)}
            className="text-foreground md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
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
      )}
    </nav>
  );
};
