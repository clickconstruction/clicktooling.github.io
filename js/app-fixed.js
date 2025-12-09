document.addEventListener('DOMContentLoaded', function() {
    // Initialize date field with current date
    const today = new Date();
    document.getElementById('testDate').valueAsDate = today;
    
    // Customer data management
    let savedCustomers = JSON.parse(localStorage.getItem('savedCustomers') || '[]');
    
    // Create a datalist for customer autocomplete
    const customerDatalist = document.createElement('datalist');
    customerDatalist.id = 'customerList';
    document.body.appendChild(customerDatalist);
    
    // Add the datalist to the customer name input
    const customerNameInput = document.getElementById('customerName');
    customerNameInput.setAttribute('list', 'customerList');
    
    // Populate datalist with saved customers
    function updateCustomerDatalist() {
        customerDatalist.innerHTML = '';
        savedCustomers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.name;
            option.setAttribute('data-email', customer.email);
            option.setAttribute('data-phone', customer.phone);
            option.setAttribute('data-company', customer.company);
            option.setAttribute('data-address', customer.address);
            option.setAttribute('data-city', customer.city);
            option.setAttribute('data-state', customer.state);
            option.setAttribute('data-zip', customer.zip);
            customerDatalist.appendChild(option);
        });
    }
    
    updateCustomerDatalist();
    
    // Fill in customer details when a name is selected
    customerNameInput.addEventListener('change', function() {
        const selectedName = this.value;
        const customer = savedCustomers.find(c => c.name === selectedName);
        
        if (customer) {
            document.getElementById('customerEmail').value = customer.email || '';
            document.getElementById('customerPhone').value = customer.phone || '';
            document.getElementById('customerCompany').value = customer.company || '';
            
            // Set hidden fields for compatibility
            document.getElementById('testAddress').value = customer.address || '';
            document.getElementById('testCity').value = customer.city || '';
            document.getElementById('testState').value = customer.state || '';
            document.getElementById('testZip').value = customer.zip || '';
            
            // Format and set the combined location field
            let fullAddress = '';
            if (customer.address) fullAddress += customer.address;
            if (customer.city) {
                if (fullAddress) fullAddress += '\n';
                fullAddress += customer.city;
            }
            if (customer.state || customer.zip) {
                if (customer.city) {
                    fullAddress += ', ';
                } else if (fullAddress) {
                    fullAddress += '\n';
                }
                if (customer.state) fullAddress += customer.state;
                if (customer.zip) fullAddress += ' ' + customer.zip;
            }
            
            document.getElementById('testLocation').value = fullAddress;
        }
    });
    
    // Save customer data when form is submitted
    function saveCustomerData() {
        const customerName = document.getElementById('customerName').value;
        if (!customerName) return;
        
        const customerEmail = document.getElementById('customerEmail').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerCompany = document.getElementById('customerCompany').value;
        
        // Parse the combined location field to extract components if possible
        const testLocation = document.getElementById('testLocation').value;
        let testAddress = document.getElementById('testAddress').value;
        let testCity = document.getElementById('testCity').value;
        let testState = document.getElementById('testState').value;
        let testZip = document.getElementById('testZip').value;
        
        // If we have a location but no address components, try to extract them
        if (testLocation && (!testAddress && !testCity && !testState && !testZip)) {
            const lines = testLocation.split('\n');
            if (lines.length >= 1) {
                testAddress = lines[0].trim();
            }
            if (lines.length >= 2) {
                const cityStateZip = lines[1].trim();
                const parts = cityStateZip.split(',');
                if (parts.length >= 1) {
                    testCity = parts[0].trim();
                }
                if (parts.length >= 2) {
                    const stateZipParts = parts[1].trim().split(' ');
                    if (stateZipParts.length >= 1) {
                        testState = stateZipParts[0].trim();
                    }
                    if (stateZipParts.length >= 2) {
                        testZip = stateZipParts[1].trim();
                    }
                }
            }
        }
        
        // Check if customer already exists
        const existingCustomerIndex = savedCustomers.findIndex(c => c.name === customerName);
        
        if (existingCustomerIndex !== -1) {
            // Update existing customer
            savedCustomers[existingCustomerIndex] = {
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
                company: customerCompany,
                address: testAddress,
                city: testCity,
                state: testState,
                zip: testZip
            };
        } else {
            // Add new customer
            savedCustomers.push({
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
                company: customerCompany,
                address: testAddress,
                city: testCity,
                state: testState,
                zip: testZip
            });
        }
        
        // Save to localStorage
        localStorage.setItem('savedCustomers', JSON.stringify(savedCustomers));
        
        // Update datalist
        updateCustomerDatalist();
    }

    // Initialize modals with accessibility options
    const previewModal = new bootstrap.Modal(document.getElementById('previewModal'), {
        backdrop: true,
        keyboard: true,
        focus: true
    });
    const invoiceModal = new bootstrap.Modal(document.getElementById('invoiceModal'), {
        backdrop: true,
        keyboard: true,
        focus: true
    });
    
    // Fix modal accessibility issues with aria-hidden and focus management
    function setupModalAccessibility(modalId) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;
        
        // Instead of removing aria-hidden, use the inert attribute on other elements
        // This is the recommended approach for accessibility
        modalElement.addEventListener('shown.bs.modal', function() {
            // Make sure the modal is not inert
            this.removeAttribute('inert');
            
            // Focus the first focusable element in the modal
            const focusableElements = this.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        });
        
        // When modal is hidden, restore focus to the element that opened it
        let previousActiveElement = null;
        
        modalElement.addEventListener('show.bs.modal', function() {
            // Store the currently focused element
            previousActiveElement = document.activeElement;
        });
        
        modalElement.addEventListener('hidden.bs.modal', function() {
            // Restore focus to the element that opened the modal
            if (previousActiveElement) {
                previousActiveElement.focus();
            }
        });
    }
    
    // Set up accessibility fixes for both modals
    setupModalAccessibility('previewModal');
    setupModalAccessibility('invoiceModal');
    
    // Generate unique report ID
    function generateReportId() {
        const timestamp = Date.now().toString();
        return 'RPT-' + timestamp.substring(timestamp.length - 8);
    }
    
    // Format date for display - FIXED VERSION
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
    
    // Format test type for display
    function formatTestType(testTypeValue) {
        const testTypeMap = {
            'pre-test': 'Pre-Test',
            'post-test': 'Post-Test',
            'pinpoint-test': 'Pinpoint Test'
        };
        return testTypeMap[testTypeValue] || '';
    }
    
    // Populate report preview with form data
    function populateReportPreview() {
        // Get form values
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerCompany = document.getElementById('customerCompany').value;
        
        const testLocation = document.getElementById('testLocation').value;
        const testType = document.getElementById('testType').value;
        const testDate = document.getElementById('testDate').value;
        const testDuration = document.getElementById('testDuration').value;
        const testDescription = document.getElementById('testDescription').value;
        const systemTested = document.getElementById('systemTested').value;
        const testMethod = document.getElementById('testMethod').value;
        
        // Get pinpoint test fields if applicable
        const pinpointLocation = document.getElementById('pinpointLocation').value;
        const pinpointMethod = document.getElementById('pinpointMethod').value;
        const pinpointFindings = document.getElementById('pinpointFindings').value;
        
        const testResult = document.querySelector('input[name="testResult"]:checked').value;
        const testNotes = document.getElementById('testNotes').value;
        
        // Get the appropriate conclusion based on test result
        const passConclusion = document.getElementById('passConclusion').value;
        const failConclusion = document.getElementById('failConclusion').value;
        const conclusion = testResult === 'pass' ? passConclusion : failConclusion;
        
        // Get certification text
        const certification = document.getElementById('certification').value;
        
        // Generate report ID and timestamp
        const reportId = generateReportId();
        const generatedTimestamp = new Date().toLocaleString();
        
        // Format test result display
        let resultDisplay = '';
        if (testResult === 'pass') {
            resultDisplay = '<span class="report-pass">PASS</span> - No leaks or pressure loss detected';
        } else {
            resultDisplay = '<span class="report-fail">FAIL</span> - Leaks or pressure loss detected';
        }
        
        // Clone the template
        const template = document.getElementById('reportTemplate').cloneNode(true);
        template.style.display = 'block';
        
        // Preload the logo to ensure it's visible
        const logoImg = template.querySelector('#companyLogo');
        if (logoImg) {
            logoImg.src = 'img/logo-wide.png';
            logoImg.style.display = 'block';
        }
        
        // Format test type for title
        const testTypeDisplay = formatTestType(testType);
        const titleText = testTypeDisplay 
            ? `${testTypeDisplay} Hydrostatic Test` 
            : 'Hydrostatic Test';
        
        // Update report title
        template.querySelector('#reportTestTypeTitle').textContent = titleText;
        
        // Populate the template with data
        template.querySelector('#reportDate').textContent = formatDate(testDate);
        template.querySelector('#reportCustomerName').textContent = customerName;
        template.querySelector('#reportCustomerEmail').textContent = customerEmail;
        template.querySelector('#reportCustomerPhone').textContent = customerPhone;
        template.querySelector('#reportCustomerCompany').textContent = customerCompany;
        
        // Format the address for display in the report
        // Since we're removing commas on input, we can just use the address as is
        const addressLines = testLocation.split('\n').filter(line => line.trim() !== '');
        if (addressLines.length > 0) {
            template.querySelector('#reportAddress').textContent = addressLines[0];
            if (addressLines.length > 1) {
                template.querySelector('#reportCityStateZip').textContent = addressLines.slice(1).join(' ');
            } else {
                template.querySelector('#reportCityStateZip').textContent = '';
            }
        } else {
            template.querySelector('#reportAddress').textContent = '';
            template.querySelector('#reportCityStateZip').textContent = '';
        }
        
        // Populate test type in details
        template.querySelector('#reportTestType').textContent = testTypeDisplay;
        
        template.querySelector('#reportTestDate').textContent = formatDate(testDate);
        template.querySelector('#reportTestDuration').textContent = testDuration;
        template.querySelector('#reportSystemTested').textContent = systemTested;
        template.querySelector('#reportTestMethod').textContent = testMethod;
        template.querySelector('#reportDescription').textContent = testDescription;
        
        // Handle pinpoint test details
        const pinpointDetails = template.querySelector('#pinpointTestDetails');
        if (testType === 'pinpoint-test') {
            pinpointDetails.style.display = 'block';
            template.querySelector('#reportPinpointLocation').textContent = pinpointLocation || 'N/A';
            template.querySelector('#reportPinpointMethod').textContent = pinpointMethod || 'N/A';
            template.querySelector('#reportPinpointFindings').textContent = pinpointFindings || 'N/A';
        } else {
            pinpointDetails.style.display = 'none';
        }
        
        template.querySelector('#reportResult').innerHTML = resultDisplay;
        template.querySelector('#reportConclusion').textContent = conclusion;
        template.querySelector('#reportNotes').textContent = testNotes;
        
        template.querySelector('#reportCertification').textContent = certification;
        
        // Clear previous preview and add the new one
        const previewContainer = document.getElementById('reportPreview');
        previewContainer.innerHTML = '';
        previewContainer.appendChild(template);
    }

    // Preview report button
    document.getElementById('previewReport').addEventListener('click', function() {
        if (!validateForm()) return;
        
        // Save customer data when previewing
        saveCustomerData();
        
        populateReportPreview();
        previewModal.show();
    });

    // Form validation
    function validateForm() {
        const form = document.getElementById('hydroTestForm');
        
        // Check required fields
        const customerName = document.getElementById('customerName').value;
        const testLocation = document.getElementById('testLocation').value;
        const testDate = document.getElementById('testDate').value;
        const testType = document.getElementById('testType').value;
        
        if (!customerName) {
            alert('Please enter a customer name');
            document.getElementById('customerName').focus();
            return false;
        }
        
        if (!testLocation) {
            alert('Please enter a test location');
            document.getElementById('testLocation').focus();
            return false;
        }
        
        if (!testDate) {
            alert('Please enter a test date');
            document.getElementById('testDate').focus();
            return false;
        }
        
        if (!testType) {
            alert('Please select a test type');
            // Focus on the first test type button
            const firstButton = document.querySelector('.test-type-btn');
            if (firstButton) {
                firstButton.focus();
            }
            return false;
        }
        
        return true;
    }

    // Generate PDF from preview modal
    document.getElementById('downloadPDF').addEventListener('click', function() {
        // Get the report data from the preview
        const reportData = {
            customerName: document.getElementById('reportCustomerName').textContent,
            testDate: document.getElementById('reportTestDate').textContent,
            // Add other fields as needed
        };
        
        generatePDF(reportData);
    });
    
    // Generate PDF function using HTML-to-Canvas-to-PDF approach
    function generatePDF(reportData) {
        // Get the report container element
        const reportElement = document.querySelector('#reportPreview .report-container');
        
        if (!reportElement) {
            console.error('Report element not found');
            return;
        }
        
        // Show a loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Generating PDF...';
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.background = 'rgba(0,0,0,0.7)';
        loadingIndicator.style.color = 'white';
        loadingIndicator.style.padding = '20px';
        loadingIndicator.style.borderRadius = '5px';
        loadingIndicator.style.zIndex = '9999';
        document.body.appendChild(loadingIndicator);
        
        // Create a clone of the report element to avoid modifying the original
        const clone = reportElement.cloneNode(true);
        
        // Create a wrapper with fixed dimensions
        const wrapper = document.createElement('div');
        wrapper.style.width = '8.5in';
        wrapper.style.height = '11in';
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '-9999px';
        wrapper.style.backgroundColor = '#ffffff';
        wrapper.style.padding = '0.5in';
        wrapper.style.boxSizing = 'border-box';
        wrapper.style.overflow = 'hidden';
        
        // Style the clone to fit properly in the fixed-size container
        clone.style.width = '100%';
        clone.style.height = 'auto';
        clone.style.position = 'relative';
        clone.style.margin = '0';
        clone.style.padding = '0';
        clone.style.transform = 'none';
        clone.style.boxShadow = 'none';
        
        // Add the clone to the wrapper and the wrapper to the document
        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);
        
        // Use html2canvas to capture the wrapper as an image
        html2canvas(wrapper, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            // Create PDF with jsPDF - using inches for US Letter size (8.5 x 11)
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter' // US Letter size (8.5 x 11 inches)
            });
            
            // Add the image to the PDF - maintaining aspect ratio without stretching
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, 8.5, 11);
            
            // Clean up - remove the temporary elements
            document.body.removeChild(wrapper);
            
            // Generate filename with customer name and date
            const customerName = reportData.customerName || 'Customer';
            const testDate = reportData.testDate || new Date().toLocaleDateString();
            const safeCustomerName = customerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const safeDate = testDate.replace(/[^0-9]/g, '-');
            const filename = `Click_Plumbing_Report_${safeCustomerName}_${safeDate}.pdf`;
            
            // Open the PDF in a new tab instead of downloading it
            const pdfOutput = pdf.output('blob');
            const pdfUrl = URL.createObjectURL(pdfOutput);
            
            // Open in new tab
            window.open(pdfUrl, '_blank');
            
            // Remove loading indicator
            document.body.removeChild(loadingIndicator);
        });
    }
    
    // Reset form button
    document.getElementById('resetForm').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
            document.getElementById('hydroTestForm').reset();
            document.getElementById('testDate').valueAsDate = new Date();
            // Hide pinpoint test content on reset
            document.getElementById('pinpointTestContent').style.display = 'none';
            // Remove active class from all test type buttons
            document.querySelectorAll('.test-type-btn').forEach(btn => btn.classList.remove('active'));
            // Clear test type value
            document.getElementById('testType').value = '';
        }
    });
    
    // Add event listener to the testLocation field to handle commas
    const testLocationField = document.getElementById('testLocation');
    testLocationField.addEventListener('input', function(e) {
        // Replace commas with spaces to prevent them from creating new lines
        const value = e.target.value;
        if (value.includes(',')) {
            e.target.value = value.replace(/,/g, ' ');
        }
    });
    
    // Handle test type selection - show/hide pinpoint test content
    const testTypeInput = document.getElementById('testType');
    const pinpointContent = document.getElementById('pinpointTestContent');
    const testTypeButtons = document.querySelectorAll('.test-type-btn');
    
    // Add click handlers to test type buttons
    testTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            testTypeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set the hidden input value
            const testType = this.getAttribute('data-test-type');
            testTypeInput.value = testType;
            
            // Show/hide pinpoint content based on selection
            if (testType === 'pinpoint-test') {
                pinpointContent.style.display = 'block';
            } else {
                pinpointContent.style.display = 'none';
                // Clear pinpoint fields when hidden
                document.getElementById('pinpointLocation').value = '';
                document.getElementById('pinpointMethod').value = '';
                document.getElementById('pinpointFindings').value = '';
            }
        });
    });
    
    // Generate invoice button
    document.getElementById('generateInvoice').addEventListener('click', function() {
        if (!validateForm()) return;
        
        // Save customer data when generating invoice
        saveCustomerData();
        
        generateInvoicePreview();
        invoiceModal.show();
    });
    
    // Download invoice PDF button
    document.getElementById('downloadInvoice').addEventListener('click', function() {
        generateInvoicePDF();
    });
    
    // Generate invoice preview with form data
    function generateInvoicePreview() {
        // Get form values
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerCompany = document.getElementById('customerCompany').value;
        
        const testLocation = document.getElementById('testLocation').value;
        const testType = document.getElementById('testType').value;
        const testDate = document.getElementById('testDate').value;
        const testDuration = document.getElementById('testDuration').value;
        const testDescription = document.getElementById('testDescription').value;
        const systemTested = document.getElementById('systemTested').value;
        
        // Generate invoice ID and date
        const invoiceId = 'INV-' + Date.now().toString().substring(6);
        const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        // Set fixed pricing
        const basePrice = 250;
        const total = basePrice;
        
        // Log calculation values for debugging
        console.log('Invoice calculation:', {
            basePrice,
            total
        });
        
        // Format currency
        const formatCurrency = (amount) => {
            return '$' + amount.toFixed(2);
        };
        
        // Clone the invoice template
        const template = document.getElementById('invoiceTemplate').cloneNode(true);
        template.style.display = 'block';
        
        // Populate the template with data
        template.querySelector('#invoiceDate').textContent = invoiceDate;
        template.querySelector('#invoiceNumber').textContent = invoiceId;
        
        // Update the to-address section with customer info
        const toAddressDiv = template.querySelector('.to-address');
        if (toAddressDiv) {
            // Clear existing content except the heading
            const heading = toAddressDiv.querySelector('h4');
            toAddressDiv.innerHTML = '';
            if (heading) {
                toAddressDiv.appendChild(heading);
            } else {
                const newHeading = document.createElement('h4');
                newHeading.textContent = 'Bill To:';
                toAddressDiv.appendChild(newHeading);
            }
            
            // Add customer name
            const namePara = document.createElement('p');
            const nameStrong = document.createElement('strong');
            nameStrong.textContent = customerName;
            namePara.appendChild(nameStrong);
            toAddressDiv.appendChild(namePara);
            
            // Add company if available
            if (customerCompany) {
                const companyPara = document.createElement('p');
                companyPara.textContent = customerCompany;
                toAddressDiv.appendChild(companyPara);
            }
            
            // Add address
            const addressLines = testLocation.split('\n').filter(line => line.trim() !== '');
            addressLines.forEach(line => {
                const addressPara = document.createElement('p');
                addressPara.textContent = line;
                toAddressDiv.appendChild(addressPara);
            });
        }
        
        // Parse address lines
        const addressLines = testLocation.split('\n').filter(line => line.trim() !== '');
        
        // Set service description with test type prefix
        let testTypePrefix = '';
        if (testType === 'pre-test') {
            testTypePrefix = 'Preleveling ';
        } else if (testType === 'post-test') {
            testTypePrefix = 'Postleveling ';
        } else if (testType === 'pinpoint-test') {
            testTypePrefix = 'Pinpoint ';
        }
        
        let serviceDesc = `${testTypePrefix}Hydrostatic Test: ${systemTested || 'Plumbing System'}`;
        if (testDescription) {
            serviceDesc += ` - ${testDescription}`;
        }
        
        // Add location to description
        if (addressLines && addressLines.length > 0) {
            serviceDesc += ` at ${addressLines[0]}`;
        }
        
        // Update invoice table
        const descriptionCell = template.querySelector('#invoiceDescription');
        if (descriptionCell) {
            descriptionCell.textContent = serviceDesc;
        }
        
        // Set price
        const unitPriceCell = template.querySelector('#invoiceUnitPrice');
        if (unitPriceCell) {
            unitPriceCell.textContent = formatCurrency(basePrice);
        }
        
        const amountCell = template.querySelector('#invoiceAmount');
        if (amountCell) {
            amountCell.textContent = formatCurrency(basePrice);
        }
        
        // Set total (same as base price)
        const totalCell = template.querySelector('#invoiceTotal');
        if (totalCell) {
            totalCell.textContent = formatCurrency(total);
        }
        
        // Clear previous invoice and add the new one
        const invoiceContainer = document.getElementById('invoicePreview');
        invoiceContainer.innerHTML = '';
        invoiceContainer.appendChild(template);
    }
    
    // Generate and download invoice PDF
    function generateInvoicePDF() {
        // Get the invoice container element
        const invoiceElement = document.querySelector('#invoicePreview .invoice-container');
        
        if (!invoiceElement) {
            console.error('Invoice element not found');
            return;
        }
        
        // Show a loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Generating PDF...';
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.background = 'rgba(0,0,0,0.7)';
        loadingIndicator.style.color = 'white';
        loadingIndicator.style.padding = '20px';
        loadingIndicator.style.borderRadius = '5px';
        loadingIndicator.style.zIndex = '9999';
        document.body.appendChild(loadingIndicator);
        
        // Create a clone of the invoice element to avoid modifying the original
        const clone = invoiceElement.cloneNode(true);
        
        // Create a wrapper with fixed dimensions
        const wrapper = document.createElement('div');
        wrapper.style.width = '8.5in';
        wrapper.style.height = '11in';
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '-9999px';
        wrapper.style.backgroundColor = '#ffffff';
        wrapper.style.padding = '0.5in';
        wrapper.style.boxSizing = 'border-box';
        wrapper.style.overflow = 'hidden';
        
        // Style the clone to fit properly in the fixed-size container
        clone.style.width = '100%';
        clone.style.height = 'auto';
        clone.style.position = 'relative';
        clone.style.margin = '0';
        clone.style.padding = '0';
        clone.style.transform = 'none';
        clone.style.boxShadow = 'none';
        
        // Add the clone to the wrapper and the wrapper to the document
        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);
        
        // Use html2canvas to capture the wrapper as an image
        html2canvas(wrapper, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            // Create PDF with jsPDF - using inches for US Letter size (8.5 x 11)
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter' // US Letter size (8.5 x 11 inches)
            });
            
            // Add the image to the PDF - maintaining aspect ratio without stretching
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, 8.5, 11);
            
            // Clean up - remove the temporary elements
            document.body.removeChild(wrapper);
            
            // Generate a filename with customer name and date
            const customerName = document.getElementById('customerName').value || 'customer';
            const testLocation = document.getElementById('testLocation').value || 'location';
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `Click_Plumbing_Invoice_${customerName.replace(/\s+/g, '_')}_${dateStr}.pdf`;
            
            // Open the PDF in a new tab instead of downloading it
            const pdfOutput = pdf.output('blob');
            const pdfUrl = URL.createObjectURL(pdfOutput);
            
            // Open in new tab
            window.open(pdfUrl, '_blank');
            
            // Remove the loading indicator
            document.body.removeChild(loadingIndicator);
        }).catch(error => {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
            document.body.removeChild(loadingIndicator);
        });
    }
});
