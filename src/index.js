export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get('url');

    if (!target) {
      return new Response('Missing "url" query parameter', { status: 400 });
    }

    // Optional: restrict to your own VPS IP/domain for safety
    // if (!target.startsWith('http://103.180.212.191:3500/')) {
    //   return new Response('Forbidden target', { status: 403 });
    // }

    try {
      const upstream = await fetch(target, {
        headers: {
          // forward range header for segment/byte-range requests
          ...(request.headers.get('range') && { range: request.headers.get('range') }),
        },
      });

      const headers = new Headers(upstream.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      headers.set('Access-Control-Allow-Headers', '*');

      return new Response(upstream.body, {
        status: upstream.status,
        headers,
      });
    } catch (err) {
      return new Response('Upstream fetch failed: ' + err.message, { status: 502 });
    }
  },
};
