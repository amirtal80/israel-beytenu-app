// Cloudflare Worker - FCM Sender
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { title, body } = await request.json();
    
    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'Missing title or body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const SERVER_KEY = 'BEmPRuxL0Sjn64PB2gtCg_abBeGzc_aMszPQH6ubXVaFBhP43N3G7A16IeBUDl8Ws0YSgZAtVx9Q5-OZG0mmxSg';

    try {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': 'key=' + SERVER_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notification: { title, body },
          to: '/topics/beytenu'
        })
      });

      const result = await response.json();
      
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
};