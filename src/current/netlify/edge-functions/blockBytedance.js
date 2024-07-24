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

  console.log(`Request URL: ${url.href}`);

  // Process and forward the request
  const response = await fetch(request);
  console.log(`Response Status: ${response.status}`);

  return response;

};
export const config = {
  path: "/*",
};


