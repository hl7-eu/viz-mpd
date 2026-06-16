var dataTableInitialized = false;
var t;
var appBaseUrl = "";

function initializeDataTable() {
  if ($.fn.dataTable.isDataTable('#prod-table')) {
    t = $('#prod-table').DataTable();
  }
}

function clearValidationLabels() {
  $('#prod-table').find('.validation-label').html('');
}

function populateValidationLabels(resourceId, validationData) {
  var row = t.row($('#prod-table').find('[data-resource-id="' + resourceId + '"]').closest('tr'));
  if (row.any()) {
    row.data()[5] = '<span class="error-count">' + validationData.errorCount + '</span> ' +
      '<span class="warning-count">' + validationData.warningCount + '</span> ' +
      '<span class="info-count">' + validationData.infoCount + '</span>';
    row.invalidate();
  }
}

async function validateAndPopulateLabels(resourceId, baseurl) {
  const validationUrl = `${baseurl}/${resourceId}/$validate`;
  try {
    const response = await fetch(validationUrl);
    if (response.status === 200) {
      const validationData = await response.json();
      let errorCount = 0, warningCount = 0, infoCount = 0;
      if (validationData.issue) {
        validationData.issue.forEach((issue) => {
          if (issue.severity === 'error') errorCount++;
          else if (issue.severity === 'warning') warningCount++;
          else if (issue.severity === 'information') infoCount++;
        });
      }
      populateValidationLabels(resourceId, { errorCount, warningCount, infoCount, validationReport: validationData });
    }
  } catch (error) {
    console.error('Error fetching validation data:', error);
  }
}

function addValidationClickListener() {
  function validationClickListener(event) {
    const clickedElement = event.target;
    if (clickedElement.classList.contains('error-count') ||
        clickedElement.classList.contains('warning-count') ||
        clickedElement.classList.contains('info-count')) {
      const resourceId = findClosestResource(clickedElement);
      if (resourceId) {
        validateResource(resourceId, appBaseUrl)
          .then((validationData) => {
            const updatedLabel = createValidationLabel(validationData, resourceId, appBaseUrl);
            const parentCell = clickedElement.parentNode;
            parentCell.innerHTML = updatedLabel.innerHTML;
          });
      }
    }
  }
  document.addEventListener('click', validationClickListener);
}

function findClosestResource(element) {
  while (element) {
    if (element.hasAttribute('data-resource-id')) {
      return element.getAttribute('data-resource-id');
    }
    element = element.parentElement;
  }
  return null;
}

document.addEventListener('DOMContentLoaded', async function () {
  fetch('config.json')
    .then((response) => response.json())
    .then((config) => {
      var baseurl = config.server_url;
      appBaseUrl = baseurl;

      initializeDataTable();
      clearValidationLabels();
      addValidationClickListener();

      var mrUrl = baseurl + '/MedicationRequest?_format=json&_count=200&_include=MedicationRequest:medication&_include=MedicationRequest:patient&_include=MedicationRequest:requester';
      var mdUrl = baseurl + '/MedicationDispense?_format=json&_count=200&_include=MedicationDispense:medication&_include=MedicationDispense:patient&_include=MedicationDispense:performer';

      Promise.all([
        fetch(mrUrl).then(r => r.json()),
        fetch(mdUrl).then(r => r.json())
      ])
        .then(([mrData, mdData]) => {
          var mrEntries = (mrData.entry || []).filter(e => e.resource && e.resource.resourceType === 'MedicationRequest');
          var mdEntries = (mdData.entry || []).filter(e => e.resource && e.resource.resourceType === 'MedicationDispense');
          processData(mrEntries, mdData, baseurl);
          processData(mdEntries, mrData, baseurl);
        })
        .catch((error) => console.error('Error fetching data:', error));
    })
    .catch((error) => console.error('Error fetching configuration:', error));
});

function getMedicationName(resource) {
  if (resource.medicationCodeableConcept) {
    if (resource.medicationCodeableConcept.text) return resource.medicationCodeableConcept.text;
    if (resource.medicationCodeableConcept.coding && resource.medicationCodeableConcept.coding[0]) {
      return resource.medicationCodeableConcept.coding[0].display;
    }
  }
  if (resource.medicationReference && resource.medicationReference.display) {
    return resource.medicationReference.display;
  }
  return 'Unknown Medication';
}

