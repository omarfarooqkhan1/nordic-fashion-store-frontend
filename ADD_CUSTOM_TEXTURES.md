# Adding Custom Textures to Your Configurator

## Overview
You can now add your own custom leather textures to the configurator. The system is set up to use 3 new texture slots: `user-texture-1`, `user-texture-2`, and `user-texture-3`.

## Step 1: Convert Your Images to PNG

### **Image Requirements:**
- **Format**: PNG (with transparency support)
- **Size**: Minimum 512x512px, preferably 1024x1024px
- **Quality**: High resolution, clear details
- **Style**: Seamless, tileable leather textures

### **Conversion Tools:**
- **Online Converters**: 
  - Convertio.co
  - CloudConvert.com
  - Zamzar.com
- **Desktop Software**:
  - GIMP (free)
  - Photoshop
  - Paint.NET (free)

## Step 2: Prepare Your Texture Images

### **File Naming:**
Save your images with these exact names:
```
user-texture-1.png
user-texture-2.png
user-texture-3.png
```

### **Image Optimization:**
- **Remove backgrounds** if possible (use transparency)
- **Ensure seamless tiling** (edges should match)
- **Optimize file size** (compress without quality loss)
- **Maintain aspect ratio** (square images work best)

## Step 3: Add Images to Your Project

### **Create the textures folder:**
```
nordic-fashion-store-frontend/public/textures/
```

### **Copy your PNG files:**
```
nordic-fashion-store-frontend/public/textures/user-texture-1.png
nordic-fashion-store-frontend/public/textures/user-texture-2.png
nordic-fashion-store-frontend/public/textures/user-texture-3.png
```

## Step 4: Customize Texture Names and Descriptions

### **Edit the texture definitions in your code:**
```typescript
'user-texture-1': {
  name: 'Your Custom Name',           // Change this
  description: 'Your description',    // Change this
  imageUrl: '/textures/user-texture-1.png',
  opacity: 0.85                      // Adjust if needed
},
'user-texture-2': {
  name: 'Another Custom Name',        // Change this
  description: 'Another description', // Change this
  imageUrl: '/textures/user-texture-2.png',
  opacity: 0.85                      // Adjust if needed
},
'user-texture-3': {
  name: 'Third Custom Name',          // Change this
  description: 'Third description',   // Change this
  imageUrl: '/textures/user-texture-3.png',
  opacity: 0.85                      // Adjust if needed
}
```

## Step 5: Test Your Textures

### **After adding the images:**
1. **Start your development server**
2. **Open the configurator**
3. **Go to the "Leather Texture" section**
4. **Select each of your new textures**
5. **Verify they display correctly on the jacket**

## Step 6: Fine-tune (Optional)

### **Adjust opacity if needed:**
- **Too transparent**: Increase opacity (0.9, 0.95)
- **Too opaque**: Decrease opacity (0.7, 0.8)
- **Perfect balance**: Keep at 0.85

### **Adjust image positioning:**
If your textures don't align perfectly, you can modify the image overlay coordinates in the code:
```typescript
<image
  href={textures[selectedTexture].imageUrl}
  x="15"                    // Adjust horizontal position
  y="45"                    // Adjust vertical position
  width="170"               // Adjust width
  height="220"              // Adjust height
  preserveAspectRatio="none"
  opacity={textures[selectedTexture].opacity}
/>
```

## Troubleshooting

### **Common Issues:**

#### **Images Not Loading:**
- Check file paths are correct
- Ensure images are in the `/public/textures/` folder
- Verify file names match exactly (case-sensitive)

#### **Poor Quality:**
- Use higher resolution source images
- Ensure PNG format with good compression
- Check for pixelation or blur

#### **Tiling Issues:**
- Make sure images are seamless
- Test tiling in an image editor first
- Adjust image dimensions if needed

#### **Performance Issues:**
- Optimize PNG file sizes
- Use appropriate resolution (1024x1024px max)
- Consider using WebP format for better compression

## Advanced Customization

### **Add More Texture Slots:**
If you want more than 3 custom textures, add more entries to the `textures` object:

```typescript
'user-texture-4': {
  name: 'Fourth Custom Texture',
  description: 'Another custom leather texture',
  imageUrl: '/textures/user-texture-4.png',
  opacity: 0.85
},
// Add more as needed...
```

### **Dynamic Texture Loading:**
For even more flexibility, you could implement a system that loads textures dynamically from a folder, but this requires more complex code changes.

## Result

After following these steps, your configurator will have:
- **3 new custom texture options** alongside the existing ones
- **User-selectable textures** that apply as overlays
- **Professional appearance** with your own leather textures
- **Easy customization** - just replace the PNG files to update textures

## Next Steps

1. **Convert your images** to PNG format
2. **Add them to the textures folder**
3. **Test in the configurator**
4. **Customize names and descriptions**
5. **Fine-tune opacity and positioning**

Your custom textures will then be available for users to select and apply to their jacket configurations!
