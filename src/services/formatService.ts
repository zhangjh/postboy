export interface FormatResult {
  success: boolean;
  formatted?: string;
  error?: string;
}

export function formatJSON(input: string): FormatResult {
  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, 2);
    return { success: true, formatted };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid JSON format';
    return { success: false, error: errorMessage };
  }
}

export function formatXML(input: string): FormatResult {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(input, 'text/xml');
    
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      return { 
        success: false, 
        error: 'Invalid XML format: ' + parserError.textContent 
      };
    }
    
    const serializer = new XMLSerializer();
    const serialized = serializer.serializeToString(xmlDoc);
    
    const formatted = formatXMLString(serialized);
    return { success: true, formatted };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid XML format';
    return { success: false, error: errorMessage };
  }
}

function formatXMLString(xml: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';
  
  xml.split(/>\s*</).forEach((node) => {
    if (node.match(/^\/\w/)) {
      indent--;
    }
    
    formatted += tab.repeat(indent) + '<' + node + '>\n';
    
    if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?')) {
      indent++;
    }
  });
  
  return formatted.substring(1, formatted.length - 2);
}

export function validateJSON(input: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid JSON';
    return { valid: false, error: errorMessage };
  }
}

export function validateXML(input: string): { valid: boolean; error?: string } {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(input, 'text/xml');
    
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      return { 
        valid: false, 
        error: parserError.textContent || 'Invalid XML' 
      };
    }
    
    return { valid: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid XML';
    return { valid: false, error: errorMessage };
  }
}
