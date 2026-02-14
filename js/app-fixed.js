document.addEventListener('DOMContentLoaded', function() {
    // Initialize date field with current date
    const today = new Date();
    document.getElementById('testDate').valueAsDate = today;
    
    // Function to generate shareable URL with customer information
    function generateShareableURL() {
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerCompany = document.getElementById('customerCompany').value;
        const testLocation = document.getElementById('testLocation').value;
        
        // Only generate URL if we have at least customer name and location
        if (!customerName || !testLocation) {
            alert('Please fill in at least Customer Name and Test Location before sharing.');
            return;
        }
        
        // Create URL parameters
        const params = new URLSearchParams();
        params.set('name', customerName);
        if (customerEmail) params.set('email', customerEmail);
        if (customerPhone) params.set('phone', customerPhone);
        if (customerCompany) params.set('company', customerCompany);
        params.set('location', testLocation);
        
        // Get current URL without query parameters
        const baseURL = window.location.origin + window.location.pathname;
        const shareableURL = baseURL + '?' + params.toString();
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareableURL).then(function() {
            // Show success feedback
            const shareButton = document.getElementById('shareCustomerInfo');
            const originalText = shareButton.innerHTML;
            shareButton.innerHTML = '<i class="fas fa-check me-1"></i> Copied!';
            shareButton.classList.remove('btn-outline-light');
            shareButton.classList.add('btn-success');
            
            setTimeout(function() {
                shareButton.innerHTML = originalText;
                shareButton.classList.remove('btn-success');
                shareButton.classList.add('btn-outline-light');
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy URL:', err);
            // Fallback: show URL in a prompt
            prompt('Copy this URL to share:', shareableURL);
        });
    }
    
    // Function to parse URL parameters and fill form
    function loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Only fill if we have at least name and location
        if (urlParams.has('name') && urlParams.has('location')) {
            document.getElementById('customerName').value = urlParams.get('name') || '';
            document.getElementById('customerEmail').value = urlParams.get('email') || '';
            document.getElementById('customerPhone').value = urlParams.get('phone') || '';
            document.getElementById('customerCompany').value = urlParams.get('company') || '';
            document.getElementById('testLocation').value = urlParams.get('location') || '';
            
            // Handle pinpoint test fields if present
            if (urlParams.has('testType') && urlParams.get('testType') === 'pinpoint-test') {
                // Set the test type value first
                const testTypeInput = document.getElementById('testType');
                testTypeInput.value = 'pinpoint-test';
                
                // Get references to elements
                const pinpointButton = document.querySelector('.test-type-btn[data-test-type="pinpoint-test"]');
                const pinpointContent = document.getElementById('pinpointTestContent');
                const supplySewerContent = document.getElementById('supplySewerContent');
                const testResultsSection = document.getElementById('testResultsSection');
                
                if (pinpointButton) {
                    // Remove active from all test type buttons
                    document.querySelectorAll('.test-type-btn').forEach(btn => btn.classList.remove('active'));
                    // Add active class to pinpoint button
                    pinpointButton.classList.add('active');
                    
                    // Explicitly show/hide sections (same logic as button click handler)
                    if (pinpointContent) {
                        pinpointContent.style.display = 'block';
                    }
                    if (supplySewerContent) {
                        supplySewerContent.style.display = 'none';
                    }
                    if (testResultsSection) {
                        testResultsSection.style.display = 'none';
                    }
                    
                    // Hide test duration field for pinpoint tests
                    const testDurationField = document.getElementById('testDurationField');
                    const testDurationInput = document.getElementById('testDuration');
                    if (testDurationField) {
                        testDurationField.style.display = 'none';
                    }
                    if (testDurationInput) {
                        testDurationInput.removeAttribute('required');
                    }
                    
                    // Clear supply/sewer selection
                    document.getElementById('supplySewer').value = '';
                    document.querySelectorAll('.supply-sewer-btn').forEach(btn => {
                        btn.classList.remove('active');
                        btn.classList.remove('btn-warning');
                        btn.classList.add('btn-outline-warning');
                    });
                }
                
                // Fill pinpoint fields
                if (urlParams.has('pinpointLocation')) {
                    document.getElementById('pinpointLocation').value = urlParams.get('pinpointLocation') || '';
                }
                const pinpointMethodField = document.getElementById('pinpointMethod');
                if (urlParams.has('pinpointMethod')) {
                    pinpointMethodField.value = urlParams.get('pinpointMethod') || '';
                } else if (pinpointMethodField && !pinpointMethodField.value) {
                    // Pre-fill with default if not provided in URL and field is empty
                    pinpointMethodField.value = 'Camera / test ball / hydrostatic isolation testing';
                }
                if (urlParams.has('pinpointFindings')) {
                    document.getElementById('pinpointFindings').value = urlParams.get('pinpointFindings') || '';
                }
            }
            
            // Show a notification that form was pre-filled
            const notification = document.createElement('div');
            notification.className = 'alert alert-info alert-dismissible fade show mt-4';
            notification.innerHTML = '<i class="fas fa-info-circle me-2"></i>Form has been pre-filled from shared URL. <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
            const container = document.querySelector('.container');
            const firstRow = container.querySelector('.row');
            if (firstRow) {
                container.insertBefore(notification, firstRow);
            } else {
                container.insertBefore(notification, container.firstChild);
            }
            
            // Clean up URL to remove parameters (optional - keeps URL clean)
            // window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
    
    // Load form data from URL on page load
    loadFromURL();
    
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
    
    // Quick Fill functionality
    const quickFillInput = document.getElementById('quickFill');
    if (quickFillInput) {
        quickFillInput.addEventListener('paste', function(e) {
            // Allow the paste to complete, then process
            setTimeout(() => {
                processQuickFill(this.value);
            }, 10);
        });
        
        quickFillInput.addEventListener('blur', function() {
            if (this.value.trim()) {
                processQuickFill(this.value);
            }
        });
        
        // Also handle Enter key
        quickFillInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                processQuickFill(this.value);
            }
        });
    }
    
    function processQuickFill(inputText) {
        if (!inputText || !inputText.trim()) return;
        
        // Split by tabs first, then by multiple spaces
        let parts = inputText.split(/\t+/);
        if (parts.length === 1) {
            // Try splitting by multiple spaces (2 or more)
            parts = inputText.split(/\s{2,}/);
        }
        if (parts.length === 1) {
            // Try splitting by single space as last resort
            parts = inputText.split(/\s+/);
        }
        
        // Clean up parts
        parts = parts.map(p => p.trim()).filter(p => p.length > 0);
        
        if (parts.length === 0) return;
        
        let name = '';
        let address = '';
        let email = '';
        let phone = '';
        
        // Identify email (contains @)
        const emailIndex = parts.findIndex(p => p.includes('@'));
        if (emailIndex !== -1) {
            email = parts[emailIndex];
            parts.splice(emailIndex, 1);
        }
        
        // Identify phone (matches phone patterns: XXX-XXX-XXXX, (XXX) XXX-XXXX, XXX.XXX.XXXX, etc.)
        const phonePattern = /[\d\-\(\)\.\s]{10,}/;
        const phoneIndex = parts.findIndex(p => phonePattern.test(p) && p.replace(/\D/g, '').length >= 10);
        if (phoneIndex !== -1) {
            phone = parts[phoneIndex];
            parts.splice(phoneIndex, 1);
        }
        
        // Identify address (usually contains street indicators or is the longest remaining part)
        const addressIndicators = ['Dr', 'St', 'Ave', 'Rd', 'Blvd', 'Ln', 'Ct', 'Way', 'Pl', 'Cir', 'Pkwy'];
        const addressIndex = parts.findIndex(p => {
            const upperP = p.toUpperCase();
            return addressIndicators.some(indicator => upperP.includes(indicator.toUpperCase())) ||
                   (/\d/.test(p) && p.length > 15); // Has numbers and is long
        });
        
        if (addressIndex !== -1) {
            address = parts[addressIndex];
            parts.splice(addressIndex, 1);
        } else if (parts.length > 1) {
            // If no clear address indicator, assume the longest part is the address
            const longestIndex = parts.reduce((maxIdx, part, idx, arr) => 
                part.length > arr[maxIdx].length ? idx : maxIdx, 0
            );
            address = parts[longestIndex];
            parts.splice(longestIndex, 1);
        }
        
        // Remaining parts are the name
        name = parts.join(' ').trim();
        
        // Fill in the fields
        let fieldsFilled = 0;
        if (name) {
            document.getElementById('customerName').value = name;
            fieldsFilled++;
        }
        if (address) {
            document.getElementById('testLocation').value = address;
            fieldsFilled++;
        }
        if (email) {
            document.getElementById('customerEmail').value = email;
            fieldsFilled++;
        }
        if (phone) {
            document.getElementById('customerPhone').value = phone;
            fieldsFilled++;
        }
        
        // Show brief visual feedback
        if (fieldsFilled > 0 && quickFillInput) {
            quickFillInput.classList.add('border-success');
            setTimeout(() => {
                quickFillInput.classList.remove('border-success');
            }, 1000);
        }
        
        // Clear the quick fill input after processing
        if (quickFillInput) {
            quickFillInput.value = '';
        }
    }
    
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
    function formatTestType(testTypeValue, supplySewerValue) {
        const testTypeMap = {
            'pre-test': 'Pre-Test',
            'post-test': 'Post-Test',
            'pinpoint-test': 'Pinpoint Test',
            'gas-test': 'Gas Test'
        };
        
        let baseType = testTypeMap[testTypeValue] || '';
        
        // Add Supply or Sewer prefix for pre-test and post-test
        if ((testTypeValue === 'pre-test' || testTypeValue === 'post-test') && supplySewerValue) {
            const supplySewerMap = {
                'supply': 'Supply',
                'sewer': 'Sewer'
            };
            const prefix = supplySewerMap[supplySewerValue] || '';
            if (prefix) {
                return `${prefix} ${baseType}`;
            }
        }
        
        return baseType;
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
        const supplySewer = document.getElementById('supplySewer').value;
        const testDate = document.getElementById('testDate').value;
        const testDuration = document.getElementById('testDuration').value;
        const systemTested = document.getElementById('systemTested').value;
        const testMethod = document.getElementById('testMethod').value;
        
        // Get pinpoint test fields if applicable
        const pinpointLocation = document.getElementById('pinpointLocation').value;
        const pinpointMethod = document.getElementById('pinpointMethod').value;
        const pinpointFindings = document.getElementById('pinpointFindings').value;
        
        const testResult = document.getElementById('testResult').value;
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
            logoImg.src = 'img/logo.svg';
            logoImg.style.display = 'block';
        }
        
        // Format test type for title
        const testTypeDisplay = formatTestType(testType, supplySewer);
        let titleText;
        if (testType === 'pinpoint-test') {
            titleText = 'Pinpoint Test';
        } else if (testType === 'gas-test') {
            titleText = 'Gas Test';
        } else {
            titleText = testTypeDisplay 
                ? `${testTypeDisplay} Hydrostatic Test` 
                : 'Hydrostatic Test';
        }
        
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
        const testTypeForDetails = formatTestType(testType, supplySewer);
        template.querySelector('#reportTestType').textContent = testTypeForDetails;
        
        template.querySelector('#reportTestDate').textContent = formatDate(testDate);
        template.querySelector('#reportTestDuration').textContent = testDuration;
        
        // Update System Tested based on Supply/Sewer selection
        let systemTestedDisplay = systemTested;
        // Check if supply/sewer is selected and override the systemTested value
        if (supplySewer && supplySewer.trim() === 'supply') {
            systemTestedDisplay = 'Water supply lines and associated components.';
        } else if (supplySewer && supplySewer.trim() === 'sewer') {
            systemTestedDisplay = 'Underground sewer lines and associated components.';
        }
        // If no supply/sewer is selected, use the form value (for Pinpoint Test or if not selected)
        template.querySelector('#reportSystemTested').textContent = systemTestedDisplay;
        
        template.querySelector('#reportTestMethod').textContent = testMethod;
        
        // Handle pinpoint test details and gas test details
        const pinpointDetails = template.querySelector('#pinpointTestDetails');
        const gasTestReportDetails = template.querySelector('#gasTestReportDetails');
        const standardTestResults = template.querySelector('#reportStandardTestResultsSection');
        const pinpointTestResults = template.querySelector('#reportPinpointResultsSection');
        const systemTestedField = template.querySelector('#reportSystemTestedField');
        const testMethodField = template.querySelector('#reportTestMethodField');
        const testDurationField = template.querySelector('#reportTestDurationField');
        const testTypeField = template.querySelector('#reportTestTypeField');
        const testDateField = template.querySelector('#reportTestDateField');
        const dateBelowLocation = template.querySelector('#reportDateBelowLocation');
        
        if (testType === 'pinpoint-test') {
            if (standardTestResults) standardTestResults.style.display = 'none';
            if (gasTestReportDetails) gasTestReportDetails.style.display = 'none';
            if (pinpointTestResults) pinpointTestResults.style.display = 'none';
            // Show pinpoint details in Test Details section
            if (pinpointDetails) {
                pinpointDetails.style.display = 'block';
                template.querySelector('#reportPinpointLocation').textContent = pinpointLocation || 'N/A';
                template.querySelector('#reportPinpointMethod').textContent = pinpointMethod || 'N/A';
                template.querySelector('#reportPinpointFindings').textContent = pinpointFindings || 'N/A';
            }
            // Hide Test Type field (it's in the title)
            if (testTypeField) {
                testTypeField.style.display = 'none';
            }
            // Hide Date field in Test Details, show it below Test Location
            if (testDateField) {
                testDateField.style.display = 'none';
            }
            if (dateBelowLocation) {
                dateBelowLocation.style.display = 'block';
                template.querySelector('#reportTestDateBelowLocation').textContent = formatDate(testDate);
            }
            // Hide System Tested, Test Method, Description, and Test Duration for pinpoint tests
            if (systemTestedField) {
                systemTestedField.style.display = 'none';
            }
            if (testMethodField) {
                testMethodField.style.display = 'none';
            }
            if (testDurationField) {
                testDurationField.style.display = 'none';
            }
        } else if (testType === 'gas-test') {
            if (standardTestResults) standardTestResults.style.display = 'none';
            if (pinpointTestResults) pinpointTestResults.style.display = 'none';
            if (pinpointDetails) pinpointDetails.style.display = 'none';
            if (gasTestReportDetails) {
                gasTestReportDetails.style.display = 'block';
                const psiVal = document.getElementById('gasTestPressurePsi')?.value;
                const inWCVal = document.getElementById('gasTestPressureInWC')?.value;
                const ozVal = document.getElementById('gasTestPressureOz')?.value;
                const mmVal = document.getElementById('gasTestPressureMmWC')?.value;
                const hasPressure = (psiVal && parseFloat(psiVal) > 0) || (inWCVal && parseFloat(inWCVal) > 0) ||
                    (ozVal && parseFloat(ozVal) > 0) || (mmVal && parseFloat(mmVal) > 0);
                const pressureSection = template.querySelector('#reportGasPressureSection');
                if (hasPressure) {
                    pressureSection.style.display = '';
                    const pressureText = `PSI: ${psiVal || '—'}, in WC: ${inWCVal || '—'}, oz/in²: ${ozVal || '—'}, mm WC: ${mmVal || '—'}`;
                    template.querySelector('#reportGasPressure').textContent = pressureText;
                } else {
                    pressureSection.style.display = 'none';
                }
                const container = document.getElementById('gasTestFixturesList');
                const fixtureRows = container ? container.querySelectorAll('.gas-test-fixture-row') : [];
                let fixtureHtml = '';
                let totalBtu = 0;
                fixtureRows.forEach(row => {
                    const name = row.querySelector('.gas-test-fixture-name')?.value?.trim();
                    const btu = parseBtuValue(row.querySelector('.gas-test-btu-input')?.value);
                    if (name || btu > 0) {
                        fixtureHtml += `<div>${name || '—'}: ${btu > 0 ? btu.toLocaleString() : '—'} BTU/hr</div>`;
                        if (btu > 0) totalBtu += btu;
                    }
                });
                const fixturesSection = template.querySelector('#reportGasFixturesSection');
                if (fixtureHtml || totalBtu > 0) {
                    fixturesSection.style.display = '';
                    template.querySelector('#reportGasFixtures').innerHTML = fixtureHtml;
                    template.querySelector('#reportGasTotalBtu').textContent = totalBtu.toLocaleString();
                } else {
                    fixturesSection.style.display = 'none';
                }
                if (!hasPressure && !fixtureHtml && totalBtu === 0) {
                    gasTestReportDetails.style.display = 'none';
                }
            }
            if (testTypeField) testTypeField.style.display = 'none';
            if (testDateField) testDateField.style.display = 'none';
            if (dateBelowLocation) {
                dateBelowLocation.style.display = 'block';
                template.querySelector('#reportTestDateBelowLocation').textContent = formatDate(testDate);
            }
            if (systemTestedField) systemTestedField.style.display = 'none';
            if (testMethodField) testMethodField.style.display = 'none';
            if (testDurationField) testDurationField.style.display = 'none';
        } else {
            // Show standard test results section
            if (standardTestResults) {
                standardTestResults.style.display = 'block';
            }
            if (gasTestReportDetails) gasTestReportDetails.style.display = 'none';
            // Hide pinpoint test results section
            if (pinpointTestResults) {
                pinpointTestResults.style.display = 'none';
            }
            // Hide pinpoint details in Test Details section
            if (pinpointDetails) {
                pinpointDetails.style.display = 'none';
            }
            // Show Test Type field for non-pinpoint tests
            if (testTypeField) {
                testTypeField.style.display = 'block';
            }
            // Show Date field in Test Details, hide it below Test Location
            if (testDateField) {
                testDateField.style.display = 'block';
            }
            if (dateBelowLocation) {
                dateBelowLocation.style.display = 'none';
            }
            // Show System Tested, Test Method, Description, and Test Duration for non-pinpoint tests
            if (systemTestedField) {
                systemTestedField.style.display = 'block';
            }
            if (testMethodField) {
                testMethodField.style.display = 'block';
            }
            if (testDurationField) {
                testDurationField.style.display = 'block';
            }
            template.querySelector('#reportResult').innerHTML = resultDisplay;
            template.querySelector('#reportConclusion').textContent = conclusion;
            template.querySelector('#reportNotes').textContent = testNotes;
        }
        
        // Set certification text based on test type
        let certificationText = certification;
        if (testType === 'pinpoint-test') {
            certificationText = "I hereby certify that the Pinpoint Test was performed according to industry standards and local code requirements. Click Plumbing's scope is limited to the plumbing system. Any opinions regarding the effect of leaks on foundation performance or structural settlement are deferred to the contracting group. All reports only represent measurements taken at this time.\n\nMalachi Whites (#RMP41130)\nClick Plumbing\nOffice: (512) 360-0599\nMail: 5501 Balcones Dr A141 Austin TX 78731\nTSBPE: 929 East 41st St Austin TX 78751";
        } else if (testType === 'gas-test') {
            certificationText = "I hereby certify that the Gas Test was performed according to industry standards and local code requirements. All reports only represent measurements taken at this time.\n\nMalachi Whites (#RMP41130)\nClick Plumbing\nOffice: (512) 360-0599\nMail: 5501 Balcones Dr A141 Austin TX 78731\nTSBPE: 929 East 41st St Austin TX 78751";
        }
        template.querySelector('#reportCertification').textContent = certificationText;
        
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
        
        // Only require test result for pre-test and post-test (not pinpoint or gas-test)
        if (testType !== 'pinpoint-test' && testType !== 'gas-test') {
            const testResult = document.getElementById('testResult').value;
            if (!testResult) {
                alert('Please select a test result (PASS or FAIL)');
                const firstResultButton = document.querySelector('.test-result-btn');
                if (firstResultButton) firstResultButton.focus();
                return false;
            }
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
            // Hide gas test content on reset
            const gasTestContentEl = document.getElementById('gasTestContent');
            if (gasTestContentEl) gasTestContentEl.style.display = 'none';
            // Hide supply/sewer content on reset
            document.getElementById('supplySewerContent').style.display = 'none';
            // Show Test Results section on reset
            const testResultsSection = document.getElementById('testResultsSection');
            if (testResultsSection) {
                testResultsSection.style.display = 'block';
            }
            // Show test duration field on reset
            const testDurationField = document.getElementById('testDurationField');
            if (testDurationField) {
                testDurationField.style.display = 'block';
            }
            // Remove active class from all test type buttons
            document.querySelectorAll('.test-type-btn').forEach(btn => btn.classList.remove('active'));
            // Clear test type value
            document.getElementById('testType').value = '';
            // Clear supply/sewer selection
            document.getElementById('supplySewer').value = '';
            document.querySelectorAll('.supply-sewer-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.classList.remove('btn-warning');
                btn.classList.add('btn-outline-warning');
            });
            // Reset duration buttons - set 60 as active (default value)
            document.querySelectorAll('.duration-btn').forEach(btn => btn.classList.remove('active'));
            const defaultDurationBtn = document.querySelector('.duration-btn[data-duration="60"]');
            if (defaultDurationBtn) {
                defaultDurationBtn.classList.add('active');
            }
            // Reset date buttons - set today as active (default value)
            document.querySelectorAll('.date-btn').forEach(btn => btn.classList.remove('active'));
            const todayDateBtn = document.querySelector('.date-btn[data-date="today"]');
            if (todayDateBtn) {
                todayDateBtn.classList.add('active');
            }
            // Reset test result buttons - clear selection
            document.querySelectorAll('.test-result-btn').forEach(btn => {
                btn.classList.remove('active', 'btn-success', 'btn-danger');
                const result = btn.getAttribute('data-test-result');
                if (result === 'pass') {
                    btn.classList.add('btn-outline-success');
                } else {
                    btn.classList.add('btn-outline-danger');
                }
            });
            document.getElementById('testResult').value = '';
            // Reset gas test fields (pressure + fixtures)
            if (typeof resetGasTestFields === 'function') {
                resetGasTestFields();
            }
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
    
    // Handle test result buttons
    const testResultInput = document.getElementById('testResult');
    const testResultButtons = document.querySelectorAll('.test-result-btn');
    
    // Add click handlers to test result buttons
    testResultButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all result buttons
            testResultButtons.forEach(btn => {
                btn.classList.remove('active');
                // Remove success/danger classes and add outline versions
                btn.classList.remove('btn-success', 'btn-danger');
                if (btn.getAttribute('data-test-result') === 'pass') {
                    btn.classList.add('btn-outline-success');
                } else {
                    btn.classList.add('btn-outline-danger');
                }
            });
            
            // Add active class to clicked button and update styling
            this.classList.add('active');
            const result = this.getAttribute('data-test-result');
            if (result === 'pass') {
                this.classList.remove('btn-outline-success');
                this.classList.add('btn-success');
            } else {
                this.classList.remove('btn-outline-danger');
                this.classList.add('btn-danger');
            }
            
            // Set the hidden input value
            testResultInput.value = result;
        });
    });
    
    // Handle test type selection - show/hide pinpoint test content, gas test content, and supply/sewer buttons
    const testTypeInput = document.getElementById('testType');
    const pinpointContent = document.getElementById('pinpointTestContent');
    const gasTestContent = document.getElementById('gasTestContent');
    const supplySewerContent = document.getElementById('supplySewerContent');
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
            
            // Show/hide content based on selection
            const testResultsSection = document.getElementById('testResultsSection');
            const testDurationField = document.getElementById('testDurationField');
            const testDurationInput = document.getElementById('testDuration');
            
            if (testType === 'pinpoint-test') {
                pinpointContent.style.display = 'block';
                if (gasTestContent) gasTestContent.style.display = 'none';
                supplySewerContent.style.display = 'none';
                const pinpointMethodField = document.getElementById('pinpointMethod');
                if (pinpointMethodField) {
                    pinpointMethodField.value = 'Camera / test ball / hydrostatic isolation testing';
                }
                if (testResultsSection) testResultsSection.style.display = 'none';
                if (testDurationField) testDurationField.style.display = 'none';
                if (testDurationInput) testDurationInput.removeAttribute('required');
                document.getElementById('supplySewer').value = '';
                document.querySelectorAll('.supply-sewer-btn').forEach(btn => {
                    btn.classList.remove('active');
                    btn.classList.remove('btn-warning');
                    btn.classList.add('btn-outline-warning');
                });
            } else if (testType === 'gas-test') {
                pinpointContent.style.display = 'none';
                if (gasTestContent) gasTestContent.style.display = 'block';
                supplySewerContent.style.display = 'none';
                if (testResultsSection) testResultsSection.style.display = 'none';
                if (testDurationField) testDurationField.style.display = 'none';
                if (testDurationInput) testDurationInput.removeAttribute('required');
                document.getElementById('supplySewer').value = '';
                document.querySelectorAll('.supply-sewer-btn').forEach(btn => {
                    btn.classList.remove('active');
                    btn.classList.remove('btn-warning');
                    btn.classList.add('btn-outline-warning');
                });
            } else {
                pinpointContent.style.display = 'none';
                if (gasTestContent) gasTestContent.style.display = 'none';
                if (testResultsSection) testResultsSection.style.display = 'block';
                if (testDurationField) testDurationField.style.display = 'block';
                if (testDurationInput) testDurationInput.setAttribute('required', 'required');
                document.getElementById('pinpointLocation').value = '';
                document.getElementById('pinpointMethod').value = '';
                document.getElementById('pinpointFindings').value = '';
                
                if (testType === 'pre-test' || testType === 'post-test') {
                    supplySewerContent.style.display = 'block';
                    const sewerButton = document.querySelector('.supply-sewer-btn[data-supply-sewer="sewer"]');
                    if (sewerButton && !supplySewerInput.value) {
                        sewerButton.click();
                    }
                } else {
                    supplySewerContent.style.display = 'none';
                    document.getElementById('supplySewer').value = '';
                    document.querySelectorAll('.supply-sewer-btn').forEach(btn => {
                        btn.classList.remove('active');
                        btn.classList.remove('btn-warning');
                        btn.classList.add('btn-outline-warning');
                    });
                }
            }
        });
    });
    
    // Handle Supply/Sewer buttons
    const supplySewerInput = document.getElementById('supplySewer');
    const supplySewerButtons = document.querySelectorAll('.supply-sewer-btn');
    
    supplySewerButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            supplySewerButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.remove('btn-warning');
                btn.classList.add('btn-outline-warning');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            this.classList.remove('btn-outline-warning');
            this.classList.add('btn-warning');
            
            // Set the hidden input value
            const supplySewer = this.getAttribute('data-supply-sewer');
            supplySewerInput.value = supplySewer;
        });
    });
    
    // Gas Test: House Pressure conversion constants (PSI as base)
    const PSI_TO_OZ = 16;
    const PSI_TO_IN_WC = 27.679904842545;
    const PSI_TO_MM_WC = 703.06957829636;
    
    function gasTestPressureFromPsi(psi) {
        if (psi < 0 || isNaN(psi)) return null;
        return {
            psi: Math.round(psi),
            inWC: Math.round(psi * PSI_TO_IN_WC),
            oz: Math.round(psi * PSI_TO_OZ),
            mmWC: Math.round(psi * PSI_TO_MM_WC)
        };
    }
    
    function setupGasTestPressureHandlers() {
        const psiInput = document.getElementById('gasTestPressurePsi');
        const inWCInput = document.getElementById('gasTestPressureInWC');
        const ozInput = document.getElementById('gasTestPressureOz');
        const mmWCInput = document.getElementById('gasTestPressureMmWC');
        const resetBtn = document.getElementById('gasTestPressureReset');
        const fields = [psiInput, inWCInput, ozInput, mmWCInput];
        
        function unlockAll() {
            fields.forEach(f => {
                if (f) {
                    f.readOnly = false;
                    f.removeAttribute('readonly');
                    f.classList.remove('gas-test-pressure-locked');
                }
            });
            if (resetBtn) resetBtn.classList.remove('gas-test-reset-active');
        }
        
        function lockOthers(exceptField) {
            fields.forEach(f => {
                if (f && f !== exceptField) {
                    f.readOnly = true;
                    f.setAttribute('readonly', 'readonly');
                    f.classList.add('gas-test-pressure-locked');
                }
            });
            if (resetBtn) resetBtn.classList.add('gas-test-reset-active');
        }
        
        function handlePressureInput(sourceField, valueToPsi) {
            const val = parseFloat(sourceField.value);
            if (isNaN(val) || val < 0) return;
            const psi = valueToPsi(val);
            if (psi < 0) return;
            const converted = gasTestPressureFromPsi(psi);
            if (!converted) return;
            psiInput.value = converted.psi;
            inWCInput.value = converted.inWC;
            ozInput.value = converted.oz;
            mmWCInput.value = converted.mmWC;
            lockOthers(sourceField);
        }
        
        if (psiInput) {
            psiInput.addEventListener('input', function() {
                const val = parseFloat(this.value);
                if (isNaN(val) || val < 0) return unlockAll();
                handlePressureInput(psiInput, v => v);
            });
        }
        if (inWCInput) {
            inWCInput.addEventListener('input', function() {
                const val = parseFloat(this.value);
                if (isNaN(val) || val < 0) return unlockAll();
                handlePressureInput(inWCInput, v => v / PSI_TO_IN_WC);
            });
        }
        if (ozInput) {
            ozInput.addEventListener('input', function() {
                const val = parseFloat(this.value);
                if (isNaN(val) || val < 0) return unlockAll();
                handlePressureInput(ozInput, v => v / PSI_TO_OZ);
            });
        }
        if (mmWCInput) {
            mmWCInput.addEventListener('input', function() {
                const val = parseFloat(this.value);
                if (isNaN(val) || val < 0) return unlockAll();
                handlePressureInput(mmWCInput, v => v / PSI_TO_MM_WC);
            });
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                unlockAll();
                fields.forEach(f => { if (f) f.value = ''; });
                if (psiInput) psiInput.focus();
            });
        }
    }
    
    function parseBtuValue(val) {
        if (!val) return 0;
        const cleaned = String(val).replace(/,/g, '');
        return parseInt(cleaned, 10) || 0;
    }
    
    function formatBtuValue(val) {
        const num = parseBtuValue(val);
        return num > 0 ? num.toLocaleString() : '';
    }
    
    function updateGasTestTotalBtu() {
        const container = document.getElementById('gasTestFixturesList');
        const totalEl = document.getElementById('gasTestTotalBtu');
        if (!container || !totalEl) return;
        const btuInputs = container.querySelectorAll('.gas-test-btu-input');
        let total = 0;
        btuInputs.forEach(inp => {
            const v = parseBtuValue(inp.value);
            if (v > 0) total += v;
        });
        totalEl.textContent = total.toLocaleString();
    }
    
    function addGasTestFixture(name = '', btu = '') {
        const container = document.getElementById('gasTestFixturesList');
        if (!container) return;
        const row = document.createElement('div');
        row.className = 'gas-test-fixture-row row g-2 mb-2 align-items-end';
        const safeName = String(name).replace(/"/g, '&quot;');
        const safeBtu = String(btu).replace(/"/g, '&quot;');
        row.innerHTML = `
            <div class="col-md-6">
                <label class="form-label small">Fixture Name</label>
                <input type="text" class="form-control form-control-sm gas-test-fixture-name" list="gasTestFixtureSuggestions" placeholder="e.g. Furnace" value="${safeName}">
            </div>
            <div class="col-md-4">
                <label class="form-label small">BTU/hr</label>
                <div class="d-flex gap-2 align-items-center">
                    <input type="text" class="form-control form-control-sm gas-test-btu-input" inputmode="numeric" placeholder="e.g. 100,000" value="${safeBtu ? (parseInt(safeBtu, 10) || 0).toLocaleString() : ''}">
                    <button type="button" class="btn btn-sm btn-outline-secondary gas-test-btu-multiply" title="Multiply BTU by 1,000">[x1,000]</button>
                </div>
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-sm btn-outline-danger remove-gas-fixture" title="Remove fixture"><i class="fas fa-trash"></i></button>
            </div>
        `;
        const btuInputEl = row.querySelector('.gas-test-btu-input');
        btuInputEl.addEventListener('input', function() {
            const formatted = formatBtuValue(this.value);
            this.value = formatted;
            this.setSelectionRange(formatted.length, formatted.length);
            updateGasTestTotalBtu();
        });
        btuInputEl.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const v = parseBtuValue(this.value) + 5000;
                this.value = v > 0 ? v.toLocaleString() : '';
                updateGasTestTotalBtu();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const v = Math.max(0, parseBtuValue(this.value) - 5000);
                this.value = v > 0 ? v.toLocaleString() : '';
                updateGasTestTotalBtu();
            }
        });
        row.querySelector('.gas-test-btu-multiply').addEventListener('click', function() {
            const btuInput = row.querySelector('.gas-test-btu-input');
            const current = parseBtuValue(btuInput.value);
            btuInput.value = (current * 1000).toLocaleString();
            updateGasTestTotalBtu();
        });
        row.querySelector('.remove-gas-fixture').addEventListener('click', function() {
            row.remove();
            updateGasTestTotalBtu();
        });
        container.appendChild(row);
        updateGasTestTotalBtu();
    }
    
    function resetGasTestFields() {
        const psiInput = document.getElementById('gasTestPressurePsi');
        const inWCInput = document.getElementById('gasTestPressureInWC');
        const ozInput = document.getElementById('gasTestPressureOz');
        const mmWCInput = document.getElementById('gasTestPressureMmWC');
        [psiInput, inWCInput, ozInput, mmWCInput].forEach(f => {
            if (f) {
                f.value = '';
                f.readOnly = false;
                f.removeAttribute('readonly');
            }
        });
        const container = document.getElementById('gasTestFixturesList');
        if (container) {
            container.innerHTML = '';
            addGasTestFixture();
        }
        updateGasTestTotalBtu();
    }
    
    const gasTestAddBtn = document.getElementById('gasTestAddFixture');
    if (gasTestAddBtn) {
        gasTestAddBtn.addEventListener('click', function() {
            addGasTestFixture();
        });
    }
    
    document.querySelectorAll('.gas-test-fixture-quick-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const fixtureName = this.getAttribute('data-fixture');
            const container = document.getElementById('gasTestFixturesList');
            if (!container) return;
            const rows = container.querySelectorAll('.gas-test-fixture-row');
            let targetRow = null;
            for (const row of rows) {
                const nameInput = row.querySelector('.gas-test-fixture-name');
                if (nameInput && !nameInput.value.trim()) {
                    targetRow = row;
                    break;
                }
            }
            if (!targetRow) {
                addGasTestFixture(fixtureName, '');
                const newRows = container.querySelectorAll('.gas-test-fixture-row');
                targetRow = newRows[newRows.length - 1];
            } else {
                targetRow.querySelector('.gas-test-fixture-name').value = fixtureName;
            }
            const btuInput = targetRow.querySelector('.gas-test-btu-input');
            if (btuInput) btuInput.focus();
        });
    });
    
    setupGasTestPressureHandlers();
    addGasTestFixture();
    
    // Handle duration quick-fill buttons
    const durationButtons = document.querySelectorAll('.duration-btn');
    const testDurationInput = document.getElementById('testDuration');
    
    // Update active state when input value changes manually
    testDurationInput.addEventListener('input', function() {
        const value = parseInt(this.value);
        durationButtons.forEach(btn => {
            if (parseInt(btn.getAttribute('data-duration')) === value) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    });
    
    // Add click handlers to duration buttons
    durationButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all duration buttons
            durationButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set the duration value
            const duration = this.getAttribute('data-duration');
            testDurationInput.value = duration;
        });
    });
    
    // Handle date quick-fill buttons
    const dateButtons = document.querySelectorAll('.date-btn');
    const testDateInput = document.getElementById('testDate');
    
    // Helper function to format date as YYYY-MM-DD
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Helper function to check if a date is today or yesterday
    function checkDateMatch(inputDate) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const input = new Date(inputDate);
        
        // Compare dates (ignoring time)
        const isToday = input.getFullYear() === today.getFullYear() &&
                       input.getMonth() === today.getMonth() &&
                       input.getDate() === today.getDate();
        
        const isYesterday = input.getFullYear() === yesterday.getFullYear() &&
                           input.getMonth() === yesterday.getMonth() &&
                           input.getDate() === yesterday.getDate();
        
        return { isToday, isYesterday };
    }
    
    
    // Add click handlers to date buttons
    dateButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all date buttons
            dateButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set the date value
            const dateType = this.getAttribute('data-date');
            const today = new Date();
            
            if (dateType === 'today') {
                testDateInput.valueAsDate = today;
            } else if (dateType === 'yesterday') {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                testDateInput.valueAsDate = yesterday;
            }
        });
    });
    
    // Initialize date button active state on page load
    // Always set "Today" button as active on page load (date field defaults to today)
    // This runs after the date field is initialized to today
    function initializeDateButton() {
        dateButtons.forEach(btn => btn.classList.remove('active'));
        const todayDateBtn = document.querySelector('.date-btn[data-date="today"]');
        if (todayDateBtn) {
            todayDateBtn.classList.add('active');
        }
    }
    
    // Initialize on page load - always default to "Today"
    initializeDateButton();
    
    // Update button state when date changes manually
    testDateInput.addEventListener('change', function() {
        const dateMatch = checkDateMatch(this.value);
        dateButtons.forEach(btn => btn.classList.remove('active'));
        
        if (dateMatch.isToday) {
            const todayDateBtn = document.querySelector('.date-btn[data-date="today"]');
            if (todayDateBtn) {
                todayDateBtn.classList.add('active');
            }
        } else if (dateMatch.isYesterday) {
            const yesterdayDateBtn = document.querySelector('.date-btn[data-date="yesterday"]');
            if (yesterdayDateBtn) {
                yesterdayDateBtn.classList.add('active');
            }
        }
    });
    
    // Share customer info button
    document.getElementById('shareCustomerInfo').addEventListener('click', function() {
        generateShareableURL();
    });
    
    // Function to generate shareable URL with pinpoint test information
    function generatePinpointShareableURL() {
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerCompany = document.getElementById('customerCompany').value;
        const testLocation = document.getElementById('testLocation').value;
        const testType = document.getElementById('testType').value;
        const pinpointLocation = document.getElementById('pinpointLocation').value;
        const pinpointMethod = document.getElementById('pinpointMethod').value;
        const pinpointFindings = document.getElementById('pinpointFindings').value;
        
        // Only generate URL if we have at least customer name, location, and test type is pinpoint
        if (!customerName || !testLocation) {
            alert('Please fill in at least Customer Name and Test Location before sharing.');
            return;
        }
        
        if (testType !== 'pinpoint-test') {
            alert('Please select Pinpoint Test before sharing pinpoint information.');
            return;
        }
        
        // Create URL parameters
        const params = new URLSearchParams();
        params.set('name', customerName);
        if (customerEmail) params.set('email', customerEmail);
        if (customerPhone) params.set('phone', customerPhone);
        if (customerCompany) params.set('company', customerCompany);
        params.set('location', testLocation);
        params.set('testType', 'pinpoint-test');
        if (pinpointLocation) params.set('pinpointLocation', pinpointLocation);
        if (pinpointMethod) params.set('pinpointMethod', pinpointMethod);
        if (pinpointFindings) params.set('pinpointFindings', pinpointFindings);
        
        // Get current URL without query parameters
        const baseURL = window.location.origin + window.location.pathname;
        const shareableURL = baseURL + '?' + params.toString();
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareableURL).then(function() {
            // Show success feedback
            const shareButton = document.getElementById('sharePinpointInfo');
            const originalText = shareButton.innerHTML;
            shareButton.innerHTML = '<i class="fas fa-check me-1"></i> Copied!';
            shareButton.classList.remove('btn-outline-light');
            shareButton.classList.add('btn-success');
            
            setTimeout(function() {
                shareButton.innerHTML = originalText;
                shareButton.classList.remove('btn-success');
                shareButton.classList.add('btn-outline-light');
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy URL:', err);
            // Fallback: show URL in a prompt
            prompt('Copy this URL to share:', shareableURL);
        });
    }
    
    // Share pinpoint info button
    document.getElementById('sharePinpointInfo').addEventListener('click', function() {
        generatePinpointShareableURL();
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
        const supplySewer = document.getElementById('supplySewer').value;
        const testDate = document.getElementById('testDate').value;
        const testDuration = document.getElementById('testDuration').value;
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
        // Format test type for invoice (includes Supply/Sewer for pre-test and post-test)
        const formattedTestType = formatTestType(testType, supplySewer);
        let testTypePrefix = '';
        
        if (formattedTestType.includes('Pre-Test')) {
            testTypePrefix = 'Preleveling ';
        } else if (formattedTestType.includes('Post-Test')) {
            testTypePrefix = 'Postleveling ';
        } else if (testType === 'pinpoint-test') {
            testTypePrefix = 'Pinpoint ';
        } else if (testType === 'gas-test') {
            testTypePrefix = 'Gas ';
        }
        
        let serviceDesc = testType === 'gas-test' ? 'Gas Test' : `${testTypePrefix}Hydrostatic Test`;
        
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
