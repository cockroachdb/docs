export const LinkedPageTabs = ({ currentPath = "", items = [], versioned = false }) => {
  const normalizePath = (value = "") => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "/") {
      return trimmed || "/";
    }
    return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
  };

  const normalizedCurrentPath = normalizePath(currentPath);
  const tabItems = items.map((item) => ({
    title: item.title,
    href: normalizePath(item.href),
  }));

  return (
    <nav className="not-prose" aria-label="Related pages">
      <ul
        className="not-prose mb-6 flex min-w-full flex-none gap-x-6 overflow-auto border-b border-gray-200 pb-[1px] dark:border-gray-200/10"
        role="list"
      >
        {tabItems.map((item) => {
          const active = item.href === normalizedCurrentPath;

          return (
            <li key={item.href} className="cursor-pointer">
              <a
                href={item.href}
                onClick={() => {
                  windows.location = item.href;
                }}
                aria-current={active ? "page" : undefined}
                className="block no-underline hover:no-underline focus:no-underline"
                style={{ textDecoration: "none", boxShadow: "none" }}
                data-versioned={versioned ? "true" : "false"}
              >
                <div
                  className={
                    active
                      ? "flex max-w-max items-center gap-1.5 whitespace-nowrap border-b border-current pb-2.5 pt-3 text-sm font-semibold leading-6 text-primary -mb-px dark:text-primary-light"
                      : "flex max-w-max items-center gap-1.5 whitespace-nowrap border-b border-transparent pb-2.5 pt-3 text-sm font-semibold leading-6 text-gray-500 -mb-px hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-200"
                  }
                  data-component-part="tab-button"
                  data-active={active ? "true" : "false"}
                >
                  {item.title}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
