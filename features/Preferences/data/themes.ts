/**
 * Theme System — Public API
 *
 * Orchestrates theme building, lookup, and application.
 * All base theme palettes live in ./themeDefinitions.ts.
 * All color math lives in ./themeColors.ts.
 */
import { useCustomThemeStore } from '../store/useCustomThemeStore';
import { getWallpaperById } from './wallpapers';
import usePreferencesStore from '../store/usePreferencesStore';
import { LucideIcon } from 'lucide-react';
import baseThemeSets from './themeDefinitions';
import type { BaseTheme } from './themeDefinitions';
import {
  generateCardColor,
  generateBorderColor,
  generateAccentColor,
} from './themeColors';

// Re-export color utilities that consumers may need
export { generateCardColor, generateButtonBorderColor } from './themeColors';

// ============================================================================
// Types
// ============================================================================

interface Theme {
  id: string;
  backgroundColor: string;
  cardColor: string;
  borderColor: string;
  mainColor: string;
  mainColorAccent: string;
  secondaryColor: string;
  secondaryColorAccent: string;
}

interface ThemeGroup {
  name: string;
  icon: LucideIcon;
  themes: Theme[];
}

// ============================================================================
// Glass / Premium helpers
// ============================================================================

/**
 * Handles special cases for transparency (Glass themes).
 * Returns the card color with specific opacity for glass effects.
 */
export function getModifiedCardColor(
  themeId: string,
  cardColor: string,
): string {
  if (isPremiumThemeId(themeId)) {
    return 'oklch(20% 0.01 255 / 0.85)'; // Dark semi-transparent
  }
  return cardColor;
}

/**
 * Handles special cases for border transparency.
 */
export function getModifiedBorderColor(
  themeId: string,
  borderColor: string,
): string {
  if (isPremiumThemeId(themeId)) {
    // return 'oklch(100% 0 0 / 0.12)'; // Light semi-transparent
    return 'oklch(30% 0.01 255 / 0.85)'; // Dark semi-transparent
  }
  return borderColor;
}

// ============================================================================
// Wallpaper helpers
// ============================================================================

/**
 * Get wallpaper styles for a given wallpaper URL
 * @param wallpaperUrl - Direct URL to wallpaper image
 * @param isHighlighted - Whether the theme is currently hovered/highlighted
 * @returns CSS properties for wallpaper background, or empty object if no URL
 */
