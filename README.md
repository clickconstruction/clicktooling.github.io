# Click Tooling - Reports for Licensed Professionals

A standalone web application for creating professional test reports (hydrostatic and gas) for plumbing professionals. This application runs entirely in the browser with no server-side components, making it easy to deploy on any static web hosting service. When sharing links, the page title displays as "Click Tooling - Reports for Licensed Professionals".

## Features

- **Test Types**: Pre-Test, Post-Test (Supply/Sewer), Pinpoint Test, and Gas Test
- **Customer Information**: Quick Fill (paste name/address/email/phone), autocomplete from saved customers, shareable URLs with pre-filled data
- **Hydrostatic Reports**: PASS/FAIL results, customizable conclusions, certification
- **Gas Test**: House Pressure (PSI, in WC, oz/in², mm WC with auto-conversion) and House Utilities (fixtures with BTU/hr, running total)
- **PDF Generation**: Create professional PDF reports and invoices with a single click (html2canvas + jsPDF)
- **LocalStorage**: Customer data persistence for returning customers
- **Responsive Design**: Bootstrap 5, works on desktop and mobile devices
- **No Server Required**: Runs entirely in the browser with no backend dependencies

## How the App Works

### Workflow

1. Select a test type (Pre-Test, Post-Test, Pinpoint Test, or Gas Test)
2. Enter customer information and test location
3. Fill in test-specific fields (e.g., for Gas Test: House Pressure and/or House Utilities)
4. For hydrostatic tests: choose PASS or FAIL
5. Click **Report** to preview, then **Download PDF**; or **Invoice** for billing

### Test Type Behavior

- **Pre-Test / Post-Test**: Choose Supply or Sewer; enter test duration; PASS/FAIL required
- **Pinpoint Test**: Location, method, findings; no PASS/FAIL; different certification text
- **Gas Test**: House Pressure (enter one unit, others auto-compute; Reset to clear); House Utilities (add fixtures, BTU/hr with comma formatting, [x1,000] button, quick-fill buttons)

### Gas Test Details

- **Pressure conversions** (PSI as base): 1 PSI = 16 oz/in², 27.68 in WC, 703 mm WC
- **Locked fields** turn gray when one pressure value is entered; Reset Pressure button turns orange
- **BTU/hr**: Comma formatting (e.g., 100,000), step 5000 for arrow keys, [x1,000] multiplies value
- **Report**: House Pressure and House Utilities sections appear only when data exists

## Technologies Used

- HTML5, CSS3, and JavaScript (ES6+)
- Bootstrap 5 for responsive UI components
- jsPDF for PDF generation
- html2canvas for converting HTML to images
- LocalStorage for customer data persistence

## Codebase Structure

### Key Files

- `index.html` - Main application HTML with form and report templates
- `js/app-fixed.js` - Main JavaScript file with all application logic
- `css/styles.css` - Custom styling for the application
- `img/` - Directory containing logo (logo.svg) and favicon

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

5. **Gas Test Logic**
   - Pressure unit conversion (PSI, in WC, oz/in², mm WC)
   - Fixture add/remove, BTU formatting with commas, quick-fill buttons
   - [x1,000] multiplier for BTU values

6. **Test Type Routing**
   - Show/hide sections per test type (Supply/Sewer, Pinpoint, Gas Test)
   - Validation rules (PASS/FAIL required for hydrostatic; optional for Pinpoint and Gas Test)

### Recent Fixes

1. **Gas Test (2025)**
   - New test type with House Pressure and House Utilities
   - Pressure unit conversion (PSI, in WC, oz/in², mm WC)
   - Fixture list with BTU/hr, quick-fill buttons, [x1,000] multiplier
   - Report shows only sections with data

2. **Codebase Cleanup**
   - Single JavaScript file (`app-fixed.js`), logo.svg, no duplicate Bootstrap
   - Removed legacy and backup JavaScript files

3. **Branding**
   - Page title: "Click Tooling - Reports for Licensed Professionals"

4. **Date Formatting**
   - `formatDate` handles YYYY-MM-DD with local timezone

## Development Guide

### Local Development

1. Clone this repository
2. Run a local server (e.g., `python -m http.server 8888`)
3. Open `http://localhost:8888` in your browser

### Making Changes

#### Adding a New Test Type

1. Add the test type button in `index.html` (e.g., `data-test-type="gas-test"`)
2. Add the content block with `style="display: none;"` and wire show/hide in the test type handler
3. In `app-fixed.js`: update `formatTestType`, add branch in test type button click handler, add reset logic
4. Add report template section in `index.html` and a branch in `populateReportPreview`
5. Update `validateForm` (e.g., skip PASS/FAIL for the new type)

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
2. Open `index.html` in your web browser (or visit [clicktooling.com](https://clicktooling.com) if deployed)
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

- Built for Click Construction / Click Tooling
- Inspired by the original Click Construction Proposal Generator
