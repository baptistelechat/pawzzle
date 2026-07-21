import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Grid } from "@/components/Grid";
import { Nav } from "@/components/Nav";
import { useLevel } from "@/hooks/useLevel";
import { cn } from "@/lib/utils";

function App() {
  const {
    level,
    placed,
    markers,
    errors,
    maxErrors,
    status,
    help,
    setHelp,
    togglePaw,
    toggleMarker,
    setMarker,
    newLevel,
  } = useLevel();

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-5xl font-bold">Pawzzle</h1>

        {status === "loading" || !level ? (
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className="flex items-center gap-4">
              <p
                className={cn(
                  "text-sm font-medium",
                  status === "won" && "text-primary",
                  status === "lost" && "text-destructive",
                  status === "playing" && "text-muted-foreground",
                )}
              >
                {status === "won"
                  ? "Niveau réussi !"
                  : status === "lost"
                    ? "Niveau échoué — budget d'erreur épuisé."
                    : `Erreurs : ${errors} / ${maxErrors}`}
              </p>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={help} onCheckedChange={setHelp} />
                Aide
              </label>
            </div>
            <div className="w-full max-w-md">
              <Grid
                grid={level.grid}
                placed={placed}
                markers={markers}
                help={help}
                onTogglePaw={togglePaw}
                onToggleMarker={toggleMarker}
                onSetMarker={setMarker}
              />
            </div>
            <Button onClick={newLevel}>
              {status === "playing" ? "Nouvelle partie" : "Rejouer"}
            </Button>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
