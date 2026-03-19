#!/usr/bin/env node

// Simple script to create placeholder PNG icons using canvas
const fs = require('fs');
const path = require('path');

// Create simple 16x16 PNG icon (blue square with SA)
const createIcon16 = () => {
  // Simple 16x16 blue square with white "SA"
  const canvas = [
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    // IHDR chunk (16x16, 8-bit, RGB)
    0x00, 0x00, 0x00, 0x0D, // Chunk length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x10, // Width: 16
    0x00, 0x00, 0x00, 0x10, // Height: 16
    0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    // IDAT chunk (simplified - just a blue square)
    0x00, 0x00, 0x00, 0x0C, // Chunk length
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Compressed data
    0x00, 0x00, 0x00, 0x00, // CRC
    // IEND chunk
    0x00, 0x00, 0x00, 0x00, // Chunk length
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82  // CRC
  ];
  return Buffer.from(canvas);
};

// Create icons for all required sizes
const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, 'public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon-${size}.png`);
  
  // Create a simple blue square icon
  // For now, create a minimal valid PNG file
  const minimalPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // Chunk length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    ...sizeToBytes(size), // Width and height
    0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, etc.
    0x00, 0x00, 0x00, 0x00, // CRC placeholder
    0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x78, 0x9C, 0x62, 0x00, 0x02, 0x00, 0x00, 0x05, 0x00, 0x01, // Minimal compressed data
    0x00, 0x00, 0x00, 0x00, // CRC placeholder
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82  // IEND CRC
  ]);
  
  fs.writeFileSync(iconPath, minimalPNG);
  console.log(`Created ${iconPath}`);
});

function sizeToBytes(size) {
  const width = Buffer.alloc(4);
  const height = Buffer.alloc(4);
  width.writeUInt32BE(size, 0);
  height.writeUInt32BE(size, 0);
  return [...width, ...height];
}

console.log('Extension icons created successfully!');
