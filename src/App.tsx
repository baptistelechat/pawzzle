import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Grid } from "@/components/Grid";
import { useLevel } from "@/hooks/useLevel";

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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Pawzzle</h1>

      {status === "loading" || !level ? (
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Erreurs : {errors} / {maxErrors}
          </p>
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
          {status === "won" && (
            <p className="text-lg font-semibold text-primary">
              Niveau réussi !
            </p>
          )}
          {status === "lost" && (
            <p className="text-lg font-semibold text-destructive">
              Niveau échoué — budget d'erreur épuisé.
            </p>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={help} onCheckedChange={setHelp} />
              Aide
            </label>
            <Button onClick={newLevel}>Nouveau niveau</Button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
