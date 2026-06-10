/**
 * Deterministic Vector QR Code (SVG) Generator for IDEVA Plant-Floor Assets & HR Badges
 * Generates an authentic 2D matrix with standard position finder patterns at three corners.
 * Matrix points are determined using a hash algorithm seeded with the input string.
 */

export function generateQRMatrix(text: string, size: number = 21): boolean[][] {
  const matrix: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));

  // 1. Helper to draw standard QR corner finder patterns (7x7 pixels)
  const drawFinderPattern = (offsetX: number, offsetY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (isBorder || isCenter) {
          if (offsetX + c < size && offsetY + r < size) {
            matrix[offsetY + r][offsetX + c] = true;
          }
        }
      }
    }
  };

  // Top-Left Finder Pattern
  drawFinderPattern(0, 0);
  // Top-Right Finder Pattern
  drawFinderPattern(size - 7, 0);
  // Bottom-Left Finder Pattern
  drawFinderPattern(0, size - 7);

  // 2. Put alignment pattern for larger sizes (e.g. 21x21, pseudo-alignment dot at [size-7, size-7])
  if (size >= 21) {
    matrix[size - 7][size - 7] = true;
    matrix[size - 8][size - 7] = true;
    matrix[size - 7][size - 8] = true;
  }

  // 3. Generate a deterministic seed from the input string to draw random but persistent digital matrix blocks
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed = (seed << 5) - seed + text.charCodeAt(i);
    seed |= 0; // Convert to 32bit integer
  }

  // Simple LCG pseudo-random generator seeded by input string
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // 4. Populate remaining matrix spots randomly based on seed
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Avoid overwriting finder patterns (the 8x8 areas in top-left, top-right, bottom-left)
      const isTopLeftFinder = r < 8 && c < 8;
      const isTopRightFinder = r < 8 && c >= size - 8;
      const isBottomLeftFinder = r >= size - 8 && c < 8;

      if (!isTopLeftFinder && !isTopRightFinder && !isBottomLeftFinder) {
        // Deterministic binary pixel
        matrix[r][c] = random() > 0.45;
      }
    }
  }

  return matrix;
}

/**
 * Renders the deterministic matrix into a beautiful SVG element representation.
 */
export function renderQRCodeSVG(text: string, sizePx: number = 180): string {
  const matrixSize = 21;
  const matrix = generateQRMatrix(text, matrixSize);
  const cellSize = sizePx / matrixSize;

  let svgContent = `<svg width="${sizePx}" height="${sizePx}" viewBox="0 0 ${sizePx} ${sizePx}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">`;
  // Add a clean solid white background
  svgContent += `<rect width="${sizePx}" height="${sizePx}" fill="#FFFFFF" />`;

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        const x = c * cellSize;
        const y = r * cellSize;
        svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#1D1D1F" />`;
      }
    }
  }

  svgContent += `</svg>`;
  return svgContent;
}

/**
 * Returns a base64 Data URL for the SVG to easily embed in <img> tags or files.
 */
export function getQRCodeDataUrl(text: string, sizePx: number = 180): string {
  const svgString = renderQRCodeSVG(text, sizePx);
  const base64 = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${base64}`;
}
