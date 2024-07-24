import type { Config, Context } from "@netlify/edge-functions";

export default async function handler(request: Request, context: Context) {
  const bytedanceUserAgents = [
    'Bytespider; spider-feedback@bytedance.com'
    // Add other Bytedance user agents if needed
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

  // Log "hello" before continuing the request
  console.log("hello");

  // Continue the request chain and get the response from the next handler or the origin server
  return context.next();
}

export const config: Config = {
  path: "/*", // This path can be adjusted based on where you want to apply this edge function
};
