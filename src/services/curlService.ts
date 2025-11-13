import type { RequestConfig, HttpMethod } from '../types';

function escapeShellArg(arg: string): string {
  return arg
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

export function generateCurl(config: RequestConfig, platform: 'win32' | 'darwin' | 'linux' = 'linux'): string {
  const parts: string[] = ['curl'];

  if (config.method && config.method !== 'GET') {
    parts.push(`-X ${config.method}`);
  }

  if (config.headers && Object.keys(config.headers).length > 0) {
    Object.entries(config.headers).forEach(([key, value]) => {
      const escapedValue = escapeShellArg(value);
      parts.push(`-H "${key}: ${escapedValue}"`);
    });
  }

  if (config.body && (config.method === 'POST' || config.method === 'PUT' || config.method === 'DELETE' || config.method === 'OPTIONS')) {
    const escapedBody = escapeShellArg(config.body);
    parts.push(`-d "${escapedBody}"`);
  }

  const escapedUrl = config.url.includes(' ') ? `"${config.url}"` : config.url;
  parts.push(escapedUrl);

  let command = parts.join(' ');

  if (platform === 'win32') {
    command = command.replace(/\n/g, '^\n');
  }

  return command;
}

export interface ParsedCurl {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

function unescapeString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\$/g, '$')
    .replace(/\\`/g, '`')
    .replace(/\\\\/g, '\\');
}

function extractQuotedString(text: string, startIndex: number): { value: string; endIndex: number } | null {
  const char = text[startIndex];
  
  if (char !== '"' && char !== "'") {
    const match = text.substring(startIndex).match(/^(\S+)/);
    if (match) {
      return { value: match[1], endIndex: startIndex + match[1].length };
    }
    return null;
  }

  const quote = char;
  let value = '';
  let i = startIndex + 1;
  let escaped = false;

  while (i < text.length) {
    const c = text[i];
    
    if (escaped) {
      value += c;
      escaped = false;
    } else if (c === '\\') {
      value += c;
      escaped = true;
    } else if (c === quote) {
      return { value: unescapeString(value), endIndex: i + 1 };
    } else {
      value += c;
    }
    
    i++;
  }

  throw new Error(`Unclosed quote in cURL command`);
}

export function parseCurl(curlCommand: string): ParsedCurl {
  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    headers: {},
  };

  let command = curlCommand.trim().replace(/\\\n/g, ' ').replace(/\s+/g, ' ');
  
  if (!command.startsWith('curl')) {
    throw new Error('Invalid cURL command: must start with "curl"');
  }

  command = command.substring(4).trim();

  let i = 0;
  while (i < command.length) {
    const remaining = command.substring(i);
    
    if (remaining.startsWith('-X ') || remaining.startsWith('--request ')) {
      const offset = remaining.startsWith('-X ') ? 3 : 10;
      i += offset;
      
      while (i < command.length && /\s/.test(command[i])) i++;
      
      const methodMatch = command.substring(i).match(/^(\w+)/);
      if (methodMatch) {
        const method = methodMatch[1].toUpperCase();
        if (['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'].includes(method)) {
          result.method = method as HttpMethod;
        }
        i += methodMatch[1].length;
      }
    }
    else if (remaining.startsWith('-H ') || remaining.startsWith('--header ')) {
      const offset = remaining.startsWith('-H ') ? 3 : 9;
      i += offset;
      
      while (i < command.length && /\s/.test(command[i])) i++;
      
      const extracted = extractQuotedString(command, i);
      if (extracted) {
        const colonIndex = extracted.value.indexOf(':');
        if (colonIndex > 0) {
          const key = extracted.value.substring(0, colonIndex).trim();
          const value = extracted.value.substring(colonIndex + 1).trim();
          result.headers[key] = value;
        }
        i = extracted.endIndex;
      }
    }
    else if (remaining.startsWith('-d ') || remaining.startsWith('--data ') || remaining.startsWith('--data-raw ')) {
      const offset = remaining.startsWith('-d ') ? 3 : remaining.startsWith('--data ') ? 7 : 11;
      i += offset;
      
      while (i < command.length && /\s/.test(command[i])) i++;
      
      const extracted = extractQuotedString(command, i);
      if (extracted) {
        result.body = extracted.value;
        i = extracted.endIndex;
      }
    }
    else if (remaining.startsWith('http://') || remaining.startsWith('https://') || remaining.startsWith('"') || remaining.startsWith("'")) {
      const extracted = extractQuotedString(command, i);
      if (extracted && !result.url) {
        result.url = extracted.value;
        i = extracted.endIndex;
      } else {
        i++;
      }
    }
    else {
      i++;
    }
  }

  if (!result.url) {
    throw new Error('Invalid cURL command: URL is required');
  }

  return result;
}
