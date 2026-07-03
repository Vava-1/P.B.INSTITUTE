import { useState, useCallback, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * useConfirmDialog — returns a tuple of [confirmNode, confirm].
 * Render `confirmNode` anywhere in your component tree (e.g. at the end),
 * and call `confirm(message)` to prompt the user. Resolves true/false.
 *
 * Replaces native window.confirm() which is non-styled and blocks the UI thread.
 */
export function useConfirmDialog(): [ReactNode, (message: string, title?: string) => Promise<boolean>] {
  const [state, setState] = useState<{
    open: boolean;
    message: string;
    title: string;
    resolve: (v: boolean) => void;
  }>({ open: false, message: "", title: "Please confirm", resolve: () => {} });

  const confirm = useCallback((message: string, title = "Please confirm") => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, message, title, resolve });
    });
  }, []);

  const handleResult = (result: boolean) => {
    state.resolve(result);
    setState((s) => ({ ...s, open: false }));
  };

  const node = (
    <AlertDialog open={state.open} onOpenChange={(open) => { if (!open) handleResult(false); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{state.title}</AlertDialogTitle>
          <AlertDialogDescription>{state.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => handleResult(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleResult(true)}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return [node, confirm];
}
