import { createContext } from "react";
import type { ReactNode } from "react";
import type { FeedSettings } from "../types";
import { useLocalStorage } from "../hooks/useLocalStorage";

/**
 * context/SettingsContext.tsx
 * -----------------------------------------------------------------------
 * Tercer ejemplo de estado global: la configuración del feed que define
 * el administrador en AdminSettings (ej. longitud máxima de publicación)
 * y que ahora es consumida también por el formulario de creación de post
 * tanto en el panel admin como en el de usuario. Antes vivía como un
 * useState local en AdminSettings y no afectaba a nadie más; ahora sí.
 */
export const DEFAULT_FEED_SETTINGS: FeedSettings = {
  allowComments: true,
  allowLikes: true,
  allowSharing: true,
  moderateComments: true,
  notifyNewPosts: true,
  autoApprove: false,
  maxPostLength: 500,
};

interface SettingsContextValue {
  settings: FeedSettings;
  setSettings: (value: FeedSettings) => void;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useLocalStorage<FeedSettings>("xgym_feed_settings", DEFAULT_FEED_SETTINGS);

  return <SettingsContext.Provider value={{ settings, setSettings }}>{children}</SettingsContext.Provider>;
}
