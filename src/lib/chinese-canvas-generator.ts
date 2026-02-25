export const generateChineseImage = async (
  chars: { char: string; pinyin: string }[],
  config: { gridType: string; showPinyin: boolean; mode: string; color: string },
  title: string = 'Chinese Writing'
): Promise<string> => {
  // 1. Create Canvas (A4 @ 300dpi: 2480 x 3508)
  const canvas = document.createElement('canvas');
  canvas.width = 2480; 
  canvas.height = 3508;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 2. Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3. Header
  // Steve Face
  drawSteve(ctx, 100, 100, 160); // x, y, size
  
  // Title Text
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 100px "Courier New", Courier, monospace';
  ctx.textBaseline = 'top';
  ctx.fillText('DUOMI CHINESE', 300, 100);
  
  ctx.font = '50px "Courier New", Courier, monospace';
  ctx.fillStyle = '#666666';
  ctx.fillText('Writing Practice', 300, 210);

  // Meta info (Name/Date)
  ctx.font = '40px "Courier New", Courier, monospace';
  ctx.fillStyle = '#333333';
  ctx.fillText('Name: __________________________', 1400, 120);
  ctx.fillText('Date: __________________________', 1400, 200);

  // Divider Line
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(100, 300);
  ctx.lineTo(2380, 300);
  ctx.stroke();

  // 4. Content Grid
  const startX = 140; // Left margin
  const startY = 400; // Top margin
  const boxSize = 240; // Size of the Tian/Mi grid
  const gapX = 35; // Space between boxes horizontal
  const gapY = 120; // Space between rows (includes pinyin space)
  const cols = 8; // Number of chars per row

  // Font settings
  // Try to use KaiTi if available, fallback to Serif
  // Use a fallback stack that likely contains a Chinese serif font
  const fontMain = '200px "KaiTi", "STKaiti", "楷体", "SimKai", "SimSun", "Songti SC", serif';
  const fontPinyin = '40px Arial, sans-serif';

  chars.forEach((c, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    
    // Stop if out of page
    if (row > 7) return; 

    const x = startX + col * (boxSize + gapX);
    const y = startY + row * (boxSize + gapY); 

    // Draw Pinyin
    if (config.showPinyin && c.pinyin) {
        ctx.font = fontPinyin;
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        // Pinyin centered above box
        ctx.fillText(c.pinyin, x + boxSize/2, y - 10);
    }

    // Draw Grid Box
    drawGrid(ctx, x, y, boxSize, config.gridType);

    // Draw Character
    ctx.font = fontMain;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Character center
    const cx = x + boxSize/2;
    const cy = y + boxSize/2 + 10; // Slightly lower optical center for KaiTi

    if (config.mode === 'trace') {
        ctx.fillStyle = '#cccccc'; // Light gray for tracing
        ctx.fillText(c.char, cx, cy);
    } else if (config.mode === 'outline') {
        // Outline text is tricky in canvas if we want clean stroke
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#999999';
        ctx.strokeText(c.char, cx, cy);
    } else {
        ctx.fillStyle = '#000000';
        ctx.fillText(c.char, cx, cy);
    }
  });

  // 5. Footer
  const footerY = 3300;
  
  // Footer Line
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(100, footerY);
  ctx.lineTo(2380, footerY);
  ctx.stroke();
  
  // Grass Block Icon
  drawGrassBlock(ctx, 100, footerY + 30, 80);
  
  ctx.font = '40px "Courier New", Courier, monospace';
  ctx.fillStyle = '#888888';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Duomi Study - Craft Your Words!', 200, footerY + 70);
  
  ctx.textAlign = 'right';
  ctx.fillText('Page 1', 2380, footerY + 70);

  // Return data URL
  return canvas.toDataURL('image/jpeg', 0.85); // JPEG slightly smaller than PNG
};

// Helper: Draw Steve Face
function drawSteve(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const p = size / 8; // pixel size
  
  // Face Base
  ctx.fillStyle = '#F0A57C';
  ctx.fillRect(x, y, size, size);
  
  // Hair
  ctx.fillStyle = '#4A3020';
  ctx.fillRect(x, y, size, p*2); // Top hair
  ctx.fillRect(x, y + p*2, p, p); // Sideburn L
  ctx.fillRect(x + size - p, y + p*2, p, p); // Sideburn R

  // Eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + p, y + p*3, p*2, p); // Eye L White
  ctx.fillRect(x + p*5, y + p*3, p*2, p); // Eye R White
  
  ctx.fillStyle = '#3B82F6';
  ctx.fillRect(x + p*2, y + p*3, p, p); // Eye L Blue
  ctx.fillRect(x + p*6, y + p*3, p, p); // Eye R Blue
  
  // Glasses Rim (Black) - optional stylistic choice
  // ctx.strokeStyle = '#000000';
  // ctx.lineWidth = p/8;
  // ctx.strokeRect(x + p, y + p*3, p*2, p);

  // Nose
  ctx.fillStyle = '#B87850';
  ctx.fillRect(x + p*3, y + p*4, p*2, p);

  // Mouth
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(x + p*2, y + p*6, p*4, p);
}

// Helper: Draw Grass Block
function drawGrassBlock(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = '#795548'; // Dirt
  ctx.fillRect(x, y, size, size);
  
  ctx.fillStyle = '#4CAF50'; // Grass Top
  ctx.fillRect(x, y, size, size/3); // Top 1/3
  
  // Drip
  const dripW = size/4;
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(x + dripW, y + size/3, dripW/2, size/6);
  ctx.fillRect(x + dripW*3, y + size/3, dripW/2, size/5);
}

// Helper: Draw Grid (Tian/Mi)
function drawGrid(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, type: string) {
  ctx.save();
  // No translate needed if we use absolute coords
  
  // Outer Box
  ctx.strokeStyle = '#e11d48'; // Red-600
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, size, size);

  // Inner Dashed Lines
  ctx.strokeStyle = '#fda4af'; // Red-300
  ctx.lineWidth = 2;
  ctx.setLineDash([15, 15]); // Dashed
  ctx.beginPath();
  
  // Cross (Tian)
  // Horizontal Mid
  ctx.moveTo(x, y + size/2);
  ctx.lineTo(x + size, y + size/2); 
  
  // Vertical Mid
  ctx.moveTo(x + size/2, y);
  ctx.lineTo(x + size/2, y + size); 
  
  ctx.stroke();

  // Diagonals (Mi)
  if (type === 'mi') {
      ctx.beginPath();
      // TL to BR
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y + size);
      
      // TR to BL
      ctx.moveTo(x + size, y);
      ctx.lineTo(x, y + size);
      
      ctx.stroke();
  }

  ctx.restore();
}
