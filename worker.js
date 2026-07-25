const IMAGE_SOURCES = {
  '/assets/hero.webp': ['/asset-data-v4/hero.js'],
  '/assets/room.webp': ['/asset-data-v4/room.js'],
  '/assets/hotel.webp': ['/chunks/hotel-0.js', '/chunks/hotel-1.js']
};

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function readBase64Asset(request, env, paths) {
  const pieces = [];
  for (const path of paths) {
    const sourceUrl = new URL(path, request.url);
    const response = await env.ASSETS.fetch(sourceUrl);
    if (!response.ok) throw new Error(`Не найден источник ${path}`);
    const text = await response.text();

    const dataUri = text.match(/base64,([A-Za-z0-9+/=]+)/);
    if (dataUri) {
      pieces.push(dataUri[1]);
      continue;
    }

    const chunk = text.match(/\.push\("([A-Za-z0-9+/=]+)"\)/);
    if (!chunk) throw new Error(`Не удалось прочитать ${path}`);
    pieces.push(chunk[1]);
  }
  return pieces.join('');
}

async function imageResponse(request, env, paths) {
  try {
    const base64 = await readBase64Asset(request, env, paths);
    return new Response(decodeBase64(base64), {
      headers: {
        'content-type': 'image/webp',
        'cache-control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    return new Response(String(error?.message || error), { status: 500 });
  }
}

async function htmlResponse(request, env) {
  const response = await env.ASSETS.fetch(request);
  if (!response.ok) return response;
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;

  let html = await response.text();
  html = html.replace(/script\.js\?v=[^"']+/g, 'script.js?v=8');
  return new Response(html, {
    status: response.status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const imageSources = IMAGE_SOURCES[url.pathname];
    if (imageSources) return imageResponse(request, env, imageSources);

    if (url.pathname === '/script.js') {
      const response = await env.ASSETS.fetch(request);
      return new Response(response.body, {
        status: response.status,
        headers: {
          'content-type': 'text/javascript; charset=utf-8',
          'cache-control': 'no-store'
        }
      });
    }

    return htmlResponse(request, env);
  }
};
