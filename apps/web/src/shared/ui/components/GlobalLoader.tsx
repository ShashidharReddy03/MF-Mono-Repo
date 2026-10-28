import { useAppSelector, t } from "@mf-bank/shared";

/** Thin top progress bar driven by the shared loader slice (every API call) */
const GlobalLoader = () => {
  const pending = useAppSelector((s) => s.loader.pending);
  if (!pending) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[2000] h-0.5 overflow-hidden bg-secondary/20" role="progressbar" aria-label={t("Loading")}>
      <div className="h-full w-1/3 animate-[loader_1.1s_ease-in-out_infinite] bg-secondary" />
    </div>
  );
};

export default GlobalLoader;
