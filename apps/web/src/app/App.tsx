import { RouterProvider } from "react-router-dom";
import GlobalLoader from "@/shared/ui/components/GlobalLoader";
import useGlobalUnloadWarning from "@/shared/hooks/useGlobalUnload";
import { useSecurityRestrictions } from "@/shared/hooks/useSecurityRestrictions";
import { useLanguage } from "@/core/i18n/language";
import { useTheme } from "@/core/i18n/theme";
import ThemeProvider from "./providers/ThemeProvider";
import { router } from "./routes/router";

function App() {
  useGlobalUnloadWarning();
  useSecurityRestrictions();
  const language = useLanguage();
  const theme = useTheme();

  return (
    <ThemeProvider language={language} theme={theme}>
      <GlobalLoader />
      {/* key: re-render every screen in the new language / theme. The URL and
          the Redux session are untouched, so the user stays where they were. */}
      <RouterProvider key={`${language}-${theme}`} router={router} />
    </ThemeProvider>
  );
}

export default App;
