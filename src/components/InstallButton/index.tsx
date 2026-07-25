import { useEffect, useRef, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

interface InstallButtonProps {
  size?: "icon" | "icon-lg" | "icon-xl";
  className?: string;
}

export const InstallButton = ({
  size = "icon",
  className,
}: InstallButtonProps) => {
  const { canInstall, isIos, isStandalone, install } = useInstallPrompt();
  const [showHint, setShowHint] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showHint) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowHint(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showHint]);

  if (isStandalone || (!canInstall && !isIos)) return null;

  const handleClick = async () => {
    if (isIos) {
      setShowHint((prev) => !prev);
      return;
    }
    await install();
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        size={size}
        className={className}
        onClick={handleClick}
        aria-label="Installer l'application sur votre écran d'accueil"
        aria-expanded={isIos ? showHint : undefined}
      >
        {isIos ? <Share /> : <Download />}
      </Button>

      {isIos && showHint && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-card p-3 shadow-lg">
          <button
            type="button"
            onClick={() => setShowHint(false)}
            aria-label="Fermer"
            className="absolute right-2 top-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
          <p className="pr-4 text-xs leading-relaxed text-foreground">
            Appuyez sur{" "}
            <Share className="mx-0.5 inline size-3.5 align-text-bottom" /> puis<br/>
            <strong>«&nbsp;Sur l'écran d'accueil&nbsp;»</strong>.
          </p>
        </div>
      )}
    </div>
  );
};
