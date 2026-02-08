/**
 * Generates a secure API key for institutions
 */
export function generateApiKey(prefix = 'tfok'): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [
    generateRandomString(8, characters),
    generateRandomString(8, characters),
    generateRandomString(8, characters),
    generateRandomString(8, characters),
  ];
  
  return `${prefix}_${segments.join('_')}`;
}

function generateRandomString(length: number, characters: string): string {
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

/**
 * Validates an API key format
 */
export function validateApiKey(apiKey: string): boolean {
  const regex = /^tfok_[A-Za-z0-9]{8}_[A-Za-z0-9]{8}_[A-Za-z0-9]{8}_[A-Za-z0-9]{8}$/;
  return regex.test(apiKey);
}

/**
 * Masks an API key for display (shows only last 8 characters)
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 12) return apiKey;
  return `${'*'.repeat(apiKey.length - 8)}${apiKey.slice(-8)}`;
}
