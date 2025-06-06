// This file contains the fixed date formatting function
// Include this file in your HTML before the main app.js

// Override the formatDate function to fix date display issues
function formatDate(dateString) {
    if (!dateString) return '';
    
    // Split the date string and create a date object with local timezone
    // This prevents timezone issues when parsing YYYY-MM-DD format
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
        // Create date with local timezone (months are 0-indexed in JS Date)
        const date = new Date(year, month - 1, day);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Fallback to standard parsing if the format is different
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
