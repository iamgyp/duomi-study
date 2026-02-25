export const generateEnglishImage = async (
  text: string,
  config: { mode: string; caseType: string; traceColor: string },
  title: string = 'English Writing'
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
  drawSteve(ctx, 100, 100, 160);
  
  // Title
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 100px "Courier New", Courier, monospace';
  ctx.textBaseline = 'top';
  ctx.fillText('DUOMI ENGLISH', 300, 100);
  
  ctx.font = '50px "Courier New", Courier, monospace';
  ctx.fillStyle = '#666666';
  ctx.fillText('Vocabulary Builder', 300, 210);

  // Meta info
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

  // 4. Content Lines
  const startX = 200; // Left margin for text
  const startY = 400; // Top margin
  const rowHeight = 240; // Total height allocated for one row
  const lineHeight = 50; // Gap between each of the 4 lines
  
  // Top: y
  // Mid: y + 50
  // Base: y + 100
  // Bottom: y + 150
  
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const maxRows = 10;
  
  // Font
  // We need a font where letters sit nicely on baseline.
  // Using Arial. Font size 130px roughly works for 100px x-height area (Mid to Base).
  // Actually, standard handwriting fonts have x-height about 50% of cap height.
  // Base line is at y + 100.
  // Mid line is at y + 50.
  // Cap height should touch Top line (y).
  // x-height should touch Mid line (y+50).
  // So we need a font that fits between Top and Base (100px).
  // Arial 100px usually has cap height ~70px. 
  // Let's try 140px.
  const fontSize = 140; 
  const font = `${fontSize}px Arial, sans-serif`;

  words.forEach((word, i) => {
    if (i >= maxRows) return; 

    const rowY = startY + i * rowHeight;
    const gridY = rowY + 50; // Offset grid slightly down in the row area

    // Draw Index
    ctx.font = '40px "Courier New", Courier, monospace';
    ctx.fillStyle = '#999999';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${i + 1}.`, startX - 40, gridY + 75); 

    // Draw 4-Line Grid
    drawFourLineGrid(ctx, startX, gridY, 2000, 50); 

    // Draw Text
    ctx.font = font;
    ctx.fillStyle = config.traceColor; 
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic'; 
    
    // Baseline is the 3rd line (Base line).
    // Line 1: gridY
    // Line 2: gridY + 50
    // Line 3: gridY + 100 (Base)
    const baselineY = gridY + 100;
    
    // Fine tuning: Arial needs to be shifted up slightly to sit perfectly?
    // Let's render it directly on baselineY first.
    ctx.fillText(word, startX + 20, baselineY);
  });
  
  // Fill remaining rows
  for (let i = words.length; i < maxRows; i++) {
     const rowY = startY + i * rowHeight;
     const gridY = rowY + 50;
     
     // Index
     ctx.font = '40px "Courier New", Courier, monospace';
     ctx.fillStyle = '#cccccc';
     ctx.textAlign = 'right';
     ctx.textBaseline = 'middle';
     ctx.fillText(`${i + 1}.`, startX - 40, gridY + 75);
     
     // Grid
     drawFourLineGrid(ctx, startX, gridY, 2000, 50);
  }

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
  ctx.fillText('Duomi Study - Build Your Vocabulary!', 200, footerY + 70);
  
  ctx.textAlign = 'right';
  ctx.fillText('Page 1', 2380, footerY + 70);

  return canvas.toDataURL('image/jpeg', 0.85);
};

// Helper: Draw 4-Line Grid
function drawFourLineGrid(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, gap: number) {
  ctx.save();
  
  // Line 1: Top (Ascender) - Pink Solid
  ctx.beginPath();
  ctx.strokeStyle = '#fca5a5'; // Pink
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.stroke();
  
  // Line 2: Mid (Waist) - Blue Dashed
  ctx.beginPath();
  ctx.strokeStyle = '#93c5fd'; // Blue
  ctx.lineWidth = 2;
  ctx.setLineDash([15, 15]);
  ctx.moveTo(x, y + gap);
  ctx.lineTo(x + width, y + gap);
  ctx.stroke();
  
  // Line 3: Base (Base) - Pink Solid
  ctx.beginPath();
  ctx.strokeStyle = '#fca5a5'; // Pink
  ctx.lineWidth = 3;
  ctx.setLineDash([]); 
  ctx.moveTo(x, y + gap * 2);
  ctx.lineTo(x + width, y + gap * 2);
  ctx.stroke();
  
  // Line 4: Bottom (Descender) - Blue Dashed
  ctx.beginPath();
  ctx.strokeStyle = '#93c5fd'; // Blue
  ctx.lineWidth = 2;
  ctx.setLineDash([15, 15]);
  ctx.moveTo(x, y + gap * 3);
  ctx.lineTo(x + width, y + gap * 3);
  ctx.stroke();

  ctx.restore();
}

// Reused Helpers
function drawSteve(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const p = size / 8;
  ctx.fillStyle = '#F0A57C'; ctx.fillRect(x, y, size, size);
  ctx.fillStyle = '#4A3020'; ctx.fillRect(x, y, size, p*2); 
  ctx.fillRect(x, y + p*2, p, p); ctx.fillRect(x + size - p, y + p*2, p, p);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + p, y + p*3, p*2, p); ctx.fillRect(x + p*5, y + p*3, p*2, p);
  ctx.fillStyle = '#3B82F6'; ctx.fillRect(x + p*2, y + p*3, p, p); ctx.fillRect(x + p*6, y + p*3, p, p);
  ctx.fillStyle = '#B87850'; ctx.fillRect(x + p*3, y + p*4, p*2, p);
  ctx.fillStyle = '#8B4513'; ctx.fillRect(x + p*2, y + p*6, p*4, p);
}

function drawGrassBlock(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = '#795548'; ctx.fillRect(x, y, size, size);
  ctx.fillStyle = '#4CAF50'; ctx.fillRect(x, y, size, size/3);
  const dripW = size/4;
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(x + dripW, y + size/3, dripW/2, size/6);
  ctx.fillRect(x + dripW*3, y + size/3, dripW/2, size/5);
}
