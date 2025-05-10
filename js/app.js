document.addEventListener('DOMContentLoaded', function() {
    // Initialize date field with current date
    const today = new Date();
    document.getElementById('testDate').valueAsDate = today;
    
    // Get current time (hours and minutes only)
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    document.getElementById('testTime').value = `${hours}:${minutes}`;
    
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
            document.getElementById('testAddress').value = customer.address || '';
            document.getElementById('testCity').value = customer.city || '';
            document.getElementById('testState').value = customer.state || '';
            document.getElementById('testZip').value = customer.zip || '';
        }
    });
    
    // Save customer data when form is submitted
    function saveCustomerData() {
        const customerName = document.getElementById('customerName').value;
        if (!customerName) return;
        
        const customerEmail = document.getElementById('customerEmail').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerCompany = document.getElementById('customerCompany').value;
        const testAddress = document.getElementById('testAddress').value;
        const testCity = document.getElementById('testCity').value;
        const testState = document.getElementById('testState').value;
        const testZip = document.getElementById('testZip').value;
        
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
    
    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Format date and time together
    function formatDateTime(dateString, timeString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        
        return `${formattedDate} at ${timeString}`;
    }

    // Populate report preview with form data
    function populateReportPreview() {
        // Get form values
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerCompany = document.getElementById('customerCompany').value;
        
        const testAddress = document.getElementById('testAddress').value;
        const testCity = document.getElementById('testCity').value;
        const testState = document.getElementById('testState').value;
        const testZip = document.getElementById('testZip').value;
        
        const testDate = document.getElementById('testDate').value;
        const testTime = document.getElementById('testTime').value;
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
        
        template.querySelector('#reportAddress').textContent = testAddress;
        template.querySelector('#reportCityStateZip').textContent = `${testCity}, ${testState} ${testZip}`;
        
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
        
        // Store report data in session storage
        const reportData = {
            reportId: reportId,
            generatedTimestamp: generatedTimestamp,
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            customerCompany: customerCompany,
            testAddress: testAddress,
            testCity: testCity,
            testState: testState,
            testZip: testZip,
            testDate: testDate,
            testTime: testTime,
            testDuration: testDuration,
            systemTested: systemTested,
            testMethod: testMethod,
            testDescription: testDescription,
            testResult: testResult,
            conclusion: conclusion,
            testNotes: testNotes,
            certification: certification
        };
        
        sessionStorage.setItem('currentReport', JSON.stringify(reportData));
        
        return reportData;
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
        const requiredFields = form.querySelectorAll('[required]');
        let valid = true;
        
        requiredFields.forEach(field => {
            if (!field.value) {
                field.classList.add('is-invalid');
                valid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        return valid;
    }

    // Note: Generate PDF button has been removed from the interface
    // PDF generation is now handled through the Download PDF button in the preview modal

    // Generate PDF from preview modal
    document.getElementById('downloadPDF').addEventListener('click', function() {
        const reportData = JSON.parse(sessionStorage.getItem('currentReport'));
        generatePDF(reportData);
    });

    // Generate invoice button
    document.getElementById('generateInvoice').addEventListener('click', function() {
        if (!validateForm()) return;

        // Save customer data when generating invoice
        saveCustomerData();

        generateInvoicePreview();
        invoiceModal.show();
    });

    // Download invoice PDF
    document.getElementById('downloadInvoice').addEventListener('click', function() {
        generateInvoicePDF();
    });

    // Generate invoice number
    function generateInvoiceNumber() {
        const timestamp = Date.now().toString();
        return 'INV-' + timestamp.substring(timestamp.length - 8);
    }

    // Populate invoice preview
    function generateInvoicePreview() {
        // Get form values
        const testAddress = document.getElementById('testAddress').value;
        const testCity = document.getElementById('testCity').value;
        const testState = document.getElementById('testState').value;
        const testZip = document.getElementById('testZip').value;
        const fullAddress = `${testAddress}, ${testCity}, ${testState} ${testZip}`;

        // Generate invoice number and date
        const invoiceNumber = generateInvoiceNumber();
        const invoiceDate = formatDate(new Date());

        // Clone the template
        const template = document.getElementById('invoiceTemplate').cloneNode(true);
        template.style.display = 'block';

        // Populate the template with data
        template.querySelector('#invoiceDate').textContent = invoiceDate;
        template.querySelector('#invoiceNumber').textContent = invoiceNumber;
        template.querySelector('#invoiceDescription').textContent = `Hydrostatic Test for ${fullAddress}`;

        // Store invoice data in session storage
        const invoiceData = {
            invoiceNumber: invoiceNumber,
            invoiceDate: invoiceDate,
            customerAddress: fullAddress,
            unitPrice: '$250.00',
            total: '$250.00'
        };

        sessionStorage.setItem('currentInvoice', JSON.stringify(invoiceData));

        // Clear previous preview and add the new one
        const previewContainer = document.getElementById('invoicePreview');
        previewContainer.innerHTML = '';
        previewContainer.appendChild(template);

        // Preload logo image to ensure it's in the browser cache
        const logoImg = new Image();
        logoImg.src = 'img/logo-wide.png';
        
        return invoiceData;
    }

    // Generate invoice PDF function using HTML-to-Canvas-to-PDF approach
    function generateInvoicePDF() {
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
        loadingIndicator.textContent = 'Generating invoice PDF...';
        document.body.appendChild(loadingIndicator);
        
        try {
            // Get the invoice element from the preview
            const invoiceElement = document.getElementById('invoicePreview');
            
            // Use html2canvas to convert the invoice to an image
            html2canvas(invoiceElement, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
                allowTaint: true
            }).then(canvas => {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                
                // Get invoice data for the filename
                const invoiceData = JSON.parse(sessionStorage.getItem('currentInvoice'));
                
                // Get the image data from the canvas
                const imgData = canvas.toDataURL('image/png');
                
                // Calculate dimensions to fit the page while maintaining aspect ratio
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                
                let imgWidth = pageWidth - 20; // 10mm margin on each side
                let imgHeight = imgWidth / ratio;
                
                // If the height is too large, scale it down
                if (imgHeight > pageHeight - 20) { // 10mm margin on top and bottom
                    imgHeight = pageHeight - 20;
                    imgWidth = imgHeight * ratio;
                }
                
                // Center the image on the page
                const x = (pageWidth - imgWidth) / 2;
                const y = 10; // 10mm from top
                
                // Add the image to the PDF
                pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
                
                // Save the PDF
                const fileName = `Click_Plumbing_Invoice_${invoiceData.invoiceNumber}.pdf`;
                pdf.save(fileName);
                
                // Remove loading indicator
                document.body.removeChild(loadingIndicator);
            }).catch(error => {
                console.error('Error generating invoice PDF:', error);
                alert('There was an error generating the invoice PDF. Please try again.');
                document.body.removeChild(loadingIndicator);
            });
        } catch (error) {
            console.error('Error in invoice PDF generation process:', error);
            alert('There was an error in the invoice PDF generation process. Please try again.');
            document.body.removeChild(loadingIndicator);
        }
    }
    
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
        loadingIndicator.textContent = 'Generating report PDF...';
        document.body.appendChild(loadingIndicator);
        
        try {
            // Get the report element from the preview
            const reportElement = document.getElementById('reportPreview');
            
            // Use html2canvas to convert the report to an image
            html2canvas(reportElement, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
                allowTaint: true
            }).then(canvas => {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                
                // Get the image data from the canvas
                const imgData = canvas.toDataURL('image/png');
                
                // Calculate dimensions to fit the page while maintaining aspect ratio
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                
                let imgWidth = pageWidth - 20; // 10mm margin on each side
                let imgHeight = imgWidth / ratio;
                
                // If the height is too large, scale it down
                if (imgHeight > pageHeight - 20) { // 10mm margin on top and bottom
                    imgHeight = pageHeight - 20;
                    imgWidth = imgHeight * ratio;
                }
                
                // Center the image on the page
                const x = (pageWidth - imgWidth) / 2;
                const y = 10; // 10mm from top
                
                // Add the image to the PDF
                pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
                
                // Save the PDF
                const fileName = `Click_Plumbing_Hydrostatic_Test_Report_${reportData.reportId}.pdf`;
                pdf.save(fileName);
                
                // Remove loading indicator
                document.body.removeChild(loadingIndicator);
            }).catch(error => {
                console.error('Error generating PDF:', error);
                alert('There was an error generating the PDF. Please try again.');
                document.body.removeChild(loadingIndicator);
            });
        } catch (error) {
            console.error('Error in PDF generation process:', error);
            alert('There was an error in the PDF generation process. Please try again.');
            document.body.removeChild(loadingIndicator);
        }
    }
    
    // Custom confirmation modal for reset form
    function showResetConfirmation() {
        // Create modal elements if they don't exist
        let resetModal = document.getElementById('resetConfirmModal');
        
        if (!resetModal) {
            resetModal = document.createElement('div');
            resetModal.id = 'resetConfirmModal';
            resetModal.className = 'modal fade';
            resetModal.setAttribute('tabindex', '-1');
            resetModal.setAttribute('aria-labelledby', 'resetConfirmModalLabel');
            resetModal.setAttribute('role', 'dialog');
            resetModal.setAttribute('aria-modal', 'true');
            
            resetModal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-warning">
                            <h5 class="modal-title" id="resetConfirmModalLabel">Confirm Reset</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-exclamation-triangle text-warning me-3" style="font-size: 2rem;"></i>
                                <p class="mb-0">Are you sure you want to reset the form?<br><strong>All entered data will be lost.</strong></p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirmResetBtn">Yes, Reset Form</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(resetModal);
            
            // Add event listener to the confirm button
            document.getElementById('confirmResetBtn').addEventListener('click', function() {
                // Reset the form
                document.getElementById('hydroTestForm').reset();
                
                // Reset date and time to current
                document.getElementById('testDate').valueAsDate = new Date();
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                document.getElementById('testTime').value = `${hours}:${minutes}`;
                
                // Clear any validation styling
                const invalidFields = document.querySelectorAll('.is-invalid');
                invalidFields.forEach(field => field.classList.remove('is-invalid'));
                
                // Hide the modal
                const resetModalInstance = bootstrap.Modal.getInstance(resetModal);
                resetModalInstance.hide();
            });
        }
        
        // Show the modal
        const resetModalInstance = new bootstrap.Modal(resetModal);
        resetModalInstance.show();
    }
    
    // Reset form button
    document.getElementById('resetForm').addEventListener('click', function() {
        showResetConfirmation();
    });
    
    // Check for saved report data
    const savedReport = sessionStorage.getItem('currentReport');
    if (savedReport) {
        const reportData = JSON.parse(savedReport);
        
        // Populate form fields with saved data
        document.getElementById('customerName').value = reportData.customerName || '';
        document.getElementById('customerEmail').value = reportData.customerEmail || '';
        document.getElementById('customerPhone').value = reportData.customerPhone || '';
        document.getElementById('customerCompany').value = reportData.customerCompany || '';
        
        document.getElementById('testAddress').value = reportData.testAddress || '';
        document.getElementById('testCity').value = reportData.testCity || '';
        document.getElementById('testState').value = reportData.testState || '';
        document.getElementById('testZip').value = reportData.testZip || '';
        
        document.getElementById('testDate').value = reportData.testDate || '';
        document.getElementById('testTime').value = reportData.testTime || '';
        document.getElementById('testDuration').value = reportData.testDuration || '';
        document.getElementById('testDescription').value = reportData.testDescription || '';
        
        // Set test result radio button
        if (reportData.testResult === 'pass') {
            document.getElementById('testPass').checked = true;
        } else {
            document.getElementById('testFail').checked = true;
        }
        
        document.getElementById('testNotes').value = reportData.testNotes || '';
    }
});
