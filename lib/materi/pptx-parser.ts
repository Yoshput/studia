import JSZip from "jszip";

export interface ParsedSlide {
  slideNumber: number;
  text: string;
}

export interface PptxParseResult {
  totalSlides: number;
  slides: ParsedSlide[];
  fullText: string;
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export async function parsePptxBuffer(buffer: ArrayBuffer | Buffer): Promise<PptxParseResult> {
  const zip = await JSZip.loadAsync(buffer);
  
  // Find all slide XML files
  const slideFileNames: string[] = [];
  zip.forEach((relativePath) => {
    if (/^ppt\/slides\/slide\d+\.xml$/i.test(relativePath)) {
      slideFileNames.push(relativePath);
    }
  });

  // Sort slides by number (slide1, slide2, ..., slide10)
  slideFileNames.sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, ""), 10) || 0;
    const numB = parseInt(b.replace(/[^0-9]/g, ""), 10) || 0;
    return numA - numB;
  });

  const slides: ParsedSlide[] = [];
  let fullTextCombined = "";

  for (let i = 0; i < slideFileNames.length; i++) {
    const fileName = slideFileNames[i];
    const xmlContent = await zip.file(fileName)?.async("text");
    if (!xmlContent) continue;

    // Extract all text inside <a:t>...</a:t> elements
    const matches: string[] = [];
    const regex = /<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/gi;
    let match;
    while ((match = regex.exec(xmlContent)) !== null) {
      if (match[1]) {
        matches.push(decodeXmlEntities(match[1]));
      }
    }

    const slideText = matches.join(" ").replace(/\s+/g, " ").trim();
    if (slideText.length > 0) {
      slides.push({
        slideNumber: i + 1,
        text: slideText,
      });
      fullTextCombined += `\n[Slide ${i + 1}]\n${slideText}\n`;
    }
  }

  return {
    totalSlides: slideFileNames.length,
    slides,
    fullText: fullTextCombined.trim(),
  };
}
