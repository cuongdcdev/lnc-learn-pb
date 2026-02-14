# LNC Learn Extension - Complete Design System

## 🎨 Color Palette

### Light Mode Colors

#### Brand Colors
- **LNC Teal (Primary Action)**: `#00C897`
  - Used for: Primary buttons, active tabs, links, focus states
  - 3D Shadow: `#00A07A` (darker teal for bottom border)

- **LNC Orange (Secondary/Accent)**: `#FFB36B`
  - Used for: Secondary actions, highlights, badges
  - 3D Shadow: `#E89D52` (darker orange for bottom border)

#### Background & Surfaces
- **Page Background**: `#F8F9FC` (Soft neutral blue-gray)
- **Card Surface**: `#FFFFFF` (Pure white)
- **Card Border**: `rgba(255, 255, 255, 0.5)` (Semi-transparent white)

#### Text Colors
- **Primary Text (Headings)**: `#2D3748` (Dark slate)
- **Secondary Text (Body)**: `#718096` (Medium gray)
- **Placeholder Text**: `#A0AEC0` (Light gray)

---

### Dark Mode Colors ("Midnight Clay")

#### Brand Colors
- **LNC Teal (Primary Action)**: `#10B981` (Vibrant Emerald)
  - Used for: Primary buttons, active tabs, links, focus states
  - 3D Shadow: `#059669` (Deep emerald for bottom border)

- **LNC Orange (Secondary/Accent)**: `#F59E0B` (Warm Amber)
  - Used for: Secondary actions, highlights, badges
  - 3D Shadow: `#D97706` (Deep amber for bottom border)

#### Background & Surfaces
- **Page Background**: `#0F172A` (Deep Slate)
- **Card Surface**: `#1E293B` (Elevated Surface)
- **Rim Lighting Border**: `#334155` (Subtle top border for depth)

#### Text Colors
- **Primary Text (Headings)**: `#F1F5F9` (Soft White)
- **Secondary Text (Body)**: `#94A3B8` (Muted Slate)
- **Placeholder Text**: `#6B7280` (Darker gray)

---

## 🔘 Button Styles

### Primary Button (Teal)
**Light Mode:**
- Background: `#00C897`
- Text: `#FFFFFF`
- Bottom Border: `3px solid #00A07A`
- Shadow: `2px 2px 6px rgba(0, 200, 151, 0.3)`
- Padding: `16px horizontal, 10px vertical`

**Dark Mode:**
- Background: `#10B981`
- Text: `#FFFFFF`
- Bottom Border: `3px solid #059669`
- Shadow: `0 4px 12px rgba(2, 6, 23, 0.4)` + Glow: `0 0 20px rgba(16, 185, 129, 0.3)`
- Padding: `16px horizontal, 10px vertical`

**Active State (Both Modes):**
- Transform: `translateY(2px)` (shifts down)
- Border Bottom: `0` (removed)

---

### Secondary Button (White/Gray)
**Light Mode:**
- Background: `#FFFFFF`
- Text: `#2D3748`
- Border: `1px solid #E5E7EB`
- Bottom Border: `3px solid #D1D5DB`
- Shadow: `2px 2px 6px rgba(166, 175, 195, 0.3)`
- Padding: `16px horizontal, 10px vertical`

**Dark Mode:**
- Background: `#1E293B`
- Text: `#F1F5F9`
- Border: `1px solid #334155`
- Bottom Border: `3px solid #1E293B`
- Shadow: `0 4px 12px rgba(2, 6, 23, 0.4)`
- Padding: `16px horizontal, 10px vertical`

---

## 📌 Tab Pills (Action Tabs)

### Inactive Tab
**Light Mode:**
- Background: `#FFFFFF`
- Text: `#718096`
- Shadow: `2px 2px 6px rgba(166, 175, 195, 0.3)`
- Padding: `16px horizontal, 10px vertical`
- Hover: Text changes to `#00C897`

**Dark Mode:**
- Background: `#1E293B`
- Text: `#94A3B8`
- Border: `1px solid #334155`
- Shadow: `0 4px 12px rgba(2, 6, 23, 0.4)`
- Padding: `16px horizontal, 10px vertical`
- Hover: Text changes to `#10B981`

### Active Tab
**Light Mode:**
- Background: `#00C897`
- Text: `#FFFFFF`
- Bottom Border: `3px solid #00A07A`
- Shadow: `2px 2px 6px rgba(0, 200, 151, 0.3)`
- Transform: `scale(1.02)` (slightly larger)

**Dark Mode:**
- Background: `#10B981`
- Text: `#FFFFFF`
- Bottom Border: `3px solid #059669`
- Shadow: `0 0 20px rgba(16, 185, 129, 0.3)` (glow effect)
- Transform: `scale(1.02)` (slightly larger)

---

## 🃏 Card Styles

### Standard Card
**Light Mode:**
- Background: `#FFFFFF`
- Border: `1px solid rgba(255, 255, 255, 0.5)`
- Border Radius: `20px`
- Shadow: `4px 4px 12px rgba(166, 175, 195, 0.3), -2px -2px 8px rgba(255, 255, 255, 0.6)`

