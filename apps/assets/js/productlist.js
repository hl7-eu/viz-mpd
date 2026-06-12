var dataTableInitialized = false; // Flag to track DataTable initialization
var t; // DataTable instance
var appBaseUrl = "";

// Function to initialize or reinitialize the DataTable
function initializeDataTable() {
  // if (dataTableInitialized) {
  //   // Destroy the DataTable if it has been initialized
  //   if (t) {
  //     t.destroy();
  //   }
  // }
  if ($.fn.dataTable.isDataTable('#prod-table')) {
    t = $('#prod-table').DataTable();
  } else {
    // The table has not been initialized as DataTable yet
    // You can initialize it here if you want to
  }
  // // Initialize DataTable
  // // t = $('#prod-table').DataTable({
  // //   // DataTable configuration options
  // // });

  // dataTableInitialized = true; // Set the flag to true
}

// Function to clear validation labels
function clearValidationLabels() {
  $('#prod-table').find('.validation-label').html('');
}

// Function to populate validation labels
function populateValidationLabels(resourceId, validationData) {
  var row = t.row($('#prod-table').find('[data-resource-id="' + resourceId + '"]').closest('tr'));

  if (row.any()) {
    // Update the labels for the corresponding row
    row.data()[5] = '<span class="error-count">' + validationData.errorCount + '</span> ' +
      '<span class="warning-count">' + validationData.warningCount + '</span> ' +
      '<span class="info-count">' + validationData.infoCount + '</span>';
    row.invalidate(); // Invalidate the row to trigger a redraw
  }
}

// Function to validate a resource and populate validation labels
async function validateAndPopulateLabels(resourceId, baseurl) {
  // Construct the validation URL
  const validationUrl = `${baseurl}/Bundle/${resourceId}/$validate`;
  //  const validationUrl = 
  try {
    // Make the API call to get the validation report
    const response = await fetch(validationUrl);

    if (response.status === 200) {
      const validationData = await response.json();

      // Parse the validation report and count errors, warnings, and info
      let errorCount = 0;
      let warningCount = 0;
      let infoCount = 0;

      if (validationData.issue) {
        validationData.issue.forEach((issue) => {
          if (issue.severity === 'error') {
            errorCount++;
          } else if (issue.severity === 'warning') {
            warningCount++;
          } else if (issue.severity === 'information') {
            infoCount++;
          }
        });
      }

      const updatedValidationData = {
        errorCount,
        warningCount,
        infoCount,
        validationReport: validationData
      };

      populateValidationLabels(resourceId, updatedValidationData);
    } else {
      console.error('Error fetching validation data:', response.status);
    }
  } catch (error) {
    console.error('Error fetching validation data:', error);
  }
}






// Function to remove the event listener for validation
function removeValidationClickListener() {
  document.removeEventListener('click', validationClickListener);
}

// Function to add the event listener for validation
function addValidationClickListener() {
  // Check if the listener has been added before removing it
  if (!document.removeEventListener('click', validationClickListener)) {
    document.addEventListener('click', validationClickListener);
  }
}




document.addEventListener('DOMContentLoaded', async function () {
  // Fetch the configuration from config.json
  fetch('config.json')
    .then((response) => response.json())
    .then((config) => {
      var baseurl = config.server_url;
      var url = baseurl + '/Bundle?_format=json&_count=20000';
      console.log(url);
      var productFormatType = document.getElementById('productFormatType');




      function addValidationClickListener() {
        function validationClickListener(event) {
          //        console.log('Validation click event'); // Debugging message
          const clickedElement = event.target;

          // Check if a label with the resource-id data attribute was clicked
          if (clickedElement.classList.contains('error-count') ||
            clickedElement.classList.contains('warning-count') ||
            clickedElement.classList.contains('info-count')) {

            // Check if a label with the resource-id data attribute was clicked
            const resourceId = findClosestResource(clickedElement);
            if (resourceId) {


              // Trigger the validation for the clicked resource
              validateResource(resourceId, baseurl)
                .then((validationData) => {
                  // Update the clicked label with the validation result
                  const updatedLabel = createValidationLabel(
                    validationData, resourceId, baseurl
                  );

                  const parentCell = clickedElement.parentNode;
                  parentCell.innerHTML = updatedLabel.innerHTML;


                  // Add the event listener again
                  if (!document.removeEventListener('click', validationClickListener)) {
                    document.addEventListener('click', validationClickListener);
                  }
                });
            }
          }
        }

        document.addEventListener('click', validationClickListener);

      }

      function findClosestResource(element) {
        // Traverse up the DOM tree to find the closest parent with data-resource-id attribute
        while (element) {
          if (element.hasAttribute('data-resource-id')) {
            return element.getAttribute('data-resource-id');
          }
          element = element.parentElement;
        }
        return null; // Return null if no valid resource ID is found
      }

      // Initialize DataTable
      initializeDataTable();
      console.log("run initializeDataTable");
      // Clear validation labels
      clearValidationLabels();
      console.log("run clearValidationLabels");

      // Add the event listener for validation
      addValidationClickListener();
      console.log("run addValidationClickListener");


   //   productToggle.dispatchEvent(new Event('change'));
      //// Fetch and process the data
       getDataToProcess(url, false) // Set true for Bundle of Bundles
         .then(data => processData(data, baseurl))
         .catch((error) => console.error('Error processing data:', error));
    })
    .catch((error) => console.error('Error fetching configuration:', error));
});

