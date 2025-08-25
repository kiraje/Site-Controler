# Multi-Site Control Panel

Firebase-based control panel for managing multiple PHP sites with remote filter toggling.

## Features

- Add/remove sites dynamically
- Toggle filter status (on/off) for each site
- Generate PHP integration code
- Real-time sync across all instances
- Clean, responsive UI

## Tech Stack

- Vanilla JavaScript (ES6+)
- Firebase Realtime Database
- Vite (development)
- No frontend frameworks - pure JS

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Open http://localhost:3000

## Production

Open `dist/index.html` directly in a browser - no build required.

## Usage

1. Add a site using the form
2. Toggle filter on/off as needed
3. Click "Get Code" to get PHP snippet
4. Add the PHP code to your site's index.php
5. Create a `filter.php` file with your filtering logic

## Structure

```
src/           # Source modules (development)
dist/          # Production-ready files
├── index.html # Main HTML
├── styles.css # Styles
└── app.js     # Bundled JavaScript
```