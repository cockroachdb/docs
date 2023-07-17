// adapted from https://github.com/ascorbic/slash-edge/blob/main/lib/strip-slash.ts

import { Context } from 'https://edge.netlify.com'

export default async function handler(request: Request, context: Context) {
  const { pathname } = new URL(request.url)
  // Skip for root, or if we're already proxying the request
  const pathsToSkip = [
    /\/docs\/.*?\/contribute-to-cockroachdb(\.html)?/,
    /\/docs\/.*?\/build-a-python-app-with-cockroachdb-peewee(\.html)?/
  ];
  if (pathname === '/' || request.headers.get('x-nf-subrequest') || pathsToSkip.some(rx => rx.test(pathname) || !pathname.includes('.html'))) {
    return
  }

  if (pathname.includes("/index.html")) {
    // Replace the suffix with a slash
    return Response.redirect(`${request.url.replace("/index.html", "/")}`, 301)
  }

  if (pathname.includes('.html')) {
    // Replace the suffix with nothing
    return Response.redirect(`${request.url.replace('.html', "")}`, 301)
  }

  const response = await context.next({ sendConditionalRequest: true })

  // If origin returns a 301 we need to proxy it to avoid a redirect loop
  // TODO: check that this is just a redirect to the canonical URL, not some other kind
  if (response.status === 301) {
    const location = response.headers.get('Location')
    // Avoid infinite loops
    request.headers.set('x-nf-subrequest', '1')
    return context.rewrite(new URL(location || '', request.url).toString())
  }
  // We don't want to return a response here because redirect rules won't process
  // see https://docs.netlify.com/edge-functions/declarations/#processing-order-caveats
}