export function getWallpaperStyles(
  wallpaperUrl: string | undefined,
  isHighlighted: boolean,
): React.CSSProperties {
  if (!wallpaperUrl) return {};

  return {
    backgroundImage: `url('${wallpaperUrl}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: isHighlighted ? 'brightness(1)' : 'brightness(0.85)',
  };
}

/**
 * Get default wallpaper ID for a theme (if any)
 * Maps premium themes to their default wallpapers
 */
export function getThemeDefaultWallpaperId(
  themeId: string,
): string | undefined {
  const themeWallpaperMap: Record<string, string> = {
    'neon-city': 'neon-city-local',
    'tokyo-rain': 'tokyo-rain',
    'cyberpunk-street': 'cyberpunk-street',
    'sakura-night': 'sakura-night',
    'mt-fuji-sunset': 'mt-fuji-sunset',
    'purple-gradient': 'minimal-gradient-purple',
    'kyoto-lanterns': 'kyoto-lanterns',
    'arashiyama-bamboo': 'arashiyama-bamboo',
    'nara-temple': 'nara-temple',
    'osaka-riverwalk': 'osaka-riverwalk',
  };
  return themeWallpaperMap[themeId];
}

// Deprecated: kept for backwards compatibility, will be removed in future
export const getNeonCityWallpaperStyles = (isHighlighted: boolean) => ({
  backgroundImage: "url('/wallpapers/neonretrocarcity.jpg')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  filter: isHighlighted ? 'brightness(1)' : 'brightness(0.85)',
});

// ============================================================================
// Theme building
// ============================================================================

/**
 * Builds a complete Theme from a BaseTheme by generating derived colors.
 * @param base - The base theme definition
 * @param isLight - Whether this theme belongs to a light theme group
 */
function buildTheme(base: BaseTheme, isLight: boolean): Theme {
  return {
    id: base.id,
    backgroundColor: base.backgroundColor,
    cardColor: generateCardColor(base.backgroundColor, isLight),
    borderColor: generateBorderColor(base.backgroundColor, isLight),
    mainColor: base.mainColor,
    mainColorAccent: generateAccentColor(base.mainColor),
    secondaryColor: base.secondaryColor,
    secondaryColorAccent: generateAccentColor(base.secondaryColor),
  };
}

/**
 * Builds a complete ThemeGroup from a BaseThemeGroup.
 * Passes the isLight flag to each theme for proper card/border color generation.
 */
function buildThemeGroup(baseGroup: {
  name: string;
  icon: LucideIcon;
  isLight: boolean;
  themes: BaseTheme[];
}): ThemeGroup {
  return {
    name: baseGroup.name,
    icon: baseGroup.icon,
    themes: baseGroup.themes.map(theme => buildTheme(theme, baseGroup.isLight)),
  };
}

// ============================================================================
// Premium theme resolution
// ============================================================================

const premiumThemeIds = new Set(
  baseThemeSets
    .find(group => group.name.startsWith('Premium'))
    ?.themes.map(theme => theme.id) ?? [],
);

const legacyThemeAliases = new Map<string, string>([
  ['neon-city-glass', 'neon-city'],
]);

const resolveThemeId = (themeId: string): string =>
  legacyThemeAliases.get(themeId) ?? themeId;

export const isPremiumThemeId = (themeId: string): boolean =>
  premiumThemeIds.has(resolveThemeId(themeId));

// ============================================================================
// Built theme sets (default export)
// ============================================================================

// Build the complete theme sets with generated card and border colors
const themeSets: ThemeGroup[] = baseThemeSets.map(buildThemeGroup);

export default themeSets;

// ============================================================================
// Theme map & lookup
// ============================================================================

// Lazy-initialized theme map for efficient lookups
let _themeMap: Map<string, Theme> | null = null;

function getThemeMap(): Map<string, Theme> {
  if (!_themeMap) {
    _themeMap = new Map<string, Theme>();
    themeSets.forEach(group => {
      group.themes.forEach(theme => {
        _themeMap!.set(theme.id, theme);
      });
    });
  }
  return _themeMap;
}

/**
 * Converts a ThemeTemplate (from custom store) to a full Theme with accent colors.
 */
function buildThemeFromTemplate(template: {
  id: string;
  backgroundColor: string;
  cardColor: string;
  borderColor: string;
  mainColor: string;
  secondaryColor: string;
}): Theme {
  return {
    ...template,
    mainColorAccent: generateAccentColor(template.mainColor),
    secondaryColorAccent: generateAccentColor(template.secondaryColor),
  };
}

// Populate map with custom themes from store (lazy)
let _customThemesLoaded = false;

function ensureCustomThemesLoaded(): void {
  if (_customThemesLoaded) return;
  _customThemesLoaded = true;

  const themeMap = getThemeMap();
  useCustomThemeStore
    .getState()
    .themes.forEach(theme =>
      themeMap.set(theme.id, buildThemeFromTemplate(theme)),
    );

  // Subscribe to store updates
  useCustomThemeStore.subscribe(state => {
    state.themes.forEach(theme =>
      themeMap.set(theme.id, buildThemeFromTemplate(theme)),
    );
    // Clear cache to force rebuild of theme map next time it's accessed
    _themeMap = null;
  });
}

// ============================================================================
// Theme application (DOM)
// ============================================================================

export function applyTheme(themeId: string) {
  ensureCustomThemesLoaded();
  const resolvedThemeId = resolveThemeId(themeId);
  const theme = getThemeMap().get(resolvedThemeId);

  if (!theme) {
    console.error(`Theme "${themeId}" not found`);
    return;
  }

  usePreferencesStore
    .getState()
    .setGlassMode(isPremiumThemeId(resolvedThemeId));

  const root = document.documentElement;

  root.style.setProperty('--background-color', theme.backgroundColor);

  // Handle modified colors for glass themes
  const cardColor = getModifiedCardColor(theme.id, theme.cardColor);
  const borderColor = getModifiedBorderColor(theme.id, theme.borderColor);

  root.style.setProperty('--card-color', cardColor);
  root.style.setProperty('--border-color', borderColor);
  root.style.setProperty('--main-color', theme.mainColor);
  root.style.setProperty('--main-color-accent', theme.mainColorAccent);

  if (theme.secondaryColor) {
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty(
      '--secondary-color-accent',
      theme.secondaryColorAccent,
    );
  }

  root.setAttribute('data-theme', resolvedThemeId);

  // Apply wallpaper if theme has one
  const wallpaperId = getThemeDefaultWallpaperId(resolvedThemeId);
  if (wallpaperId) {
    const customWallpapers = usePreferencesStore.getState().customWallpapers;
    const wallpaper = getWallpaperById(wallpaperId, customWallpapers);

    if (wallpaper) {
      document.body.style.backgroundImage = `url('${wallpaper.url}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundAttachment = 'fixed';
    }
  } else {
    // Clear wallpaper if theme doesn't have one
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundAttachment = '';
  }
}

// Apply a theme object directly (live preview theme)
export function applyThemeObject(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty('--background-color', theme.backgroundColor);

  // Handle modified colors for glass themes
  const cardColor = getModifiedCardColor(theme.id, theme.cardColor);
  const borderColor = getModifiedBorderColor(theme.id, theme.borderColor);

  root.style.setProperty('--card-color', cardColor);
  root.style.setProperty('--border-color', borderColor);
  root.style.setProperty('--main-color', theme.mainColor);
  root.style.setProperty('--main-color-accent', theme.mainColorAccent);
  if (theme.secondaryColor) {
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty(
      '--secondary-color-accent',
      theme.secondaryColorAccent,
    );
  }
}

// Helper to get a specific theme
export function getTheme(themeId: string): Theme | undefined {
  ensureCustomThemesLoaded();
  return getThemeMap().get(resolveThemeId(themeId));
}
