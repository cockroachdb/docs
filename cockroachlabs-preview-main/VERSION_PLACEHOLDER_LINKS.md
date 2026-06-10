# How `VERSION_PLACEHOLDER` Links Work

This repository uses shared MDX snippets across multiple versioned docs pages. Some of those snippets need internal docs links that point to the correct docs version for the page that imports them.

To support that, shared snippets use links like:

```html
<a href="/docs/VERSION_PLACEHOLDER/cockroachcloud/authorization" data-versioned="true">Authorization</a>
```

## Why this was created

A snippet under `snippets/` can be imported into many different pages, such as:

- `docs/stable/...`
- `docs/v25.3/...`
- `docs/v24.3/...`

If the snippet hardcoded one version like `/docs/stable/...`, that same snippet would be wrong when rendered inside `v25.3` or `v24.3` docs pages.

`VERSION_PLACEHOLDER` keeps the snippet version-agnostic until the page renders.

## How the replacement happens

Each versioned page that imports one of these snippets defines a `PatchVersion` component. For example, `docs/stable/cockroachcloud/alerts-page.mdx` contains:

```jsx
export const PatchVersion = () => {
  if (typeof document !== "undefined") {
    requestAnimationFrame(() => {
      document.querySelectorAll("[data-versioned]").forEach((a) => {
        a.href = a.href.replace("VERSION_PLACEHOLDER", "stable");
      });
    });
  }
  return null;
};
```

That page then renders:

```jsx
<PatchVersion />
<AlertsPage />
```

When the page loads in the browser, `PatchVersion`:

1. Finds all elements marked with `data-versioned`.
2. Reads each link's `href`.
3. Replaces `VERSION_PLACEHOLDER` with the current page's version string, such as `stable` or `v24.3`.

## Example flow

Shared snippet:

- `snippets/cockroachcloud/alerts-page.mdx`
- Contains links like `/docs/VERSION_PLACEHOLDER/cockroachcloud/authorization`

Versioned page:

- `docs/stable/cockroachcloud/alerts-page.mdx`
- Imports the snippet
- Defines `PatchVersion`
- Replaces `VERSION_PLACEHOLDER` with `stable`

Equivalent pages in other version directories use the same pattern, but replace the placeholder with their own version:

- `docs/v25.3/...` -> `v25.3`
- `docs/v24.3/...` -> `v24.3`

## Rules for authors

- Use `VERSION_PLACEHOLDER` only for internal docs links that must resolve to the importing page's version.
- Add `data-versioned="true"` to each link that should be rewritten.
- Keep the snippet itself free of hardcoded version prefixes when it is intended for reuse across multiple docs versions.
- Ensure the importing versioned page includes a `PatchVersion` component before rendering the shared snippet.

## When not to use it

Do not use `VERSION_PLACEHOLDER` for:

- External links
- Links that should always point to a fixed location regardless of docs version
- Snippets that are only ever used in one versioned location and do not need cross-version reuse
