export default {
  async fetch(request, env, ctx) {
    const upstreamUrl = new URL(request.url);
    
    // Set the target IPTV server destination
    upstreamUrl.protocol = 'http:';
    upstreamUrl.hostname = '103.180.212.191';
    upstreamUrl.port = '3500';

    // Clone the incoming headers so we can safely modify them
    const newHeaders = new Headers(request.headers);
    
    // FIX: Remove the client's Host header so Cloudflare regenerates it cleanly for the IP
    newHeaders.delete('host'); 

    // Reconstruct the request cleanly
    const newRequest = new Request(upstreamUrl, {
      method: request.method,
      headers: newHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'manual' // Crucial for IPTV to prevent the worker from breaking on stream redirects
    });

    try {
      const response = await fetch(newRequest);
      
      // Inject CORS headers so your media player doesn't reject the stream
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    } catch (err) {
      return new Response('Proxy Error: ' + err.message, { status: 500 });
    }
  },
};
