{{ site.pages | where_exp: "stable_pages", "stable_pages.url contains site.versions['stable']" | map: "name" }}