/// async function getDataToProcess(url, isBundleOfBundles) {}


async function getDataToProcess(url, isBundleOfBundles) {
  const response = await fetch(url);
  const data = await response.json();

  if (isBundleOfBundles) {
    // Process a Bundle of Bundles
    return data.entry
      .map(bundle => bundle.resource.entry)
      .flat()
      .map(entry => entry.resource);
  } else {
    // Process a single Bundle
    return data.entry.map(entry => entry.resource);
  }
}


async function processData(data, baseurl) {
  var progressIndicator = document.getElementById('progressIndicator');
  var processingModal = document.getElementById('processingModal');
  processingModal.style.display = 'block'; // Show the modal
  var totalCount = data.length;
  //console.log(totalCount);
  //console.log(data);
  for (var i = 0; i < totalCount; i++) {
    //    await new Promise(resolve => setTimeout(resolve, 10));
    bid= data[i].id;
for (var j = 0; j < data[i].entry.length; j++) { 
    var resource = data[i].entry[j].resource;
    if (resource && resource.resourceType === 'Composition') {
    //  console.log(resource);

      var current_row = [];

      try {
        current_row.push(data[i].id);
      } catch (error) {
        current_row.push(error);
      }

      try {
        current_row.push('<b>' + resource.title + '</b>');
      } catch (error) {
        current_row.push(error);
      }



      try {
        current_row.push(
          '<a target="_blank" href="./visualiser/index.html?url=' + baseurl + '/Bundle/' + bid + '">Viewer</a> <br>' +
          '<a target="_blank" href=" https://vhewer.com/view-report?url=' + baseurl + '/Bundle/' + bid + '">Ext. Viewer</a> <br> ');
      } catch (error) {
        current_row.push(error);
      }

      //http://fhir.hl7.pt:8787/fhir/MedicinalProductDefinition?_id=ABASAGLAR-100eml-Solution-SE-IS-MedicinalProductDefinition&_revinclude=RegulatedAuthorization:subject&_include:iterate=RegulatedAuthorization:holder&_revinclude:iterate=Ingredient:for&_revinclude=PackagedProductDefinition:package-for&_include:iterate=PackagedProductDefinition:manufactured-item&_revinclude=AdministrableProductDefinition:form-of&_revinclude:iterate=Ingredient:for&_include:iterate=Ingredient:for&_format=json
      try {
        current_row.push('<a target="_blank" href="' + baseurl + '/Bundle/' + bid + '?_format=json">JSON</a>');
      } catch (error) {
        current_row.push(error);
      }

      /*  try {
          current_row.push('<a target="_blank" href="' + baseurl + '/MedicinalProductDefinition/' + resource.id + '?_format=xml">XML</a> <br> <a href="' + baseurl + '/MedicinalProductDefinition/' + resource.id + '?_format=json">JSON</a>');
        } catch (error) {
          current_row.push(error);
        }
        */

      var validateUrl = encodeURIComponent(baseurl + '/Bundle/' + bid + '?_format=json');
      current_row.push(
        '<span class="full-validation-link" data-resource-id="' + bid + '">' +
        '<span class="validation-status" data-resource-id="' + bid + '">Validating...</span><br>' +
        '<a target="_blank" href="./visualiser/outcome.html?url=' + validateUrl + '">Report</a>' +
        '</span>'
      );

      t.row.add(current_row);

      console.log(current_row);
      // Update progress indicator
      progressIndicator.innerText = 'Processing product ' + (i + 1) + ' of ' + totalCount + '...';
    }
  }}

  // Hide the progress indicator after processing
  processingModal.style.display = 'none'; // Hide the modal

  // Draw the DataTable after all data is added
  t.draw();

  // Auto-validate all rows
  validateAllRows(baseurl);
}





// document.addEventListener('DOMContentLoaded', function () {
//   // Your JavaScript code here, including the event listener for the "Validate All" button

//   // Fetch the configuration from config.json
//   fetch('config.json')
//     .then((response) => {
//       return response.json();
//     })
//     .then((config) => {
//       // Get the server_url from the config
//       var baseurl = config.server_url;

//       // Construct the URL for fetching Bundle resources
//       var url = baseurl + '/MedicinalProductDefinition?_format=json&_count=20000';





