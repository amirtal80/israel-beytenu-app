const API_URL = 'https://beytenu.org.il/wp-json/wp/v2';
const LAST_CHECK_FILE = 'last_check.json';
const NOTIFICATIONS_FILE = 'notifications.json';

async function fetchLatestPosts(since) {
  const url = since 
    ? `${API_URL}/posts?after=${since}&per_page=20`
    : `${API_URL}/posts?per_page=20`;
  const res = await fetch(url);
  return await res.json();
}

function detectType(post) {
  const title = post.title.rendered.toLowerCase();
  const content = post.content.rendered.toLowerCase();
  
  const eventKeywords = ['כנס', 'חוג בית', 'פגישה', 'אירוע', 'מפגש', 'ויעץ', 'פריימריז'];
  const interviewKeywords = ['ראיון', 'ריאיון', 'בטלוויזיה', 'ברדיו', 'בעיתון', 'בחדשות'];
  
  if (eventKeywords.some(k => title.includes(k))) return 'event';
  if (interviewKeywords.some(k => title.includes(k) || content.includes(k))) return 'interview';
  return 'news';
}

function extractImage(post) {
  if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return post._embedded['wp:featuredmedia'][0].source_url;
  }
  return null;
}

async function sendPushNotification(title, body, imageUrl, type) {
  console.log(`[${type.toUpperCase()}] ${title}`);
  
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: imageUrl || '/icon-192.png',
      badge: '/icon-192.png',
      tag: type
    });
  }
}

async function checkForNewPosts() {
  try {
    const posts = await fetchLatestPosts();
    const now = new Date().toISOString();
    
    for (const post of posts) {
      const type = detectType(post);
      const image = extractImage(post);
      const preview = post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 100);
      
      let message = '';
      if (type === 'event') message = '📅 אירוע חדש!';
      else if (type === 'interview') message = '📺 ראיון בתקשורת!';
      else message = '📰 חדשות חדשות';
      
      await sendPushNotification(
        post.title.rendered,
        `${message}\n${preview}`,
        image,
        type
      );
    }
    
    return now;
  } catch(e) {
    console.error('Error checking posts:', e);
    return null;
  }
}

async function startMonitoring(intervalMs = 1800000) {
  console.log('Starting Israel Beytenu Notification Monitor...');
  console.log(`Checking every ${intervalMs/60000} minutes`);
  
  await checkForNewPosts();
  
  setInterval(async () => {
    await checkForNewPosts();
  }, intervalMs);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { checkForNewPosts, startMonitoring };
}

if (typeof window !== 'undefined') {
  if ('Notification' in window) {
    Notification.requestPermission();
  }
  
  window.addEventListener('load', () => {
    startMonitoring();
  });
}