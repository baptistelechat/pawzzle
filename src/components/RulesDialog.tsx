import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { TapInstructions } from "@/components/TapInstructions";
import { REGION_COLORS } from "@/lib/regionColors";
import { cn } from "@/lib/utils";
import { BookOpen, PawPrint, X } from "lucide-react";

interface RuleCell {
  mark?: "paw" | "cross";
  region?: number;
}

// Grilles pédagogiques 3x3 statiques (pas de logique de jeu) — lettres=lignes
// A/B/C, chiffres=colonnes 1-3, index row-major 0..8.
const RULES: { title: string; description: string; cells: RuleCell[] }[] = [
  {
    title: "Un chat par couleur",
    description: "Un quartier coloré n'accueille qu'un seul chat.",
    cells: [
      { region: 0, mark: "cross" }, // A1
      { region: 0, mark: "cross" }, // A2
      { region: 0, mark: "cross" }, // A3
      { region: 0, mark: "cross" }, // B1
      { region: 0, mark: "paw" }, // B2
      { region: 1 }, // B3
      { region: 0, mark: "cross" }, // C1
      { region: 1 }, // C2
      { region: 1 }, // C3
    ],
  },
  {
    title: "Un chat par ligne et par colonne",
    description: "Chaque ligne et chaque colonne n'accueille qu'un seul chat.",
    cells: [
      { region: 4, mark: "cross" }, // A1
      { region: 2, mark: "paw" }, // A2
      { region: 5, mark: "cross" }, // A3
      { region: 4 }, // B1
      { region: 4, mark: "cross" }, // B2
      { region: 5 }, // B3
      { region: 4 }, // C1
      { region: 5, mark: "cross" }, // C2
      { region: 5 }, // C3
    ],
  },
  {
    title: "Les chats ne se touchent pas",
    description: "Deux chats ne peuvent jamais se toucher, même en diagonale.",
    cells: [
      { region: 0, mark: "cross" }, // A1
      { region: 0, mark: "cross" }, // A2
      { region: 0, mark: "cross" }, // A3
      { region: 1, mark: "cross" }, // B1
      { region: 3, mark: "paw" }, // B2
      { region: 2, mark: "cross" }, // B3
      { region: 1, mark: "cross" }, // C1
      { region: 1, mark: "cross" }, // C2
      { region: 1, mark: "cross" }, // C3
    ],
  },
];

const RuleGrid = ({ cells }: { cells: RuleCell[] }) => (
  <div className="mx-auto grid w-32 grid-cols-3 gap-1" aria-hidden="true">
    {cells.map((cell, index) => (
      <div
        key={index}
        className={cn(
          "flex aspect-square items-center justify-center rounded-[28%] [corner-shape:squircle]",
          cell.region === undefined && "bg-muted",
        )}
        style={
          cell.region !== undefined
            ? { backgroundColor: REGION_COLORS[cell.region] }
            : undefined
        }
      >
        {cell.mark === "paw" && (
          <PawPrint className="size-2/3 text-foreground" />
        )}
        {cell.mark === "cross" && <X className="size-1/2 text-foreground/60" />}
      </div>
    ))}
  </div>
);

interface RulesDialogProps {
  size?: "icon" | "icon-lg" | "icon-xl";
  className?: string;
}

export const RulesDialog = ({ size = "icon", className }: RulesDialogProps) => (
  <Dialog>
    <DialogTrigger
      render={
        <Button
          variant="outline"
          size={size}
          className={className}
          aria-label="Règles du jeu"
        >
          <BookOpen />
        </Button>
      }
    />
    <DialogContent className="flex max-h-[85dvh] flex-col">
      <DialogHeader className="shrink-0">
        <DialogTitle className="flex items-center gap-2">
          <BookOpen className="size-4" />
          Règles du jeu
        </DialogTitle>
        <DialogDescription>
          Dans ce village, chaque chat a son quartier préféré et déteste avoir
          un voisin trop collé. Aide chacun à trouver sa place, sans jamais
          croiser la moustache d'un autre :<br />
          <span className="font-semibold text-primary">
            Un chat par couleur, par ligne, par colonne.
            <br />
            Zéro contact, même du bout de la patte.
          </span>
        </DialogDescription>
        <Separator className="mt-2" />
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 pr-1">
          {RULES.map((rule) => (
            <section key={rule.title} className="flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-semibold">{rule.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {rule.description}
                </p>
              </div>
              <RuleGrid cells={rule.cells} />
            </section>
          ))}
          <section className="flex flex-col gap-3 border-t border-border pt-6">
            <h3 className="text-sm font-semibold">Comment jouer ?</h3>
            <TapInstructions />
          </section>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
