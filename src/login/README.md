# Login Page

A clean, responsive login page component that matches the provided Figma design exactly.

## Features

- **Responsive Design**: Adapts perfectly to mobile, tablet, and desktop screens
- **Material-UI Integration**: Built with MUI components following the project's design system
- **Pixel-Perfect Design**: Matches the Figma design specifications exactly
- **Form Validation**: Basic form handling with controlled inputs
- **Responsive Checkbox**: Checked by default on desktop, unchecked on mobile

## Usage

The login page is available at the `/login` route:

```tsx
import LoginPage from "./login/LoginPage";

// In your router
<Route path="/login" element={<LoginPage />} />
```

## Design Specifications

The component follows the exact specifications from the Figma design:

- **Typography**: Roboto font family with specific font weights and sizes
- **Colors**: Material Design color palette with primary blue (#1976D2)
- **Spacing**: 16px padding and gaps as specified in the design
- **Layout**: Centered container with responsive behavior
- **Form Elements**: Custom styled TextField, Checkbox, and Button components

## Responsive Behavior

- **Desktop (≥960px)**: Centered card layout with checkbox checked by default
- **Mobile (<960px)**: Full-height layout with checkbox unchecked by default
- **Tablet**: Adapts fluidly between mobile and desktop layouts

## Form State

The component manages the following form state:

- Email input
- Password input  
- Remember me checkbox (responsive default state)

Form submission logs the current values to console for development purposes.
