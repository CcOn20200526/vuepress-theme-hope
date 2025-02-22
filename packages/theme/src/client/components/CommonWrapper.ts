import {
  useEventListener,
  useScrollLock,
  useThrottleFn,
  useToggle,
} from "@vueuse/core";
import type { ComponentOptions, SlotsType, VNode } from "vue";
import {
  Transition,
  computed,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
  resolveComponent,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { usePageData, usePageFrontmatter } from "vuepress/client";
import { RenderDefault, hasGlobalComponent } from "vuepress-shared/client";

import PageFooter from "@theme-hope/components/PageFooter";
import {
  useThemeLocaleData,
  useWindowSize,
} from "@theme-hope/composables/index";
import Navbar from "@theme-hope/modules/navbar/components/Navbar";
import Sidebar from "@theme-hope/modules/sidebar/components/Sidebar";
import { useSidebarItems } from "@theme-hope/modules/sidebar/composables/index";

import type {
  ThemeNormalPageFrontmatter,
  ThemeProjectHomePageFrontmatter,
} from "../../shared/index.js";

import "../styles/common.scss";

export default defineComponent({
  name: "CommonWrapper",

  props: {
    /**
     * Extra class of container
     *
     * 容器额外类名
     */
    containerClass: { type: String, default: "" },

    /**
     * Whether disable navbar
     *
     * 是否禁用导航栏
     */
    noNavbar: Boolean,

    /**
     * Whether disable sidebar
     *
     * 是否禁用侧边栏
     */
    noSidebar: Boolean,

    /**
     * Whether disable toc
     */
    noToc: Boolean,
  },

  slots: Object as SlotsType<{
    default: () => VNode[] | VNode | null;

    // navbar
    navbarStartBefore?: () => VNode[] | VNode | null;
    navbarStartAfter?: () => VNode[] | VNode | null;
    navbarCenterBefore?: () => VNode[] | VNode | null;
    navbarCenterAfter?: () => VNode[] | VNode | null;
    navbarEndBefore?: () => VNode[] | VNode | null;
    navbarEndAfter?: () => VNode[] | VNode | null;
    navScreenTop?: () => VNode[] | VNode | null;
    navScreenBottom?: () => VNode[] | VNode | null;

    // sidebar
    sidebar?: () => VNode[] | VNode;
    sidebarTop?: () => VNode[] | VNode | null;
    sidebarBottom?: () => VNode[] | VNode | null;
  }>,

  setup(props, { slots }) {
    const router = useRouter();
    const page = usePageData();
    const frontmatter = usePageFrontmatter<
      ThemeProjectHomePageFrontmatter | ThemeNormalPageFrontmatter
    >();
    const themeLocale = useThemeLocaleData();
    const { isMobile, isPC } = useWindowSize();

    const [isMobileSidebarOpen, toggleMobileSidebar] = useToggle(false);
    const [isDesktopSidebarCollapsed, toggleDesktopSidebar] = useToggle(false);

    const sidebarItems = useSidebarItems();

    // navbar
    const hideNavbar = ref(false);

    const enableNavbar = computed(() => {
      if (props.noNavbar) return false;

      if (
        frontmatter.value.navbar === false ||
        themeLocale.value.navbar === false
      )
        return false;

      return Boolean(
        page.value.title ||
          themeLocale.value.logo ||
          themeLocale.value.repo ||
          themeLocale.value.navbar,
      );
    });

    const enableSidebar = computed(() => {
      if (props.noSidebar) return false;

      return (
        frontmatter.value.sidebar !== false &&
        sidebarItems.value.length !== 0 &&
        !frontmatter.value.home
      );
    });

    const enableToc = computed(() =>
      props.noToc || frontmatter.value.home
        ? false
        : frontmatter.value.toc ||
          (themeLocale.value.toc !== false && frontmatter.value.toc !== false),
    );

    const touchStart = { x: 0, y: 0 };
    const onTouchStart = (e: TouchEvent): void => {
      touchStart.x = e.changedTouches[0].clientX;
      touchStart.y = e.changedTouches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent): void => {
      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;

      if (
        // horizontal swipe
        Math.abs(dx) > Math.abs(dy) * 1.5 &&
        Math.abs(dx) > 40
      )
        if (dx > 0 && touchStart.x <= 80) toggleMobileSidebar(true);
        else toggleMobileSidebar(false);
    };

    /** Get scroll distance */
    const getScrollTop = (): number =>
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    // close sidebar after navigation
    let lastDistance = 0;

    useEventListener(
      "scroll",
      useThrottleFn(
        () => {
          const distance = getScrollTop();

          // at top or scroll up
          if (distance <= 58 || distance < lastDistance)
            hideNavbar.value = false;
          // scroll down > 200px and sidebar is not opened
          else if (lastDistance + 200 < distance && !isMobileSidebarOpen.value)
            hideNavbar.value = true;

          lastDistance = distance;
        },
        300,
        true,
      ),
    );

    watch(isMobile, (value) => {
      if (!value) toggleMobileSidebar(false);
    });

    onMounted(() => {
      const isLocked = useScrollLock(document.body);

      watch(isMobileSidebarOpen, (value) => {
        isLocked.value = value;
      });

      const unregisterRouterHook = router.afterEach((): void => {
        toggleMobileSidebar(false);
      });

      onUnmounted(() => {
        isLocked.value = false;
        unregisterRouterHook();
      });
    });

    return (): VNode =>
      h(
        hasGlobalComponent("GlobalEncrypt")
          ? <ComponentOptions>resolveComponent("GlobalEncrypt")
          : RenderDefault,
        () =>
          h(
            "div",
            {
              class: [
                "theme-container",
                // classes
                {
                  "no-navbar": !enableNavbar.value,
                  "no-sidebar":
                    !enableSidebar.value &&
                    !(slots.sidebar || slots.sidebarTop || slots.sidebarBottom),
                  "has-toc": enableToc.value,
                  "hide-navbar": hideNavbar.value,
                  "sidebar-collapsed":
                    !isMobile.value &&
                    !isPC.value &&
                    isDesktopSidebarCollapsed.value,
                  "sidebar-open": isMobile.value && isMobileSidebarOpen.value,
                },
                props.containerClass,
                frontmatter.value.containerClass || "",
              ],
              onTouchStart,
              onTouchEnd,
            },
            [
              // navbar
              enableNavbar.value
                ? h(
                    Navbar,
                    { onToggleSidebar: () => toggleMobileSidebar() },
                    {
                      startBefore: () => slots.navbarStartBefore?.(),
                      startAfter: () => slots.navbarStartAfter?.(),
                      centerBefore: () => slots.navbarCenterBefore?.(),
                      centerAfter: () => slots.navbarCenterAfter?.(),
                      endBefore: () => slots.navbarEndBefore?.(),
                      endAfter: () => slots.navbarEndAfter?.(),
                      screenTop: () => slots.navScreenTop?.(),
                      screenBottom: () => slots.navScreenBottom?.(),
                    },
                  )
                : null,
              // sidebar mask
              h(Transition, { name: "fade" }, () =>
                isMobileSidebarOpen.value
                  ? h("div", {
                      class: "vp-sidebar-mask",
                      onClick: () => toggleMobileSidebar(false),
                    })
                  : null,
              ),
              // toggle sidebar button
              h(Transition, { name: "fade" }, () =>
                isMobile.value
                  ? null
                  : h(
                      "div",
                      {
                        class: "toggle-sidebar-wrapper",
                        onClick: () => toggleDesktopSidebar(),
                      },
                      h("span", {
                        class: [
                          "arrow",
                          isDesktopSidebarCollapsed.value ? "end" : "start",
                        ],
                      }),
                    ),
              ),
              // sidebar
              h(
                Sidebar,
                {},
                {
                  ...(slots.sidebar ? { default: () => slots.sidebar!() } : {}),
                  top: () => slots.sidebarTop?.(),
                  bottom: () => slots.sidebarBottom?.(),
                },
              ),
              slots.default(),
              h(PageFooter),
            ],
          ),
      );
  },
});