//       // Fetch data from the constructed URL
//       return fetch(url)
//         .then((response) => {
//           return response.json();
//         })
//         .then((bundles) => {
//           initializeDataTable(); // Initialize DataTable 

//           // clearValidationLabels(); // Clear validation labels




//           // document.getElementById('validate-all-button').addEventListener('click', function () {
//           //   // Iterate through all rows in the DataTable
//           //   t.rows().every(function () {
//           //     const resourceId = this.data()[0]; // Assuming the resource ID is in the first column

//           //     if (resourceId) {
//           //       // Trigger the validation for each resource
//           //       validateResource(resourceId, baseurl)
//           //         .then((validationData) => {
//           //           // Update the validation labels for the current row
//           //           populateValidationLabels(resourceId, validationData);
//           //         });
//           //     }
//           //   });
//           // });

// // Show the progress indicator
// var progressIndicator = document.getElementById('progressIndicator');
// progressIndicator.style.display = 'block';

// // Get the total count
// var totalCount = bundles.entry.length;



//           // Handle click events on "Validate" buttons
//           $('#prod-table').on('click', '.validate-button', function () {
//             var resourceId = $(this).data('resource-id');
//             validateAndPopulateLabels(resourceId, baseurl);
//           });
//         })
//         .catch((error) => {
//           console.error('Error fetching data:', error);
//         });
//     })
//     .catch((error) => {
//       console.error('Error fetching configuration:', error);
//     });




// });




function createValidationLabel(validationData, resourceID, baseurl) {
  var validationLabel = document.createElement("div");
  validationLabel.className = "validation-label";
  console.log(validationData);
  // Create the "Full Validation" link
  var fullValidationLink =
    '<a target="_blank" href="' +
    baseurl +
    '/Bundle/' +
    resourceID +
    '/$validate">Report</a>';

  validationLabel.innerHTML =
    //    '<button class="validate-button">Validate</button> ' +
    '<span class="error-count">' + validationData.errorCount + '</span> ' +
    '<span class="warning-count">' + validationData.warningCount + '</span> ' +
    '<span class="info-count">' + validationData.infoCount + '</span> ' +
    '<span class="full-validation-link">' + fullValidationLink + '</span>';

  return validationLabel;
}

async function validateResource(resourceId, baseurl) {
  var validationUrl = baseurl + '/Bundle/' + resourceId + '/$validate';

  try {
    var response = await fetch(validationUrl);

    if (response.status === 200) {
      var validationData = await response.json();

      var errorCount = 0;
      var warningCount = 0;
      var infoCount = 0;

      if (validationData.issue) {
        validationData.issue.forEach(function(issue) {
          if (issue.severity === 'error') { errorCount++; }
          else if (issue.severity === 'warning') { warningCount++; }
          else if (issue.severity === 'information') { infoCount++; }
        });
      }

      return {
        errorCount: errorCount,
        warningCount: warningCount,
        infoCount: infoCount,
        validationReport: validationData,
      };
    } else {
      console.error('Error fetching validation data:', response.status);
      return {
        errorCount: -1,
        warningCount: 0,
        infoCount: 0,
        validationReport: null,
      };
    }
  } catch (error) {
    console.error('Error fetching validation data:', error);
    return {
      errorCount: -1,
      warningCount: 0,
      infoCount: 0,
      validationReport: null,
    };
  }
}


function clearValidationLabels() {
  $('#prod-table').find('.validation-label').html('');
}

async function validateAllRows(baseurl) {
  var statusElements = document.querySelectorAll('.validation-status[data-resource-id]');
  for (var i = 0; i < statusElements.length; i++) {
    (function(el) {
      var resourceId = el.getAttribute('data-resource-id');
      var validationUrl = baseurl + '/Bundle/' + resourceId + '/$validate';
      fetch(validationUrl)
        .then(function(response) {
          if (response.status === 200) {
            return response.json();
          }
          throw new Error('Validation failed: ' + response.status);
        })
        .then(function(validationData) {
          var errorCount = 0;
          var warningCount = 0;
          var infoCount = 0;
          if (validationData.issue) {
            validationData.issue.forEach(function(issue) {
              if (issue.severity === 'error') { errorCount++; }
              else if (issue.severity === 'warning') { warningCount++; }
              else if (issue.severity === 'information') { infoCount++; }
            });
          }
          el.innerHTML =
            '<span class="error-count" style="color:#dc3545;">' + errorCount + ' err</span> ' +
            '<span class="warning-count" style="color:#e67e22;">' + warningCount + ' warn</span> ' +
            '<span class="info-count" style="color:#0d6efd;">' + infoCount + ' info</span>';
        })
        .catch(function(error) {
          console.error('Validation error for ' + resourceId + ':', error);
          el.innerHTML = '<span style="color:red;">Error</span>';
        });
    })(statusElements[i]);
  }
}







