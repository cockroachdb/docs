export default async (request) => {
    const bytedanceUserAgents = [
      'Bytespider; spider-feedback@bytedance.com'
    ];
  
    const userAgent = request.headers.get('user-agent') || '';
  
    if (bytedanceUserAgents.some(ua => userAgent.includes(ua))) {
      return new Response('Access Denied', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
  
    return fetch(request);
  };