import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, 'public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3b82f6');
  gradient.addColorStop(1, '#1d4ed8');
  
  // Draw rounded rectangle background
  ctx.fillStyle = gradient;
  const radius = size * 0.15;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();
  
  // Draw "SA" text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SA', size / 2, size / 2);
  
  // Draw small briefcase icon
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  const briefcaseSize = size * 0.25;
  const briefcaseX = size / 2 - briefcaseSize / 2;
  const briefcaseY = size * 0.2;
  
  ctx.fillRect(briefcaseX, briefcaseY, briefcaseSize, briefcaseSize * 0.6);
  ctx.fillRect(briefcaseX + briefcaseSize * 0.1, briefcaseY - briefcaseSize * 0.15, briefcaseSize * 0.8, briefcaseSize * 0.2);
  
  // Save the icon
  const buffer = canvas.toBuffer('image/png');
  const iconPath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(iconPath, buffer);
  
  console.log(`Created ${iconPath} (${buffer.length} bytes)`);
});

console.log('Extension icons created successfully!');
