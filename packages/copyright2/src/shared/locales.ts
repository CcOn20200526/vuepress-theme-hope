import type { ExactLocaleConfig } from "@vuepress/helper/shared";

export interface CopyrightLocaleData {
  /**
   * Author text
   *
   * @description `:author` will be replaced by author
   *
   * 作者文字
   *
   * @description `:author` 将会被作者替换
   */
  author: string;

  /**
   * License text
   *
   * @description `:license` will be replaced by current license
   *
   * 协议文字
   *
   * @description `:license` 会被当前协议替换
   */
  license: string;

  /**
   * Link text
   *
   * @description `:link` will be replaced by current page link
   *
   * 链接文字
   *
   * @description `:link` 会替换为当前页面链接
   */
  link: string;
}

export type CopyrightLocaleConfig = ExactLocaleConfig<CopyrightLocaleData>;
