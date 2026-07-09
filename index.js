export default {
  async fetch(request, env, ctx) {
    const upstreamUrl = new URL(request.url);
    
    // Target IPTV server
    upstreamUrl.protocol = 'http:';
    upstreamUrl.hostname = '103.180.212.191';
    upstreamUrl.port = '3500';

    // Clone the request with the new target URL
    const newRequest = new Request(upstreamUrl, request);

    try {
      const response = await fetch(newRequest);
      
      // Clone response to add CORS headers so players don't block it
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');
      newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } catch (err) {
      return new Response('Proxy Error: ' + err.message, { status: 500 });
    }
  },
};
