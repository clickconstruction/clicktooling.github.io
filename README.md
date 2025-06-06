# Click Construction - Hydrostatic Test Report Generator

A standalone web application for creating professional hydrostatic test reports for sewer lines. This application runs entirely in the browser with no server-side components, making it easy to deploy on any static web hosting service.

## Features

- **Complete Test Documentation**: Capture all essential hydrostatic test parameters and results
- **Customer Information Management**: Store customer details for the test report
- **Digital Signatures**: Capture technician and customer signatures directly in the browser
- **PDF Generation**: Create professional PDF reports with a single click
- **Session Storage**: Automatically saves form data to browser session storage
- **Responsive Design**: Works on desktop and mobile devices
- **No Server Required**: Runs entirely in the browser with no backend dependencies

## Technologies Used

- HTML5, CSS3, and JavaScript (ES6+)
- Bootstrap 5 for responsive UI components
- jsPDF for PDF generation
- html2canvas for converting HTML to images
- SignaturePad for capturing digital signatures
- QRCode.js for generating QR codes with report IDs
- LocalStorage for customer data persistence

## Codebase Structure

### Key Files

- `index.html` - Main application HTML with form and report templates
- `js/app-fixed.js` - Main JavaScript file with all application logic (fixed version)
- `js/app.js` - Original JavaScript file (contains duplicate declarations, use app-fixed.js instead)
- `js/date-fix.js` - Standalone fix for date formatting issues
- `css/styles.css` - Custom styling for the application
- `img/` - Directory containing logo and other images

### JavaScript Architecture

The application uses vanilla JavaScript with the following key components:

1. **Form Handling**
   - Input validation and data collection
   - Customer data management with localStorage
   - Form reset functionality

2. **Modal Management**
   - Preview modal for report display
   - Invoice modal for invoice generation
   - Accessibility enhancements for modals

3. **Report Generation**
   - Data formatting and template population
   - Date formatting with timezone handling
   - PDF generation using html2canvas and jsPDF

4. **Customer Data Management**
   - Autocomplete functionality for returning customers
   - LocalStorage persistence for customer information
   - Address parsing and formatting

### Recent Fixes

1. **Date Formatting Fix (June 2025)**
   - Fixed issue where dates entered in the form weren't displaying correctly in the report
   - Solution: Updated `formatDate` function to properly parse YYYY-MM-DD format strings
   - Implementation creates Date objects with explicit year/month/day to avoid timezone issues

2. **JavaScript Structure Fix (June 2025)**
   - Fixed duplicate variable declarations causing syntax errors
   - Created `app-fixed.js` as a clean implementation without duplications
   - Added Bootstrap bundle to ensure proper modal functionality

## Development Guide

### Local Development

1. Clone this repository
2. Run a local server (e.g., `python -m http.server 8888`)
3. Open `http://localhost:8888` in your browser

### Making Changes

#### Adding New Form Fields

1. Add the HTML input in `index.html` within the `hydroTestForm` form
2. Update the `populateReportPreview` function in `app-fixed.js` to include the new field
3. Add the field to the report template in `index.html`

#### Modifying the Report Template

1. Locate the `reportTemplate` div in `index.html`
2. Make changes to the structure while maintaining the ID attributes
3. Update the `populateReportPreview` function if necessary

#### Extending Customer Data

1. Add new fields to the customer form in `index.html`
2. Update the `saveCustomerData` function in `app-fixed.js`
3. Modify the customer data object structure in the localStorage handling

### Common Issues and Solutions

1. **Date Display Issues**
   - The application uses a custom `formatDate` function to handle date formatting
   - Date input is expected in YYYY-MM-DD format (HTML date input standard)
   - The function parses this format and creates a date in the local timezone

2. **PDF Generation Problems**
   - PDF generation uses html2canvas to capture the report as an image
   - Ensure all assets (images, fonts) are properly loaded before generation
   - Check browser console for any CORS-related errors with external resources

3. **Modal Display Issues**
   - The application uses Bootstrap 5 modals with custom accessibility enhancements
   - Modal initialization happens in the DOMContentLoaded event listener
   - Avoid duplicate modal declarations which can cause JavaScript errors

## Future Enhancement Ideas

1. **Signature Capture Enhancement**
   - Add touch/stylus support for better signature quality
   - Implement signature verification or timestamping

2. **Report Template Customization**
   - Allow users to select from multiple report templates
   - Add company information customization in settings

3. **Data Export/Import**
   - Add functionality to export/import customer databases
   - Implement cloud sync options for customer data

4. **Invoice Integration**
   - Enhance the invoice generation with more payment options
   - Add QuickBooks or other accounting software integration

## Getting Started

1. Clone this repository or download the files
2. Open `index.html` in your web browser
3. No installation or server setup required!

## Deployment

This application can be deployed to any static web hosting service:

- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Any standard web hosting service

Simply upload all files while maintaining the directory structure.

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for Click Construction
- Inspired by the original Click Construction Proposal Generator
