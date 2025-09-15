# Bulk Flyer Generator

A professional React-based web application for musicians to create high-quality show flyers that can be exported as PNG images for social media platforms like Instagram and Facebook.

## 🚀 Features

- **Bulk Processing**: Load multiple shows from CSV and generate flyers for all at once
- **Real-time Preview**: See your flyer update in real-time as you type
- **Social Media Optimized**: Export in perfect dimensions for Instagram (1080x1080) and Facebook (1200x630)
- **Monthly Organization**: Automatically organize exported flyers by month in ZIP files
- **High-Quality Export**: Uses html2canvas with 8x resolution scaling for maximum quality
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **TypeScript**: Fully typed for better development experience
- **Reusable Components**: Modular React architecture for easy maintenance

## 🛠 Technology Stack

- **React 18** with TypeScript
- **html2canvas** for high-quality image generation
- **JSZip** for bulk export functionality
- **PapaParse** for CSV parsing
- **CSS3** with modern styling and animations

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mrmonroe/bulkflyergenerator.git
cd bulkflyergenerator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Prepare Your Data

Place your `shows.csv` file in the `public` directory. The CSV should have the following columns:
- `Date` - Show date (e.g., "Aug 20th", "August 27th")
- `Venue Name` - Name of the venue
- `Venue Address` - Full address of the venue
- `Show Time` - Show time (e.g., "7:00-10:00pm")

### 4. Add Your Logo

Replace `public/logo.png` with your own logo image.

### 5. Start the Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`.

## 📁 Project Structure

```
bulkflyergenerator/
├── public/
│   ├── shows.csv          # Your shows data
│   ├── logo.png           # Your logo
│   └── index.html
├── src/
│   ├── components/        # Reusable React components
│   │   ├── FlyerPreview.tsx
│   │   └── ExportButton.tsx
│   ├── services/          # Business logic
│   │   └── flyerGenerator.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── csvParser.ts
│   │   └── flyerUtils.ts
│   ├── App.tsx            # Main application component
│   └── App.css            # Main styles
└── package.json
```

## 🎨 How to Use

### Individual Flyer Generation

1. **Load Shows**: Click "Load Shows from CSV" to load your shows data
2. **Preview**: Each show will display as a preview flyer
3. **Export**: Click "Instagram" or "Facebook" buttons to export individual flyers

### Bulk Export

1. **Load Shows**: Ensure your shows are loaded
2. **Bulk Export**: Click "Export All Instagram" or "Export All Facebook"
3. **Download**: A ZIP file will be downloaded with all flyers organized by month

## 🎯 Export Options

- **Instagram**: 1080x1080 pixels (square format)
- **Facebook**: 1200x630 pixels (landscape format)
- **Monthly Organization**: Flyers are automatically organized by month in the ZIP file

## 🔧 Customization

### Styling

The flyer template uses a consistent design with:
- **Background**: Dark (#231F20)
- **Accent Color**: Gold (#caa12b)
- **Font**: Oswald (Google Fonts)
- **Layout**: Centered with logo, date, venue, address, time, and event type

### Adding New Features

The modular architecture makes it easy to add new features:

1. **New Export Formats**: Add to `ExportOptions` type and `FlyerGenerator` service
2. **New Flyer Styles**: Extend the `FLYER_STYLES` array in `types/index.ts`
3. **New Components**: Create reusable components in the `components/` directory

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `build` folder.

### Deploy to GitHub Pages

```bash
npm install --save-dev gh-pages
npm run build
npx gh-pages -d build
```

### Deploy to Netlify/Vercel

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy!

## 🧪 Testing

```bash
npm test
```

## 📝 CSV Format

Your `shows.csv` should follow this format:

```csv
Date,Venue Name,Venue Address,Show Time
Aug 20th,Crackers Lounge,"1241 Blanding Blvd #43-44, Orange Park, FL 32065",7:00-10:00pm
August 27th,Dantes Place Jax,"14965 Old St Augustine Rd, Jacksonville, FL 32258",8:00-11:00pm
```

## 🎨 Flyer Design

The flyer template includes:
- **Logo**: Your logo at the top
- **Date**: Large, prominent date
- **Venue Name**: Venue name in accent color
- **Address**: Full address in white text
- **Show Time**: Time information
- **Event Type**: "Live Acoustic Music" (customizable)

## 🔍 Troubleshooting

### Common Issues

1. **CSV Not Loading**: Ensure `shows.csv` is in the `public` directory
2. **Logo Not Showing**: Check that `logo.png` exists in the `public` directory
3. **Export Failing**: Ensure you have a modern browser with JavaScript enabled

### Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎵 For Musicians

This tool is designed specifically for musicians who need to create professional promotional materials for their shows. The template is optimized for social media sharing and maintains a consistent brand across all your promotional materials.

## 🆘 Support

If you encounter any issues or have suggestions for improvements, please:
1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed information

---

**Happy Flyer Making! 🎵✨**