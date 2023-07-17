import { Context } from 'https://edge.netlify.com'

export default async function handler(request: Request, context: Context) {
  const { pathname } = new URL(request.url)
  // Skip for root, or if we're already proxying the request
  if (pathname === '/' || request.headers.get('x-nf-subrequest')) {
    return
  }

  // Redirect to remove the trailing slash or .html
  for (const suffix of ['/', '/index.html', '.html']) {
    if (pathname.endsWith(suffix)) {
      return Response.redirect(request.url.slice(0, -suffix.length), 301)
    }
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
  return response
}
