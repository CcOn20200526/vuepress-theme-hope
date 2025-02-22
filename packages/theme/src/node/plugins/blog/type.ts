import { dateSorter } from "@vuepress/helper/node";
import type { GitData } from "@vuepress/plugin-git";
import type { BlogTypeOptions } from "vuepress-plugin-blog2";

import { defaultPageSorter } from "./utils.js";
import type {
  ArticleInfo,
  BlogPluginOptions,
  ThemeData,
  ThemeNormalPageFrontmatter,
} from "../../../shared/index.js";
import { ArticleInfoType } from "../../../shared/index.js";

/** @private */
export const getBlogArticleType = (
  options: BlogPluginOptions,
  themeData: ThemeData,
): BlogTypeOptions<
  { git: GitData },
  ThemeNormalPageFrontmatter,
  { routeMeta: ArticleInfo }
> =>
  <
    BlogTypeOptions<
      { git: GitData },
      ThemeNormalPageFrontmatter,
      { routeMeta: ArticleInfo }
    >
  >{
    key: "article",
    sorter: defaultPageSorter,
    filter: ({ frontmatter, filePathRelative }): boolean =>
      // not home
      !frontmatter.home &&
      // declaring this is an article
      (frontmatter.article ||
        // generated from markdown files
        Boolean(frontmatter.article !== false && filePathRelative)),
    path: options.article,
    layout: "BlogType",
    frontmatter: (localePath) => ({
      title: themeData.locales[localePath].blogLocales.article,
      dir: { index: false },
      index: false,
      feed: false,
      sitemap: false,
    }),
  };

/** @private */
export const getBlogStarType = (
  options: BlogPluginOptions,
  themeData: ThemeData,
): BlogTypeOptions<
  { git: GitData },
  ThemeNormalPageFrontmatter,
  { routeMeta: ArticleInfo }
> =>
  <
    BlogTypeOptions<
      { git: GitData },
      ThemeNormalPageFrontmatter,
      { routeMeta: ArticleInfo }
    >
  >{
    key: "star",
    filter: ({ frontmatter }) => Boolean(frontmatter.star),
    sorter: (pageA, pageB) => {
      const prevKey = pageA.frontmatter.star;
      const nextKey = pageB.frontmatter.star;

      if (prevKey && nextKey && prevKey !== nextKey)
        return Number(nextKey) - Number(prevKey);
      if (prevKey && !nextKey) return -1;
      if (!prevKey && nextKey) return 1;

      return dateSorter(
        pageA.routeMeta[ArticleInfoType.date],
        pageB.routeMeta[ArticleInfoType.date],
      );
    },

    path: options.star,
    layout: "BlogType",
    frontmatter: (localePath) => ({
      title: themeData.locales[localePath].blogLocales.star,
      dir: { index: false },
      index: false,
      feed: false,
      sitemap: false,
    }),
  };

/** @private */
export const getBlogTimelineType = (
  options: BlogPluginOptions,
  themeData: ThemeData,
): BlogTypeOptions<
  { git: GitData },
  ThemeNormalPageFrontmatter,
  { routeMeta: ArticleInfo }
> =>
  <
    BlogTypeOptions<
      { git: GitData },
      ThemeNormalPageFrontmatter,
      { routeMeta: ArticleInfo }
    >
  >{
    key: "timeline",
    filter: ({ frontmatter, routeMeta }) =>
      ArticleInfoType.date in routeMeta && frontmatter["timeline"] !== false,
    sorter: (pageA, pageB) =>
      dateSorter(
        pageA.routeMeta[ArticleInfoType.date],
        pageB.routeMeta[ArticleInfoType.date],
      ),
    path: options.timeline,
    layout: "Timeline",
    frontmatter: (localePath) => ({
      title: themeData.locales[localePath].blogLocales.timeline,
      dir: { index: false },
      index: false,
      feed: false,
      sitemap: false,
    }),
  };
