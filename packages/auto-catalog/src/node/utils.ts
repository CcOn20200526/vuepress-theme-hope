import { Logger, ensureEndingSlash } from "@vuepress/helper/node";
import { getDirname, path } from "vuepress/utils";

const __dirname = getDirname(import.meta.url);

export const PLUGIN_NAME = "vuepress-plugin-auto-catalog";

export const logger = new Logger(PLUGIN_NAME);

export const CLIENT_FOLDER = ensureEndingSlash(
  path.resolve(__dirname, "../client"),
);