async function processData(entries, includedData, baseurl) {
  var progressIndicator = document.getElementById('progressIndicator');
  var processingModal = document.getElementById('processingModal');
  processingModal.style.display = 'block';

  for (var i = 0; i < entries.length; i++) {
    var resource = entries[i].resource;
    var rid = resource.id;
    var rtype = resource.resourceType;
    var medName = getMedicationName(resource);
    var status = resource.status || 'unknown';
    var intent = resource.intent || '';
    var typeLabel = rtype === 'MedicationRequest' ? 'Prescription' : 'Dispense';

    var current_row = [];
    current_row.push(rid);
    current_row.push('<b>' + medName + '</b>');
    current_row.push('<span class="mpd-badge mpd-badge-' + (rtype === 'MedicationRequest' ? 'primary' : 'success') + '">' + typeLabel + '</span>');
    current_row.push('<span class="mpd-badge mpd-badge-secondary">' + status + '</span>' + (intent ? ' <span class="mpd-badge mpd-badge-info">' + intent + '</span>' : ''));

    current_row.push(
      '<a target="_blank" href="./visualiser/index.html?url=' + baseurl + '/' + rtype + '/' + rid + '?_format=json">Viewer</a> <br>' +
      '<a target="_blank" href="https://vhewer.com/view-report?url=' + baseurl + '/' + rtype + '/' + rid + '">Ext. Viewer</a> <br>'
    );

    current_row.push('<a target="_blank" href="' + baseurl + '/' + rtype + '/' + rid + '?_format=json">JSON</a>');

    var validateUrl = encodeURIComponent(baseurl + '/' + rtype + '/' + rid + '?_format=json');
    current_row.push(
      '<span class="full-validation-link" data-resource-id="' + rid + '" data-resource-type="' + rtype + '">' +
      '<span class="validation-status" data-resource-id="' + rid + '" data-resource-type="' + rtype + '">Validating...</span><br>' +
      '<a target="_blank" href="./visualiser/outcome.html?url=' + validateUrl + '">Report</a>' +
      '</span>'
    );

    t.row.add(current_row);
    progressIndicator.innerText = 'Processing ' + typeLabel + ' ' + (i + 1) + ' of ' + entries.length + '...';
  }

  processingModal.style.display = 'none';
  t.draw();
  validateAllRows(baseurl);
}

function createValidationLabel(validationData, resourceID, baseurl) {
  var validationLabel = document.createElement("div");
  validationLabel.className = "validation-label";
  var fullValidationLink =
    '<a target="_blank" href="' + baseurl + '/' + (validationData.resourceType || 'MedicationRequest') + '/' + resourceID + '/$validate">Report</a>';
  validationLabel.innerHTML =
    '<span class="error-count">' + validationData.errorCount + '</span> ' +
    '<span class="warning-count">' + validationData.warningCount + '</span> ' +
    '<span class="info-count">' + validationData.infoCount + '</span> ' +
    '<span class="full-validation-link">' + fullValidationLink + '</span>';
  return validationLabel;
}

async function validateResource(resourceId, baseurl) {
  var rtype = document.querySelector('[data-resource-id="' + resourceId + '"]');
  if (rtype) rtype = rtype.getAttribute('data-resource-type') || 'MedicationRequest';
  else rtype = 'MedicationRequest';
  var validationUrl = baseurl + '/' + rtype + '/' + resourceId + '/$validate';
  try {
    var response = await fetch(validationUrl);
    if (response.status === 200) {
      var validationData = await response.json();
      var errorCount = 0, warningCount = 0, infoCount = 0;
      if (validationData.issue) {
        validationData.issue.forEach(function(issue) {
          if (issue.severity === 'error') errorCount++;
          else if (issue.severity === 'warning') warningCount++;
          else if (issue.severity === 'information') infoCount++;
        });
      }
      return { errorCount, warningCount, infoCount, validationReport: validationData, resourceType: rtype };
    }
    return { errorCount: -1, warningCount: 0, infoCount: 0, validationReport: null, resourceType: rtype };
  } catch (error) {
    return { errorCount: -1, warningCount: 0, infoCount: 0, validationReport: null, resourceType: rtype };
  }
}

async function validateAllRows(baseurl) {
  var statusElements = document.querySelectorAll('.validation-status[data-resource-id]');
  for (var i = 0; i < statusElements.length; i++) {
    (function(el) {
      var resourceId = el.getAttribute('data-resource-id');
      var rtype = el.getAttribute('data-resource-type') || 'MedicationRequest';
      var validationUrl = baseurl + '/' + rtype + '/' + resourceId + '/$validate';
      fetch(validationUrl)
        .then(function(response) {
          if (response.status === 200) return response.json();
          throw new Error('Validation failed: ' + response.status);
        })
        .then(function(validationData) {
          var errorCount = 0, warningCount = 0, infoCount = 0;
          if (validationData.issue) {
            validationData.issue.forEach(function(issue) {
              if (issue.severity === 'error') errorCount++;
              else if (issue.severity === 'warning') warningCount++;
              else if (issue.severity === 'information') infoCount++;
            });
          }
          el.innerHTML =
            '<span class="error-count" style="color:#dc3545;">' + errorCount + ' err</span> ' +
            '<span class="warning-count" style="color:#e67e22;">' + warningCount + ' warn</span> ' +
            '<span class="info-count">' + infoCount + ' info</span>';
        })
        .catch(function(error) {
          console.error('Validation error for ' + resourceId + ':', error);
          el.innerHTML = '<span style="color:red;">Error</span>';
        });
    })(statusElements[i]);
  }
}