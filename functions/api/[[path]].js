const BACKEND_URL =
  "https://monetra-api.ai-email-it-turik-001.workers.dev";

export async function onRequest({ request }) {
  const incomingUrl = new URL(request.url);

  // Зберігаємо шлях API та query-параметри
  const targetUrl = new URL(
    incomingUrl.pathname + incomingUrl.search,
    BACKEND_URL
  );

  // Передаємо запит разом із заголовками,
  // тілом запиту та cookie
  const proxyRequest = new Request(targetUrl, request);

  // Повертаємо відповідь бекенду браузеру
  return fetch(proxyRequest);
}