**Dark Mode:**
- Background: `#1E293B`
- Border Top: `1px solid #334155` (rim lighting)
- Border Radius: `20px`
- Shadow: `0 8px 30px rgba(2, 6, 23, 0.5)`

---

## 📝 Input Fields

### Text Input
**Light Mode:**
- Background: `#FFFFFF`
- Text: `#2D3748`
- Placeholder: `#A0AEC0`
- Border: `transparent`
- Border Radius: `16px`
- Shadow: `inset 2px 2px 4px rgba(166, 175, 195, 0.3)`
- Focus Border: `#00C897`
- Focus Ring: `2px solid rgba(0, 200, 151, 0.2)`

**Dark Mode:**
- Background: `#0F172A` (sunken into surface)
- Text: `#F1F5F9`
- Placeholder: `#6B7280`
- Border: `1px solid #334155`
- Border Radius: `16px`
- Focus Border: `#10B981`
- Focus Ring: `2px solid rgba(16, 185, 129, 0.2)`

---

## 🎭 Component-Specific Colors

### Header
**Light Mode:**
- Background: `rgba(248, 249, 252, 0.9)` with `backdrop-blur-md`
- Border Bottom: `1px solid rgba(255, 255, 255, 0.5)`

**Dark Mode:**
- Background: `rgba(15, 23, 42, 0.9)` with `backdrop-blur-md`
- Border Bottom: `1px solid #334155`

### Context Area (Selected Text Box)
**Light Mode:**
- Background: `#F8F9FC`
- Border: `1px solid #E5E7EB`

**Dark Mode:**
- Background: `#0F172A` (darker than card to appear "sunken")
- Border: `1px solid #334155`

### Result Area
**Light Mode:**
- Background: `#FFFFFF`
- Card styling applies

**Dark Mode:**
- Background: `#1E293B`
- Card styling applies

### Dashboard Cards
**Light Mode:**
- Background: `#FFFFFF`
- Content Snippet Background: `#F8F9FC` (inset)

**Dark Mode:**
- Background: `#1E293B`
- Content Snippet Background: `#0F172A` (inset for hierarchy)
- Border: `1px solid #334155` (subtle, not thick)

### Modal/Settings
**Light Mode:**
- Background: `rgba(255, 255, 255, 0.6)` with `backdrop-blur-md`
- Border: `1px solid #FFFFFF`

**Dark Mode:**
- Background: `rgba(30, 41, 59, 0.9)` with `backdrop-blur-md`
- Border: `1px solid #334155`

---

## 🌈 Badges & Status Indicators

### Action Badges (Translate, Explain, Quiz, Critique)
**Light Mode:**
- Translate: `#00C897` background, white text
- Explain: `#FFB36B` background, dark text
- Quiz: `#8B5CF6` background, white text
- Critique: `#EF4444` background, white text

**Dark Mode:**
- Translate: `#10B981` background, white text
- Explain: `#F59E0B` background, white text
- Quiz: `#A78BFA` background, white text
- Critique: `#F87171` background, white text

---

## 📐 Spacing & Sizing

### Border Radius
- Cards: `20px`
- Buttons/Pills: `16px` (compact)
- Inputs: `16px`
- Modals: `24px`

### Padding
- Buttons: `16px horizontal, 10px vertical`
- Pills: `16px horizontal, 10px vertical`
- Cards: `16px - 24px` (varies by component)
- Inputs: `12px horizontal, 8px vertical`

### Shadows
**Light Mode:**
- Cards: `4px 4px 12px rgba(166, 175, 195, 0.3), -2px -2px 8px rgba(255, 255, 255, 0.6)`
- Buttons: `2px 2px 6px rgba(166, 175, 195, 0.3), -1px -1px 4px rgba(255, 255, 255, 0.6)`

**Dark Mode:**
- Cards: `0 8px 30px rgba(2, 6, 23, 0.5)`
- Buttons: `0 4px 12px rgba(2, 6, 23, 0.4)`
- Active Teal Elements: `0 0 20px rgba(16, 185, 129, 0.3)` (glow)

---

## 🎯 Typography

### Font Family
- Primary: `Nunito, sans-serif`

### Font Weights
- Regular: `400`
- Semibold: `600`
- Bold: `700`
- Extrabold: `800`

### Text Sizes
- Heading 1: `24px` (2xl)
- Heading 2: `20px` (xl)
- Heading 3: `18px` (lg)
- Body: `14px` (sm)
- Small: `12px` (xs)
- Tiny: `10px` (2xs)

---

## 🎨 Design Philosophy

### Claymorphism Aesthetic
- **Light Mode**: Soft, tactile surfaces with subtle shadows and highlights
- **Dark Mode**: "Midnight Clay" with rim lighting and soft glows

### 3D Button Effect (Duolingo-style)
- Bottom border creates depth
- Active state: Button "presses down" (translateY + border removal)
- Maintains playful, friendly feel

### Information Density
- Compact spacing without feeling cramped
- Clear visual hierarchy through color and shadow
- Efficient use of space for learning content

### Accessibility
- High contrast text ratios
- Soft whites in dark mode (not pure white)
- Clear focus states with rings
- Consistent interactive element sizing (44px minimum touch target)
