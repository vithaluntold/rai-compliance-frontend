# RAi Brand Color Guidelines

## Primary Brand Color
- **RAi Blue**: `#0087d9` (rgba(0,135,217,255))
- **HSL**: `203 100% 43%`

## Usage in Code

### CSS Variables
```css
--rai-primary: 203 100% 43%; /* For hsl() usage */
--rai-blue-hex: #0087d9;     /* For direct hex usage */
```

### Tailwind Classes
```tsx
// Using Tailwind color system
className="text-rai-blue bg-rai-blue border-rai-blue"
className="text-rai-primary bg-rai-primary"

// Using utility classes
className="text-rai-blue hover:bg-rai-blue"
className="rai-gradient" // For gradients
```

### Direct Hex Usage
```tsx
// When you need the exact hex color
className="text-[#0087d9] bg-[#0087d9]"
style={{ color: '#0087d9' }}
```

## Brand Color Palette
- **Primary**: #0087d9 (RAi Blue)
- **Secondary**: hsl(220 70% 50%) (Medium blue)
- **Accent**: hsl(200 85% 55%) (Light accent)
- **Gray**: hsl(210 10% 50%) (Professional gray)
- **Light Gray**: hsl(210 15% 95%) (Light background)
- **Dark**: hsl(218 30% 15%) (Dark text)

## Implementation Status
✅ CSS variables updated
✅ Tailwind config updated
✅ All component files updated
✅ Utility classes created
✅ Documentation created