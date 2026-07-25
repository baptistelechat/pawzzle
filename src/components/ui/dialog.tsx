import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { XIcon } from "lucide-react";

function Dialog({
  open: openProp,
  onOpenChange,
  ...props
}: DialogPrimitive.Root.Props) {
  const [openState, setOpenState] = React.useState(openProp ?? false);
  const open = openProp ?? openState;
  const actionsRef = React.useRef<DialogPrimitive.Root.Actions>(null);
  const pushedRef = React.useRef(false);
  const closingViaBackRef = React.useRef(false);

  React.useEffect(() => {
    // Sur mobile, le geste/bouton retour doit fermer le dialog plutôt que
    // quitter l'app : une entrée d'historique factice est poussée à
    // l'ouverture, consommée silencieusement à la fermeture — sauf si
    // c'est justement ce retour qui vient de la déclencher. Le `pushState`
    // ne dépend que de `pushedRef` (pas de la fonction de nettoyage) : en
    // StrictMode, React rejoue effet+cleanup une fois au montage, et un
    // `history.back()` posé dans le cleanup se résout de façon asynchrone —
    // le `popstate` qui en résulte arrivait alors sur l'écouteur du second
    // montage et refermait le dialog aussitôt ouvert.
    if (open) {
      if (!pushedRef.current) {
        history.pushState({ pawzzleDialog: true }, "");
        pushedRef.current = true;
      }
      const handlePopState = () => {
        closingViaBackRef.current = true;
        actionsRef.current?.close();
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
    if (pushedRef.current) {
      pushedRef.current = false;
      if (!closingViaBackRef.current) history.back();
      closingViaBackRef.current = false;
    }
    return undefined;
  }, [open]);

  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      open={open}
      actionsRef={actionsRef}
      onOpenChange={(next, eventDetails) => {
        haptics.cancel();
        haptics.trigger("selection");
        sounds.play(next ? "menu_open" : "menu_close");
        setOpenState(next);
        onOpenChange?.(next, eventDetails);
      }}
      {...props}
    />
  );
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  // Base UI ramène le focus sur le déclencheur à la fermeture (comportement
  // par défaut, nécessaire au clavier) — mais reposer le focus sur un petit
  // bouton juste après une interaction tactile fait zoomer Chrome Android
  // dessus (bug connu : https://github.com/ckeditor/ckeditor5/issues/1070).
  // On ne désactive donc ce retour de focus qu'au tactile.
  finalFocus = (closeType) => closeType !== "touch",
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        finalFocus={finalFocus}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
