import { isLinkAbsolute } from "@vuepress/helper/node";

import type { PWAOptions } from "./options.js";
import type { ManifestOption } from "../shared/index.js";

const appendBaseHelper = (base: string, link: string): string =>
  isLinkAbsolute(link) ? link.replace(/^\//, base) : link;

export const appendBaseToManifest = (
  base: string,
  manifest: ManifestOption,
): ManifestOption => {
  if (manifest.icons)
    manifest.icons = manifest.icons.map((icon) => ({
      ...icon,
      src: appendBaseHelper(base, icon.src),
    }));

  if (manifest.shortcuts)
    manifest.shortcuts = manifest.shortcuts.map((shortcut) => ({
      ...shortcut,
      icons:
        shortcut.icons?.map((icon) => ({
          ...icon,
          src: appendBaseHelper(base, icon.src),
        })) || [],
      url: appendBaseHelper(base, shortcut.url),
    }));

  if (manifest.screenshots)
    manifest.screenshots = manifest.screenshots.map((screenshot) => ({
      ...screenshot,
      src: appendBaseHelper(base, screenshot.src),
    }));

  return manifest;
};

export const appendBase = (base: string, options: PWAOptions): void => {
  if (options.favicon)
    options.favicon = appendBaseHelper(base, options.favicon);

  if (options.apple) {
    if (options.apple.icon)
      options.apple.icon = appendBaseHelper(base, options.apple.icon);

    if (options.apple.maskIcon)
      options.apple.maskIcon = appendBaseHelper(base, options.apple.maskIcon);
  }

  if (options.msTile && options.msTile.image)
    options.msTile.image = appendBaseHelper(base, options.msTile.image);

  if (options.manifest)
    options.manifest = appendBaseToManifest(base, options.manifest);
};
