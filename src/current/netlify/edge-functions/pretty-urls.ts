// adapted from https://github.com/ascorbic/slash-edge/blob/main/lib/strip-slash.ts

import { Context } from 'https://edge.netlify.com'

export default async function handler(request: Request, context: Context) {
  const { pathname } = new URL(request.url)
  // Skip for root, or if we're already proxying the request
  const pathsToSkip = [
    /\/docs\/.*?\/contribute-to-cockroachdb(\.html)?/,
    /\/docs\/.*?\/build-a-python-app-with-cockroachdb-peewee(\.html)?/,
    /\/docs\/css\/.*?/,
    /\/docs\/js\/.*?/,
    /\/docs\/_redirects/,
    /\/docs(\/(advisories|api|cockroachcloud|releases|tutorials|v\d{1,2}\.\d(\/(architecture|security-reference))?))?\/?$/
  ];

  function canonicalize(pathname: string) {
    let result = pathname.replace("/index.html", "").replace(".html", "").toLowerCase();
    if (result.endsWith("/")) {
      result = result.slice(0, -1);
    }
    return result;
  }
  
  let canonical = canonicalize(pathname);

  if (pathname === '/' || request.headers.get('x-nf-subrequest') || pathsToSkip.some(x => x.test(pathname) || pathname === canonical)) {
    return
  }

  return Response.redirect(`${canonicalize(request.url)}`, 301)

}
