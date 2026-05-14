import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import Modal from "./Modal";

type ConfirmOptions = {
  title?: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** Style the confirm button as destructive (red). Defaults to true. */
  destructive?: boolean;
};

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const Ctx = createContext<ConfirmFn | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((v: boolean) => void) | null>(null);

  const confirm: ConfirmFn = useCallback((options) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOpts(options);
    });
  }, []);

  const finish = (result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOpts(null);
  };

  const destructive = opts?.destructive ?? true;

  return (
    <Ctx.Provider value={confirm}>
      {children}
      <Modal open={!!opts} onClose={() => finish(false)} title={opts?.title ?? "Are you sure?"}>
        <div className="text-sm text-gray-700">{opts?.message}</div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => finish(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            {opts?.cancelText ?? "Cancel"}
          </button>
          <button
            type="button"
            onClick={() => finish(true)}
            className={
              destructive
                ? "px-4 py-2 rounded-lg bg-loss-red text-white hover:bg-red-700"
                : "px-4 py-2 rounded-lg bg-vivid-turquoise text-white hover:bg-turquoise"
            }
          >
            {opts?.confirmText ?? "Confirm"}
          </button>
        </div>
      </Modal>
    </Ctx.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const v = useContext(Ctx);
  if (!v) throw new Error("useConfirm must be used inside ConfirmProvider");
  return v;
}
