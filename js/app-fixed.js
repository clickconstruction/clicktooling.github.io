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
    
    // Fix modal accessibility issues with aria-hidden
    function setupModalAccessibility(modalId) {
        const modalElement = document.getElementById(modalId);
        
        // Remove aria-hidden immediately when shown
        modalElement.addEventListener('shown.bs.modal', function() {
            this.removeAttribute('aria-hidden');
        });
        
        // Use MutationObserver to prevent aria-hidden from being added
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'aria-hidden' && 
                    modalElement.getAttribute('aria-hidden') === 'true' && 
                    modalElement.style.display === 'block') {
                    modalElement.removeAttribute('aria-hidden');
                }
            });
        });
        
        observer.observe(modalElement, { attributes: true });
        
        // Also handle when the modal is about to be shown
        modalElement.addEventListener('show.bs.modal', function() {
            setTimeout(() => {
                if (this.getAttribute('aria-hidden') === 'true') {
                    this.removeAttribute('aria-hidden');
                }
            }, 0);
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
    
    // Populate report preview with form data
    function populateReportPreview() {
        // Get form values
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerCompany = document.getElementById('customerCompany').value;
        
        const testLocation = document.getElementById('testLocation').value;
        
        const testDate = document.getElementById('testDate').value;
        const testDuration = document.getElementById('testDuration').value;
        const testDescription = document.getElementById('testDescription').value;
        const systemTested = document.getElementById('systemTested').value;
        const testMethod = document.getElementById('testMethod').value;
        
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
        
        template.querySelector('#reportTestDate').textContent = formatDate(testDate);
        template.querySelector('#reportTestDuration').textContent = testDuration;
        template.querySelector('#reportSystemTested').textContent = systemTested;
        template.querySelector('#reportTestMethod').textContent = testMethod;
        template.querySelector('#reportDescription').textContent = testDescription;
        
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
        // Create loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.padding = '20px';
        loadingIndicator.style.background = 'rgba(0,0,0,0.7)';
        loadingIndicator.style.color = 'white';
        loadingIndicator.style.borderRadius = '5px';
        loadingIndicator.style.zIndex = '9999';
        loadingIndicator.textContent = 'Generating PDF...';
        document.body.appendChild(loadingIndicator);
        
        // Get the report container
        const reportContainer = document.querySelector('#reportPreview .report-container');
        
        // Use html2canvas to capture the report as an image
        html2canvas(reportContainer, {
            scale: 2, // Higher scale for better quality
            useCORS: true, // Allow loading of images from other domains
            allowTaint: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'letter');
            
            // Calculate dimensions
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            
            // Calculate the scale to fit the canvas to the PDF
            const scale = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight) * 0.9;
            const scaledWidth = canvasWidth * scale;
            const scaledHeight = canvasHeight * scale;
            
            // Center the image on the page
            const x = (pdfWidth - scaledWidth) / 2;
            const y = (pdfHeight - scaledHeight) / 2;
            
            // Add the image to the PDF
            pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
            
            // Generate filename with customer name and date
            const customerName = reportData.customerName || 'Customer';
            const testDate = reportData.testDate || new Date().toLocaleDateString();
            const safeCustomerName = customerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const safeDate = testDate.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const filename = `Click_Plumbing_Report_${safeCustomerName}_${safeDate}.pdf`;
            
            // Save the PDF
            pdf.save(filename);
            
            // Remove loading indicator
            document.body.removeChild(loadingIndicator);
        });
    }
    
    // Reset form button
    document.getElementById('resetForm').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
            document.getElementById('hydroTestForm').reset();
            document.getElementById('testDate').valueAsDate = new Date();
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
    
    // Generate invoice button
    document.getElementById('generateInvoice').addEventListener('click', function() {
        if (!validateForm()) return;
        
        // Save customer data when generating invoice
        saveCustomerData();
        
        generateInvoicePreview();
        invoiceModal.show();
    });
});
