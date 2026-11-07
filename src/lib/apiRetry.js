const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimit = (error) =>
  /rate limit/i.test(`${error?.message || ''}`) || error?.status === 429 || error?.response?.status === 429;

function retryDelayMs(error) {
  const match = `${error?.message || ''}`.match(/retry after (\d+)\s*s/i);
  const seconds = match ? Number(match[1]) : 2;
  return Math.min(seconds + 1, 30) * 1000;
}

/**
 * Runs a read against the app database, waiting out temporary rate limits
 * instead of surfacing them to the user.
 */
export async function withRetry(operation, attempts = 3) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRateLimit(error) || attempt === attempts - 1) throw error;
      await sleep(retryDelayMs(error));
    }
  }
  throw lastError;
}