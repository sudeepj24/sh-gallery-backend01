# Secure House Product Upload Guide

This guide explains how to add new product images to your gallery.

## Folder Structure

All product images are stored in the `public/products/` directory. The folder structure mirrors your product categories and subcategories.

### Main Categories

```
public/products/
├── doors/
├── windows/
├── garage-doors/
├── industrial-fire-doors/
├── full-house-projects/
├── commercial-doors/
├── communal-entrance-doors/
├── shopfronts/
└── bullet-proof-door/
```

### Doors Subfolder Structure

```
doors/
├── traditional/
│   ├── single/
│   │   ├── black/
│   │   ├── grey/
│   │   └── other/
│   ├── double/
│   │   ├── black/
│   │   ├── grey/
│   │   └── other/
│   └── with-side-windows/
│       ├── black/
│       ├── grey/
│       └── other/
└── modern/
    ├── single/
    │   ├── black/
    │   ├── grey/
    │   └── other/
    ├── double/
    │   ├── black/
    │   ├── grey/
    │   └── other/
    └── with-side-windows/
        ├── black/
        ├── grey/
        └── other/
```

### Windows Subfolder Structure

```
windows/
├── casement/
├── sash/
└── security/
```

### Garage Doors Subfolder Structure

```
garage-doors/
├── side-hinged/
├── trackless/
├── mews-doors/
├── timber-clad/
└── sectional/
```

### Other Categories

The following categories have no subcategories:
- `industrial-fire-doors/`
- `full-house-projects/`
- `commercial-doors/`
- `communal-entrance-doors/`
- `shopfronts/`
- `bullet-proof-door/`

## File Naming Convention

Use this naming pattern for all product images:

```
{category}-{style}-{size}-{color}-{number}.jpg
```

### Examples:

- **Traditional Single Black Door**: `door-traditional-single-black-001.jpg`
- **Modern Double Grey Door**: `door-modern-double-grey-015.jpg`
- **Door with Side Windows**: `door-modern-with-side-windows-black-023.jpg`
- **Casement Window**: `window-casement-001.jpg`
- **Side Hinged Garage Door**: `garage-side-hinged-001.jpg`
- **Commercial Door**: `commercial-door-001.jpg`
- **Shopfront**: `shopfront-001.jpg`

### Numbering System

- Use 3-digit numbers with leading zeros: `001`, `002`, `003`, etc.
- Numbers should be sequential but don't need to be consecutive
- The number appears as a badge on the product card (e.g., #001)
- This makes it easy for customers to reference specific products

## Adding a New Product

### Step 1: Upload the Image

1. Choose the correct folder based on your product's category and subcategories
2. Name the file following the naming convention above
3. Place the image file in the appropriate folder

**Example**: For a traditional single door in grey:
- Navigate to: `public/products/doors/traditional/single/grey/`
- Upload: `door-traditional-single-grey-025.jpg`

### Step 2: Add Product Information

Open `src/data/products.json` and add a new entry:

```json
{
  "id": "door-025",
  "filename": "door-traditional-single-grey-025.jpg",
  "path": "/products/doors/traditional/single/grey/door-traditional-single-grey-025.jpg",
  "productName": "Traditional Single Door - Grey",
  "description": "Your detailed product description here. Include features, materials, security features, and any other relevant information.",
  "mainCategory": "doors",
  "subcategories": {
    "style": "traditional",
    "size": "single",
    "color": "grey"
  },
  "tags": ["security", "residential", "steel-frame", "premium"]
}
```

### Field Descriptions:

- **id**: Unique identifier (e.g., `door-025`, `window-012`, `garage-005`)
- **filename**: The exact filename of your image
- **path**: Full path starting with `/products/...`
- **productName**: Display name shown to customers
- **description**: Detailed product information
- **mainCategory**: Must match one of the main category IDs
- **subcategories**: Object containing subcategory filters
- **tags**: Array of searchable tags (lowercase, hyphenated)

### Main Category IDs:

```
doors
windows
garage-doors
industrial-fire-doors
full-house-projects
commercial-doors
communal-entrance-doors
shopfronts
bullet-proof-door
```

### Subcategory Options:

**For Doors:**
```json
{
  "style": "traditional" or "modern",
  "size": "single" or "double" or "with-side-windows",
  "color": "black" or "grey" or "other"
}
```

**For Windows:**
```json
{
  "type": "casement" or "sash" or "security"
}
```

**For Garage Doors:**
```json
{
  "type": "side-hinged" or "trackless" or "mews-doors" or "timber-clad" or "sectional"
}
```

**For Other Categories:**
```json
{}
```
(Empty object - no subcategories)

## Bulk Upload Process

### For Multiple Images:

1. **Organize your images** into the correct folders locally first
2. **Upload all images** to the appropriate folders via FTP or file manager
3. **Create a spreadsheet** with columns for: id, filename, path, productName, description, mainCategory, subcategories, tags
4. **Convert to JSON** format and add to `products.json`

### Quick JSON Template for Copy-Paste:

```json
{
  "id": "",
  "filename": "",
  "path": "/products/",
  "productName": "",
  "description": "",
  "mainCategory": "",
  "subcategories": {},
  "tags": []
}
```

## Image Specifications

### Recommended:
- **Format**: JPG or PNG
- **Aspect Ratio**: Square (1:1) works best
- **Minimum Size**: 800x800 pixels
- **Maximum Size**: 2000x2000 pixels
- **File Size**: Under 1MB per image for optimal loading

### Tips:
- Use high-quality images to showcase product details
- Ensure good lighting and clear visibility of security features
- Consistent backgrounds help maintain professional appearance
- Consider showing products from multiple angles (use different product numbers)

## Testing Your Upload

After adding images and updating the JSON file:

1. Open your browser and navigate to the gallery
2. Select the appropriate filters to find your product
3. Verify the image loads correctly
4. Click to open the lightbox and test zoom functionality
5. Confirm all product information displays properly

## Common Issues

### Image Not Showing:
- Check the file path in JSON matches the actual file location
- Verify the filename spelling is identical (case-sensitive)
- Ensure the image file is in the correct folder

### Product Not Appearing in Filters:
- Verify `mainCategory` matches exactly (use hyphens, not spaces)
- Check subcategory values are spelled correctly
- Ensure subcategory keys match the filter IDs

### Number Not Displaying Correctly:
- The product number is extracted from the `id` field
- Format: `category-###` (e.g., `door-001`)
- Use 3-digit numbers with leading zeros

## Need Help?

Review the existing entries in `src/data/products.json` as examples. The sample products demonstrate the correct format and structure for each category type.
