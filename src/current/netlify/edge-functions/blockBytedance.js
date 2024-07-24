export default async (request) => {
  const bytedanceUserAgents = [
    'Bytespider; spider-feedback@bytedance.com'
  ];

  // Get the user agent from the request headers
  const userAgent = request.headers.get('user-agent') || '';

  // Check if the user agent matches any of the Bytedance user agents
  const isBytedanceBot = bytedanceUserAgents.some(ua => userAgent.includes(ua));

  // Block access if it is a Bytedance user agent
  if (isBytedanceBot) {
    return new Response('Access Denied', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // Avoid redirecting if already at the root directory
  const url = new URL(request.url);
  if (url.pathname === '/') {
    // Serve the root directory content or a custom message
    return new Response('<html><body><h1>Welcome to the root directory!</h1></body></html>', {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  // Redirect to the root directory for all other requests
  url.pathname = '/'; // Redirect to the root directory
  return Response.redirect(url.toString(), 302); // 302 status for temporary redirect
};

export const config = {
  path: "/*",
};
