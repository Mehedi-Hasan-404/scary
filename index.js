export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const originBase = "http://103.180.212.191:3500";
    const url = new URL(request.url);
    const targetUrl = originBase + url.pathname + url.search;
    
    let response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
    });
    
    const contentType = response.headers.get("content-type") || "";
    if (url.pathname.endsWith(".m3u8") || contentType.includes("mpegurl")) {
      let text = await response.text();
      text = text.replaceAll(originBase, url.origin);
      
      return new Response(text, {
        status: response.status,
        headers: {
          "Content-Type": "application/x-mpegURL",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache"
        }
      });
    }
    
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders
    });
  }
};
