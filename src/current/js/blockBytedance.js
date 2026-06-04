document.addEventListener('DOMContentLoaded', function() {
    var userAgent = navigator.userAgent;

    // Define Bytedance user agents to block
    var bytedanceUserAgents = [
      'Bytespider; spider-feedback@bytedance.com'
    ];

    // Check if the request's user agent matches any of the Bytedance user agents
    if (bytedanceUserAgents.some(ua => userAgent.includes(ua))) {
      document.write('Access Denied');
      document.close();
    }
  });
