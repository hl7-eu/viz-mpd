# Visualiser Template Reformat — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reformat the FHIR lab visualiser templates to a modern Clinical Clean design with stacked card layout, Bootstrap 5 migration, full EU Lab resource support, and bug fixes.

**Architecture:** LiquidJS templates (`.liquid` files) render FHIR Bundle data client-side. The HTML pages (`index.html`, `bundle.html`, `outcome.html`) load dependencies and fetch data. CSS in `styles.css` provides the design system. We'll rewrite the templates to use left-accent border cards, resolve all resource types from Bundle entries, and restyle the outcome accordion.

**Tech Stack:** LiquidJS (template engine), Bootstrap 5.3.x (CSS + JS), jQuery 3.6.1, vanilla JavaScript, no build step.

---

## File Structure

| File | Responsibility |
|---|---|
| `apps/assets/css/styles.css` | Clinical Clean design system (replace entirely) |
| `apps/visualiser/templates/bundlelab.liquid` | Main lab report template (restructure entirely) |
| `apps/visualiser/templates/obs.liquid` | Observation sub-template (rewrite entirely) |
| `apps/visualiser/templates/outcome.liquid` | Validation outcome template (restyle) |
| `apps/visualiser/index.html` | Upgrade BS4→BS5, update page title and container class |
| `apps/visualiser/bundle.html` | Fix template ref, upgrade BS4→BS5 |
| `apps/visualiser/outcome.html` | Align BS5 minor version |
| `apps/visualiser/templates.json` | Add Bundle and OperationOutcome mappings |

---

### Task 1: Replace `styles.css` with Clinical Clean Design System

**Files:**
- Modify: `apps/assets/css/styles.css`

- [ ] **Step 1: Write the new design system CSS**

Replace the entire contents of `apps/assets/css/styles.css` with:

```css
:root {
  --lab-primary: #2563eb;
  --lab-success: #10b981;
  --lab-warning: #f59e0b;
  --lab-danger: #ef4444;
  --lab-info: #3b82f6;
  --lab-bg: #f8fafc;
  --lab-card-bg: #ffffff;
  --lab-text: #1e293b;
  --lab-text-secondary: #64748b;
  --lab-border: #e2e8f0;
  --lab-patient-bg: #f1f5f9;
  --lab-radius: 6px;
}

body {
  background-color: var(--lab-bg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--lab-text);
}

.lab-card {
  background: var(--lab-card-bg);
  border: 1px solid var(--lab-border);
  border-radius: var(--lab-radius);
  padding: 12px 16px;
  margin-bottom: 10px;
}

.lab-card-accent {
  background: var(--lab-card-bg);
  border-radius: var(--lab-radius);
  padding: 12px 16px;
  margin-bottom: 10px;
  border: 1px solid var(--lab-border);
  border-left: 3px solid var(--lab-info);
}

.lab-card-accent.success { border-left-color: var(--lab-success); }
.lab-card-accent.danger { border-left-color: var(--lab-danger); }
.lab-card-accent.warning { border-left-color: var(--lab-warning); }
.lab-card-accent.primary { border-left-color: var(--lab-primary); }
.lab-card-accent.info { border-left-color: var(--lab-info); }

.lab-hero {
  background: var(--lab-card-bg);
  border-radius: var(--lab-radius);
  padding: 16px 20px;
  margin-bottom: 10px;
  border: 1px solid var(--lab-border);
  border-left: 3px solid var(--lab-primary);
}

.lab-patient-strip {
  background: var(--lab-patient-bg);
  border-radius: var(--lab-radius);
  padding: 10px 16px;
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 24px;
}

.lab-patient-strip .lab-patient-name {
  font-weight: 600;
  color: var(--lab-text);
  font-size: 1rem;
}

.lab-patient-strip .lab-patient-detail {
  color: var(--lab-text-secondary);
  font-size: 0.875rem;
}

.lab-patient-strip .lab-identifier-list {
  width: 100%;
  font-size: 0.8125rem;
  color: var(--lab-text-secondary);
}

.lab-patient-strip .lab-identifier-list span {
  margin-right: 12px;
}

.lab-section-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--lab-text-secondary);
  margin: 16px 0 6px 4px;
  font-weight: 600;
}

.lab-obs-card {
  background: var(--lab-card-bg);
  border-radius: var(--lab-radius);
  padding: 10px 14px;
  margin-bottom: 8px;
  border: 1px solid var(--lab-border);
  border-left: 3px solid var(--lab-info);
}

.lab-obs-card.interp-normal { border-left-color: var(--lab-success); }
.lab-obs-card.interp-high { border-left-color: var(--lab-danger); }
.lab-obs-card.interp-low { border-left-color: var(--lab-danger); }
.lab-obs-card.interp-abnormal { border-left-color: var(--lab-warning); }
.lab-obs-card.interp-susceptible { border-left-color: var(--lab-success); }
.lab-obs-card.interp-resistant { border-left-color: var(--lab-danger); }

.lab-obs-nested {
  margin-left: 24px;
}

.lab-obs-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2px;
}

.lab-obs-code {
  font-weight: 600;
  color: var(--lab-text);
  font-size: 0.9375rem;
}

.lab-obs-value {
  color: var(--lab-text);
  font-size: 0.9375rem;
}

.lab-obs-detail {
  color: var(--lab-text-secondary);
  font-size: 0.8125rem;
  margin-top: 2px;
}

.lab-obs-footer {
  color: var(--lab-text-secondary);
  font-size: 0.75rem;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--lab-border);
}

.lab-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1.4;
}

.lab-badge-success { background: #ecfdf5; color: #059669; }
.lab-badge-warning { background: #fffbeb; color: #d97706; }
.lab-badge-danger  { background: #fef2f2; color: #dc2626; }
.lab-badge-info    { background: #eff6ff; color: #2563eb; }
.lab-badge-secondary { background: #f1f5f9; color: #64748b; }

.lab-hero .lab-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--lab-text);
  margin: 0;
}

.lab-hero .lab-meta {
  color: var(--lab-text-secondary);
  font-size: 0.875rem;
  margin-top: 4px;
}

.lab-hero .lab-meta span {
  margin-right: 12px;
}

.lab-support-section {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid var(--lab-border);
}

.lab-support-card {
  background: var(--lab-card-bg);
  border: 1px solid var(--lab-border);
  border-radius: var(--lab-radius);
  padding: 8px 12px;
  margin-bottom: 6px;
  font-size: 0.875rem;
}

.lab-support-card .lab-support-label {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--lab-text-secondary);
  font-weight: 600;
}

.lab-support-card .lab-support-value {
  color: var(--lab-text);
}

.lab-component-table {
  width: 100%;
  font-size: 0.875rem;
  margin-top: 4px;
}

.lab-component-table td {
  padding: 2px 0;
  vertical-align: top;
}

.lab-component-table td:first-child {
  color: var(--lab-text-secondary);
  padding-right: 12px;
  white-space: nowrap;
}

.lab-component-table td:last-child {
  color: var(--lab-text);
  font-weight: 500;
}

/* Outcome template styles */
.lab-outcome-pass {
  border-left: 3px solid var(--lab-success);
  background: var(--lab-card-bg);
  border-radius: var(--lab-radius);
  padding: 12px 16px;
  margin-bottom: 16px;
}

.lab-outcome-pass .lab-outcome-title {
  color: #059669;
  font-weight: 700;
  font-size: 1.125rem;
}

.lab-outcome-fail {
  border-left: 3px solid var(--lab-danger);
  background: var(--lab-card-bg);
  border-radius: var(--lab-radius);
  padding: 12px 16px;
  margin-bottom: 16px;
}

.lab-outcome-fail .lab-outcome-title {
  color: #dc2626;
  font-weight: 700;
  font-size: 1.125rem;
}

.lab-issue-card {
  background: var(--lab-card-bg);
  border-radius: var(--lab-radius);
  padding: 8px 12px;
  margin-bottom: 6px;
  border: 1px solid var(--lab-border);
  border-left: 3px solid var(--lab-info);
  font-size: 0.875rem;
}

.lab-issue-card.issue-error { border-left-color: var(--lab-danger); }
.lab-issue-card.issue-warning { border-left-color: var(--lab-warning); }
.lab-issue-card.issue-information { border-left-color: var(--lab-info); }

.lab-issue-card .lab-issue-code {
  font-weight: 600;
  margin-right: 8px;
}

.lab-issue-card .lab-issue-diagnostics {
  color: var(--lab-text);
}

.lab-issue-card .lab-issue-location {
  color: var(--lab-text-secondary);
  font-size: 0.75rem;
  font-style: italic;
}

/* Accordion overrides for outcome */
.accordion-button { font-weight: 600; font-size: 0.9375rem; }
.accordion-button.error { color: #dc2626; }
.accordion-button.warning { color: #d97706; }
.accordion-button.information { color: #2563eb; }

/* Legacy compatibility: keep .rcorners for any other apps that use it */
.rcorners {
  border-radius: 7px;
  border: 1px solid #71775b;
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 7px;
}

p { margin-top: 0; margin-bottom: 0.25rem; }

dl, ol, ul { margin-bottom: 0.1rem; }

#header-menu {
  list-style-type: none;
  background-color: #fff;
  border: 1px solid #ddd;
  position: absolute;
  width: 150px;
  z-index: 1000;
}

#header-menu li a {
  display: block;
  padding: 10px;
  text-decoration: none;
  color: #333;
}

#header-menu li a:hover {
  background-color: #f7f7f7;
}
```

- [ ] **Step 2: Verify CSS loads correctly**

Open a browser tab to `http://localhost:8282/laboratory/apps/visualiser/index.html?url=./resources/Bundle-005-CanifugCremolum-EE-FullProduct.json` (or any available bundle URL) and confirm the page loads without CSS errors in the console. The old template will look broken with the new CSS, which is expected — this is verified in later tasks.

- [ ] **Step 3: Commit**

```bash
git add apps/assets/css/styles.css
git commit -m "feat: replace styles.css with Clinical Clean design system"
```

---

### Task 2: Upgrade `index.html` to Bootstrap 5

**Files:**
- Modify: `apps/visualiser/index.html`

- [ ] **Step 1: Replace the full contents of `index.html`**

Replace the entire contents of `apps/visualiser/index.html` with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Lab Viewer v0.1.0</title>
    <script src="https://code.jquery.com/jquery-3.6.1.min.js" integrity="sha256-o88AwQnZB+VDvE9tvIXrMQaPlFFSUTR+nldQm1LuPXQ=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/liquidjs/dist/liquid.browser.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeWoRkdMYszRZhdD4fhShcBkQj8oxV4TkrJnN8kY9a" crossorigin="anonymous">
    <link rel="stylesheet" href="./assets/css/styles.css">
  </head>
  <body>

    <div id="result" class="container"></div>
    <p id="preamble" class="text-muted small mt-2">Lab Viewer v0.1.0</p>

    <script type="text/javascript">
      var url = window.location.search.split('url=')[1];
      var resourceType = "Bundle";
      var templateFile = 'bundlelab.liquid';

      var urlsplit = url.split('/' + resourceType + '/');
      if (urlsplit[1]) {
        var mpdid = urlsplit[1];
        url = urlsplit[0] + '/' + resourceType + '/' + mpdid + '?_format=json';
      }

      var result = document.querySelector('#result');
      var engine = new liquidjs.Liquid();

      $.get("./templates/" + templateFile, function(ltemplate) {
        $.getJSON(url, function(json) {
          console.log(url);
          console.log(json);
          engine.parseAndRender(ltemplate, json)
            .then(function(html) { result.innerHTML = html; });
        });
      });
    </script>
  </body>
</html>
```

- [ ] **Step 2: Verify the page loads without console errors**

Open the visualiser page and confirm no JS/CSS loading errors. The template output will look broken since we haven't updated the template yet.

- [ ] **Step 3: Commit**

```bash
git add apps/visualiser/index.html
git commit -m "feat: upgrade index.html to Bootstrap 5.3, clean up JS"
```

---

### Task 3: Upgrade and Fix `bundle.html`

**Files:**
- Modify: `apps/visualiser/bundle.html`

- [ ] **Step 1: Replace the full contents of `bundle.html`**

Replace the entire contents of `apps/visualiser/bundle.html` with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Lab Bundle Viewer</title>
    <script src="https://code.jquery.com/jquery-3.6.1.min.js" integrity="sha256-o88AwQnZB+VDvE9tvIXrMQaPlFFSUTR+nldQm1LuPXQ=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/liquidjs/dist/liquid.browser.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeWoRkdMYszRZhdD4fhShcBkQj8oxV4TkrJnN8kY9a" crossorigin="anonymous">
    <link rel="stylesheet" href="./assets/css/styles.css">
  </head>
  <body>

    <div id="result" class="container"></div>
    <p id="preamble" class="text-muted small mt-2">Lab Bundle Viewer</p>

    <script type="text/javascript">
      var url = window.location.search.split('url=')[1];
      var resourceType = "Bundle";
      var templateFile = 'bundlelab.liquid';

      var urlsplit = url.split('/' + resourceType + '/');
      if (urlsplit[1]) {
        var mpdid = urlsplit[1];
        url = urlsplit[0] + '/' + resourceType + '/' + mpdid + '?_format=json';
      }

      var result = document.querySelector('#result');
      var engine = new liquidjs.Liquid();

      $.get("./templates/" + templateFile, function(ltemplate) {
        $.getJSON(url, function(json) {
          engine.parseAndRender(ltemplate, json)
            .then(function(html) { result.innerHTML = html; });
        });
      });
    </script>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add apps/visualiser/bundle.html
git commit -m "fix: update bundle.html to use bundlelab.liquid, upgrade to BS5"
```

---

### Task 4: Align `outcome.html` Bootstrap Version

**Files:**
- Modify: `apps/visualiser/outcome.html`

- [ ] **Step 1: Update BS5 version and remove standalone Popper**

In `outcome.html`, change the Bootstrap CSS link from `5.3.2` to `5.3.3` and the JS bundle from `5.3.2` to `5.3.3`. Also remove the standalone Popper.js `<script>` tag (it's included in the BS5 bundle). The `<head>` should become:

```html
  <head>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Validation Outcome</title>
    <script src="https://code.jquery.com/jquery-3.6.1.min.js" integrity="sha256-o88AwQnZB+VDvE9tvIXrMQaPlFFSUTR+nldQm1LuPXQ=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/liquidjs/dist/liquid.browser.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeWoRkdMYszRZhdD4fhShcBkQj8oxV4TkrJnN8kY9a" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NAzN2mfNE1Z5oLHg6SQDbeGS3Oo" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="./assets/css/styles.css">
  </head>
```

Also in the `<body>`, change `class="container rcorners"` to `class="container"` on the `<div id="result">` line.

- [ ] **Step 2: Commit**

```bash
git add apps/visualiser/outcome.html
git commit -m "chore: align outcome.html to BS5.3.3, remove standalone Popper"
```

---

### Task 5: Rewrite `bundlelab.liquid` — Composition and Patient

**Files:**
- Modify: `apps/visualiser/templates/bundlelab.liquid`

- [ ] **Step 1: Write the new bundlelab.liquid — Composition hero card and Patient strip**

Replace the entire contents of `apps/visualiser/templates/bundlelab.liquid` with:

```liquid
{% comment %}Extract Bundle entry resources{% endcomment %}
{% assign entry = entry %}

{% comment %}Find Composition{% endcomment %}
{% assign compr = entry | where: "resource.resourceType", "Composition" | first %}
{% assign comp = compr.resource %}

{% comment %}Find Patient{% endcomment %}
{% assign patr = entry | where: "resource.resourceType", "Patient" | first %}
{% assign pat = patr.resource %}

{% comment %}Find DiagnosticReport{% endcomment %}
{% assign drr = entry | where: "resource.resourceType", "DiagnosticReport" | first %}
{% assign dr = drr.resource %}

{% comment %}Resolve author references — build display string{% endcomment %}
{% assign author_lines = "" %}
{% for auth in comp.author %}
  {% assign author_entry = entry | where: "fullUrl", auth.reference | first %}
  {% if author_entry %}
    {% assign author_res = author_entry.resource %}
    {% if author_res.resourceType == "PractitionerRole" %}
      {% comment %}Resolve practitioner name{% endcomment %}
      {% assign pr_name = "" %}
      {% if author_res.practitioner %}
        {% assign pr_entry = entry | where: "fullUrl", author_res.practitioner.reference | first %}
        {% if pr_entry %}
          {% if pr_entry.resource.name[0].text %}
            {% assign pr_name = pr_entry.resource.name[0].text %}
          {% elsif pr_entry.resource.name[0].family %}
            {% assign pr_name_parts = pr_entry.resource.name[0].given | join: " " %}
            {% assign pr_name = pr_name_parts | append: " " | append: pr_entry.resource.name[0].family %}
          {% endif %}
        {% endif %}
      {% endif %}
      {% comment %}Resolve organization name{% endcomment %}
      {% assign org_name = "" %}
      {% if author_res.organization %}
        {% assign org_entry = entry | where: "fullUrl", author_res.organization.reference | first %}
        {% if org_entry %}
          {% assign org_name = org_entry.resource.name %}
        {% endif %}
      {% endif %}
      {% assign author_line = pr_name %}
      {% if org_name != "" and org_name != nil %}
        {% assign author_line = pr_name | append: " — " | append: org_name %}
      {% endif %}
      {% if author_lines == "" %}
        {% assign author_lines = author_line %}
      {% else %}
        {% assign author_lines = author_lines | append: " · " | append: author_line %}
      {% endif %}
    {% elsif author_res.resourceType == "Practitioner" %}
      {% assign pname = "" %}
      {% if author_res.name[0].text %}
        {% assign pname = author_res.name[0].text %}
      {% elsif author_res.name[0].family %}
        {% assign pname_parts = author_res.name[0].given | join: " " %}
        {% assign pname = pname_parts | append: " " | append: author_res.name[0].family %}
      {% endif %}
      {% if author_lines == "" %}
        {% assign author_lines = pname %}
      {% else %}
        {% assign author_lines = author_lines | append: " · " | append: pname %}
      {% endif %}
    {% elsif author_res.resourceType == "Organization" %}
      {% if author_lines == "" %}
        {% assign author_lines = author_res.name %}
      {% else %}
        {% assign author_lines = author_lines | append: " · " | append: author_res.name %}
      {% endif %}
    {% elsif author_res.resourceType == "Device" %}
      {% if author_lines == "" %}
        {% assign author_lines = "Device" %}
      {% else %}
        {% assign author_lines = author_lines | append: " · Device" %}
      {% endif %}
    {% else %}
      {% if auth.display %}
        {% if author_lines == "" %}
          {% assign author_lines = auth.display %}
        {% else %}
          {% assign author_lines = author_lines | append: " · " | append: auth.display %}
        {% endif %}
      {% endif %}
    {% endif %}
  {% elsif auth.display %}
    {% if author_lines == "" %}
      {% assign author_lines = auth.display %}
    {% else %}
      {% assign author_lines = author_lines | append: " · " | append: auth.display %}
    {% endif %}
  {% endif %}
{% endfor %}

{% comment %}Resolve custodian{% endcomment %}
{% assign custodian_name = "" %}
{% if comp.custodian %}
  {% assign cust_entry = entry | where: "fullUrl", comp.custodian.reference | first %}
  {% if cust_entry %}
    {% assign custodian_name = cust_entry.resource.name %}
  {% endif %}
{% endif %}

{% comment %}Build status badge class{% endcomment %}
{% assign status_class = "lab-badge-secondary" %}
{% if comp.status == "final" %}{% assign status_class = "lab-badge-success" %}
{% elsif comp.status == "registered" or comp.status == "preliminary" %}{% assign status_class = "lab-badge-warning" %}
{% elsif comp.status == "cancelled" or comp.status == "entered-in-error" %}{% assign status_class = "lab-badge-danger" %}
{% endif %}

<div class="lab-hero">
  <div class="d-flex justify-content-between align-items-start">
    <div>
      <h4 class="lab-title">{{ comp.title }}</h4>
      <div class="lab-meta">
        {% if author_lines != "" %}<span>{{ author_lines }}</span>{% endif %}
        {% if comp.date %}<span>{{ comp.date }}</span>{% endif %}
        {% if custodian_name != "" and custodian_name != nil %}<span>{{ custodian_name }}</span>{% endif %}
      </div>
      {% if comp.type %}
        <div class="lab-meta">
          {% for tc in comp.type.coding %}
            <span class="lab-badge lab-badge-info">{{ tc.display }}</span>
          {% endfor %}
        </div>
      {% endif %}
      {% if comp.category %}
        <div class="lab-meta">
          {% for cat in comp.category %}
            {% for cc in cat.coding %}
              <span class="lab-badge lab-badge-secondary">{{ cc.display }}</span>
            {% endfor %}
          {% endfor %}
        </div>
      {% endif %}
    </div>
    <span class="lab-badge {{ status_class }}">{{ comp.status | upcase }}</span>
  </div>
</div>

{% comment %}Patient strip{% endcomment %}
{% if pat %}
<div class="lab-patient-strip">
  {% assign patient_name = "" %}
  {% if pat.name[0].text %}
    {% assign patient_name = pat.name[0].text %}
  {% elsif pat.name[0].family %}
    {% assign pname_parts = pat.name[0].given | join: " " %}
    {% assign patient_name = pname_parts | append: " " | append: pat.name[0].family %}
  {% endif %}
  {% if patient_name != "" and patient_name != nil %}
    <span class="lab-patient-name">{{ patient_name }}</span>
  {% endif %}
  {% if pat.gender %}<span class="lab-patient-detail">{{ pat.gender | slice: 0 | upcase }}</span>{% endif %}
  {% if pat.birthDate %}<span class="lab-patient-detail">b. {{ pat.birthDate }}</span>{% endif %}
  {% if pat.identifier %}
  <div class="lab-identifier-list">
    {% for pid in pat.identifier %}
      <span>{{ pid.system | split: "/" | last | upcase }}: <strong>{{ pid.value }}</strong></span>
    {% endfor %}
  </div>
  {% endif %}
</div>
{% endif %}

{% comment %}DiagnosticReport summary{% endcomment %}
{% if dr %}
<div class="lab-card">
  <div class="d-flex justify-content-between align-items-start">
    <div>
      <strong>Diagnostic Report</strong>
      {% if dr.code %}
        {% if dr.code.text %}
          <span> — {{ dr.code.text }}</span>
        {% elsif dr.code.coding[0].display %}
          <span> — {{ dr.code.coding[0].display }}</span>
        {% endif %}
      {% endif %}
      {% if dr.effectiveDateTime %}
        <div class="lab-obs-detail">{{ dr.effectiveDateTime }}</div>
      {% endif %}
      {% if dr.conclusion %}
        <div class="lab-obs-detail"><strong>Conclusion:</strong> {{ dr.conclusion }}</div>
      {% endif %}
    </div>
    {% if dr.status %}
      {% assign dr_status_class = "lab-badge-secondary" %}
      {% if dr.status == "final" %}{% assign dr_status_class = "lab-badge-success" %}
      {% elsif dr.status == "registered" or dr.status == "preliminary" %}{% assign dr_status_class = "lab-badge-warning" %}
      {% elsif dr.status == "cancelled" %}{% assign dr_status_class = "lab-badge-danger" %}
      {% endif %}
      <span class="lab-badge {{ dr_status_class }}">{{ dr.status | upcase }}</span>
    {% endif %}
  </div>
</div>
{% endif %}

{% comment %}Render Composition sections{% endcomment %}
{% for sec in comp.section %}
  <div class="lab-section-label">{{ sec.title | default: "Section" }}</div>
  {% if sec.code %}
    {% if sec.code.coding[0].display %}
      <div class="lab-obs-detail mb-2">{{ sec.code.coding[0].display }}</div>
    {% endif %}
  {% endif %}

  {% comment %}Render entries in this section{% endfor %}
  {% for ent in sec.entry %}
    {% assign entr = entry | where: "fullUrl", ent.reference | first %}
    {% if entr %}
      {% if entr.resource.resourceType == "Observation" %}
        <div class="lab-obs-card">
          {% render "./templates/obs.liquid", entr: entr, entry: entry %}
        </div>
        {% comment %}Render hasMember observations{% endcomment %}
        {% if entr.resource.hasMember %}
          {% for memb in entr.resource.hasMember %}
            {% assign subentr = entry | where: "fullUrl", memb.reference | first %}
            {% if subentr %}
              <div class="lab-obs-nested">
                <div class="lab-obs-card">
                  {% render "./templates/obs.liquid", entr: subentr, entry: entry %}
                </div>
                {% if subentr.resource.hasMember %}
                  {% for submemb in subentr.resource.hasMember %}
                    {% assign subsubentr = entry | where: "fullUrl", submemb.reference | first %}
                    {% if subsubentr %}
                      <div class="lab-obs-nested">
                        <div class="lab-obs-card">
                          {% render "./templates/obs.liquid", entr: subsubentr, entry: entry %}
                        </div>
                        {% if subsubentr.resource.hasMember %}
                          {% for subsubmemb in subsubentr.resource.hasMember %}
                            {% assign lvl3 = entry | where: "fullUrl", subsubmemb.reference | first %}
                            {% if lvl3 %}
                              <div class="lab-obs-nested">
                                <div class="lab-obs-card">
                                  {% render "./templates/obs.liquid", entr: lvl3, entry: entry %}
                                </div>
                              </div>
                            {% endif %}
                          {% endfor %}
                        {% endif %}
                      </div>
                    {% endif %}
                  {% endfor %}
                {% endif %}
              </div>
            {% endif %}
          {% endfor %}
        {% endif %}
      {% elsif entr.resource.resourceType == "ServiceRequest" %}
        {% assign sr = entr.resource %}
        <div class="lab-support-card">
          <div class="lab-support-label">Service Request</div>
          {% if sr.code %}
            {% if sr.code.text %}
              <div class="lab-support-value">{{ sr.code.text }}</div>
            {% elsif sr.code.coding[0].display %}
              <div class="lab-support-value">{{ sr.code.coding[0].display }}</div>
            {% endif %}
          {% endif %}
          {% if sr.status %}<span class="lab-badge lab-badge-secondary me-1">{{ sr.status }}</span>{% endif %}
          {% if sr.intent %}<span class="lab-badge lab-badge-info">{{ sr.intent }}</span>{% endif %}
        </div>
      {% endif %}
    {% endif %}
  {% endfor %}

  {% comment %}Render sub-sections{% endcomment %}
  {% for subsec in sec.section %}
    <div class="lab-section-label" style="margin-left: 24px;">{{ subsec.title | default: "Sub-section" }}</div>
    {% if subsec.code %}
      {% if subsec.code.coding[0].display %}
        <div class="lab-obs-detail mb-2" style="margin-left: 24px;">{{ subsec.code.coding[0].display }}</div>
      {% endif %}
    {% endif %}
    {% for ent in subsec.entry %}
      {% assign entr = entry | where: "fullUrl", ent.reference | first %}
      {% if entr %}
        {% if entr.resource.resourceType == "Observation" %}
          <div class="lab-obs-nested">
            <div class="lab-obs-card">
              {% render "./templates/obs.liquid", entr: entr, entry: entry %}
            </div>
            {% if entr.resource.hasMember %}
              {% for memb in entr.resource.hasMember %}
                {% assign subentr = entry | where: "fullUrl", memb.reference | first %}
                {% if subentr %}
                  <div class="lab-obs-nested">
                    <div class="lab-obs-card">
                      {% render "./templates/obs.liquid", entr: subentr, entry: entry %}
                    </div>
                    {% if subentr.resource.hasMember %}
                      {% for submemb in subentr.resource.hasMember %}
                        {% assign subsubentr = entry | where: "fullUrl", submemb.reference | first %}
                        {% if subsubentr %}
                          <div class="lab-obs-nested">
                            <div class="lab-obs-card">
                              {% render "./templates/obs.liquid", entr: subsubentr, entry: entry %}
                            </div>
                          </div>
                        {% endif %}
                      {% endfor %}
                    {% endif %}
                  </div>
                {% endif %}
              {% endfor %}
            {% endif %}
          </div>
        {% elsif entr.resource.resourceType == "ServiceRequest" %}
          <div style="margin-left: 24px;">
            {% assign sr = entr.resource %}
            <div class="lab-support-card">
              <div class="lab-support-label">Service Request</div>
              {% if sr.code %}
                {% if sr.code.text %}
                  <div class="lab-support-value">{{ sr.code.text }}</div>
                {% elsif sr.code.coding[0].display %}
                  <div class="lab-support-value">{{ sr.code.coding[0].display }}</div>
                {% endif %}
              {% endif %}
              {% if sr.status %}<span class="lab-badge lab-badge-secondary me-1">{{ sr.status }}</span>{% endif %}
              {% if sr.intent %}<span class="lab-badge lab-badge-info">{{ sr.intent }}</span>{% endif %}
            </div>
          </div>
        {% endif %}
      {% endif %}
    {% endfor %}
  {% endfor %}
{% endfor %}

{% comment %}Supporting Resources section{% endcomment %}
{% assign orgs = entry | where: "resource.resourceType", "Organization" %}
{% assign encounters = entry | where: "resource.resourceType", "Encounter" %}
{% assign coverage = entry | where: "resource.resourceType", "Coverage" %}

{% if orgs.size > 0 or encounters.size > 0 or coverage.size > 0 %}
<div class="lab-section-label">Supporting Resources</div>

{% for org_e in orgs %}
  {% assign org = org_e.resource %}
  <div class="lab-support-card">
    <div class="lab-support-label">Organization</div>
    <div class="lab-support-value">{{ org.name | default: "Unknown" }}</div>
    {% if org.type %}
      {% for ot in org.type %}
        {% for otc in ot.coding %}
          <span class="lab-badge lab-badge-secondary">{{ otc.display }}</span>
        {% endfor %}
      {% endfor %}
    {% endif %}
  </div>
{% endfor %}

{% for enc_e in encounters %}
  {% assign enc = enc_e.resource %}
  <div class="lab-support-card">
    <div class="lab-support-label">Encounter</div>
    <div class="lab-support-value">
      {{ enc.status | default: "" }}
      {% if enc.class %}
        {% for cl in enc.class %}
          <span class="lab-badge lab-badge-secondary">{{ cl.display | default: cl.code }}</span>
        {% endfor %}
      {% endif %}
    </div>
  </div>
{% endfor %}

{% for cov_e in coverage %}
  {% assign cov = cov_e.resource %}
  <div class="lab-support-card">
    <div class="lab-support-label">Coverage</div>
    <div class="lab-support-value">
      {{ cov.status | default: "" }}
      {% if cov.type %}
        {% for ctc in cov.type.coding %}
          <span class="lab-badge lab-badge-info">{{ ctc.display }}</span>
        {% endfor %}
      {% endif %}
    </div>
  </div>
{% endfor %}
{% endif %}
```

- [ ] **Step 2: Commit**

```bash
git add apps/visualiser/templates/bundlelab.liquid
git commit -m "feat: rewrite bundlelab.liquid with Clinical Clean stacked card layout, full resource support"
```

---

### Task 6: Rewrite `obs.liquid` — Observation Card with Full Data Support

**Files:**
- Modify: `apps/visualiser/templates/obs.liquid`

- [ ] **Step 1: Write the new observation template**

Replace the entire contents of `apps/visualiser/templates/obs.liquid` with:

```liquid
{% comment %}Determine interpretation accent class{% endcomment %}
{% assign interp_class = "" %}
{% if entr.resource.interpretation %}
  {% assign interp_code = entr.resource.interpretation[0].coding[0].code %}
  {% if interp_code == "N" %}{% assign interp_class = "interp-normal" %}
  {% elsif interp_code == "H" or interp_code == "HH" %}{% assign interp_class = "interp-high" %}
  {% elsif interp_code == "L" or interp_code == "LL" %}{% assign interp_class = "interp-low" %}
  {% elsif interp_code == "A" %}{% assign interp_class = "interp-abnormal" %}
  {% elsif interp_code == "S" %}{% assign interp_class = "interp-susceptible" %}
  {% elsif interp_code == "R" %}{% assign interp_class = "interp-resistant" %}
  {% endif %}
{% endif %}

<div class="lab-obs-header">
  <span class="lab-obs-code">
    {% if entr.resource.code.text %}
      {{ entr.resource.code.text }}
    {% elsif entr.resource.code.coding[0].display %}
      {{ entr.resource.code.coding[0].display }}
    {% endif %}
    {% if entr.resource.category %}
      <span class="lab-badge lab-badge-secondary ms-1">{{ entr.resource.category[0].coding[0].code }}</span>
    {% endif %}
  </span>
  {% if entr.resource.interpretation %}
    <span class="lab-badge {% if interp_class == 'interp-normal' %}lab-badge-success{% elsif interp_class == 'interp-high' or interp_class == 'interp-low' %}lab-badge-danger{% elsif interp_class == 'interp-abnormal' %}lab-badge-warning{% elsif interp_class == 'interp-susceptible' %}lab-badge-success{% elsif interp_class == 'interp-resistant' %}lab-badge-danger{% else %}lab-badge-info{% endif %}">
      {{ entr.resource.interpretation[0].coding[0].display }}
    </span>
  {% endif %}
</div>

{% comment %}Value - valueQuantity (with comparator) or valueCodeableConcept{% endcomment %}
{% if entr.resource.valueQuantity %}
  <div class="lab-obs-value">
    {% if entr.resource.valueQuantity.comparator %}{{ entr.resource.valueQuantity.comparator }}{% endif %}{{ entr.resource.valueQuantity.value }} {{ entr.resource.valueQuantity.unit }}
  </div>
{% elsif entr.resource.valueCodeableConcept %}
  <div class="lab-obs-value">
    {% if entr.resource.valueCodeableConcept.text %}
      {{ entr.resource.valueCodeableConcept.text }}
    {% elsif entr.resource.valueCodeableConcept.coding[0].display %}
      {{ entr.resource.valueCodeableConcept.coding[0].display }}
    {% endif %}
  </div>
{% elsif entr.resource.valueString %}
  <div class="lab-obs-value">{{ entr.resource.valueString }}</div>
{% elsif entr.resource.valueBoolean %}
  <div class="lab-obs-value">{{ entr.resource.valueBoolean }}</div>
{% elsif entr.resource.valueInteger %}
  <div class="lab-obs-value">{{ entr.resource.valueInteger }}</div>
{% endif %}

{% comment %}Component values (multi-value observations like blood pressure){% endcomment %}
{% if entr.resource.component %}
  <table class="lab-component-table">
    {% for comp in entr.resource.component %}
      <tr>
        <td>
          {% if comp.code.text %}
            {{ comp.code.text }}
          {% elsif comp.code.coding[0].display %}
            {{ comp.code.coding[0].display }}
          {% endif %}
        </td>
        <td>
          {% if comp.valueQuantity %}
            {% if comp.valueQuantity.comparator %}{{ comp.valueQuantity.comparator }}{% endif %}{{ comp.valueQuantity.value }} {{ comp.valueQuantity.unit }}
          {% elsif comp.valueCodeableConcept %}
            {% if comp.valueCodeableConcept.text %}
              {{ comp.valueCodeableConcept.text }}
            {% elsif comp.valueCodeableConcept.coding[0].display %}
              {{ comp.valueCodeableConcept.coding[0].display }}
            {% endif %}
          {% elsif comp.valueString %}
            {{ comp.valueString }}
          {% endif %}
        </td>
      </tr>
    {% endfor %}
  </table>
{% endif %}

{% comment %}Reference range{% endcomment %}
{% if entr.resource.referenceRange %}
  <div class="lab-obs-detail">
    Ref:
    {% for rr in entr.resource.referenceRange %}
      {% if rr.low and rr.high %}
        {{ rr.low.value }} – {{ rr.high.value }} {{ rr.high.unit | default: "" }}
      {% elsif rr.low %}
        ≥ {{ rr.low.value }} {{ rr.low.unit | default: "" }}
      {% elsif rr.high %}
        ≤ {{ rr.high.value }} {{ rr.high.unit | default: "" }}
      {% endif %}
      {% if rr.text %}({{ rr.text }}){% endif %}
    {% endfor %}
  </div>
{% endif %}

{% comment %Effective date{% endcomment %}
{% if entr.resource.effectiveDateTime %}
  <div class="lab-obs-detail">{{ entr.resource.effectiveDateTime }}</div>
{% endif %}

{% comment %Specimen{% endcomment %}
{% if entr.resource.specimen %}
  {% assign spec = entry | where: "fullUrl", entr.resource.specimen.reference | first %}
  {% if spec %}
    {% assign sp = spec.resource %}
    <div class="lab-obs-footer">
      Specimen:
      {% if sp.type %}
        {% if sp.type.coding[0].display %}{{ sp.type.coding[0].display }}{% endif %}
      {% endif %}
      {% if sp.collection %}
        {% if sp.collection.collectedDateTime %} · Collected: {{ sp.collection.collectedDateTime }}{% endif %}
      {% endif %}
    </div>
  {% endif %}
{% endif %}
```

- [ ] **Step 2: Commit**

```bash
git add apps/visualiser/templates/obs.liquid
git commit -m "feat: rewrite obs.liquid with interpretation accents, comparator, referenceRange, component support"
```

---

### Task 7: Restyle `outcome.liquid`

**Files:**
- Modify: `apps/visualiser/templates/outcome.liquid`

- [ ] **Step 1: Write the restyled outcome template**

Replace the entire contents of `apps/visualiser/templates/outcome.liquid` with:

```liquid
{% comment %}Separate issues by severity{% endcomment %}
{% assign errors = issue | where: "severity", "error" %}
{% assign warnings = issue | where: "severity", "warning" %}
{% assign informations = issue | where: "severity", "information" %}

{% comment %}Status banner{% endcomment %}
{% if errors.size > 0 %}
<div class="lab-outcome-fail">
  <div class="lab-outcome-title">Validation Issues Detected</div>
  <div class="lab-obs-detail">{{ errors.size }} error{{ errors.size | pluralize }}, {{ warnings.size }} warning{{ warnings.size | pluralize }}, {{ informations.size }} informational</div>
</div>
{% else %}
<div class="lab-outcome-pass">
  <div class="lab-outcome-title">Validation Passed</div>
  {% if warnings.size > 0 or informations.size > 0 %}
    <div class="lab-obs-detail">{{ warnings.size }} warning{{ warnings.size | pluralize }}, {{ informations.size }} informational</div>
  {% endif %}
</div>
{% endif %}

<div class="accordion" id="accordionValidation">
  {% comment %}Details accordion{% endcomment %}
  <div class="accordion-item">
    <h2 class="accordion-header" id="headingDetails">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDetails" aria-expanded="false" aria-controls="collapseDetails">
        Details
      </button>
    </h2>
    <div id="collapseDetails" class="accordion-collapse collapse" aria-labelledby="headingDetails" data-bs-parent="#accordionValidation">
      <div class="accordion-body">

        {% comment %}Errors{% endcomment %}
        {% if errors.size > 0 %}
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingErrors">
            <button class="accordion-button error collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseErrors" aria-expanded="false" aria-controls="collapseErrors">
              Errors ({{ errors.size }})
            </button>
          </h2>
          <div id="collapseErrors" class="accordion-collapse collapse" aria-labelledby="headingErrors" data-bs-parent="#collapseDetails">
            <div class="accordion-body">
              {% for error in errors %}
              <div class="lab-issue-card issue-error">
                <span class="lab-issue-code">{{ error.details.coding[0].code }}</span>
                <span class="lab-issue-diagnostics">{{ error.diagnostics }}</span>
                {% if error.location %}<div class="lab-issue-location">{{ error.location }}</div>{% endif %}
              </div>
              {% endfor %}
            </div>
          </div>
        </div>
        {% endif %}

        {% comment %}Warnings{% endcomment %}
        {% if warnings.size > 0 %}
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingWarnings">
            <button class="accordion-button warning collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseWarnings" aria-expanded="false" aria-controls="collapseWarnings">
              Warnings ({{ warnings.size }})
            </button>
          </h2>
          <div id="collapseWarnings" class="accordion-collapse collapse" aria-labelledby="headingWarnings" data-bs-parent="#collapseDetails">
            <div class="accordion-body">
              {% for warning in warnings %}
              <div class="lab-issue-card issue-warning">
                <span class="lab-issue-code">{{ warning.details.coding[0].code }}</span>
                <span class="lab-issue-diagnostics">{{ warning.diagnostics }}</span>
                {% if warning.location %}<div class="lab-issue-location">{{ warning.location }}</div>{% endif %}
              </div>
              {% endfor %}
            </div>
          </div>
        </div>
        {% endif %}

        {% comment %}Information{% endcomment %}
        {% if informations.size > 0 %}
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingInformations">
            <button class="accordion-button information collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseInformations" aria-expanded="false" aria-controls="collapseInformations">
              Information ({{ informations.size }})
            </button>
          </h2>
          <div id="collapseInformations" class="accordion-collapse collapse" aria-labelledby="headingInformations" data-bs-parent="#collapseDetails">
            <div class="accordion-body">
              {% for info in informations %}
              <div class="lab-issue-card issue-information">
                <span class="lab-issue-code">{{ info.details.coding[0].code }}</span>
                <span class="lab-issue-diagnostics">{{ info.diagnostics }}</span>
                {% if info.location %}<div class="lab-issue-location">{{ info.location }}</div>{% endif %}
              </div>
              {% endfor %}
            </div>
          </div>
        </div>
        {% endif %}

      </div>
    </div>
  </div>
</div>
```

Note: The `pluralize` filter is not built into LiquidJS. If it's not available, the template will silently fail on that expression. Since it's cosmetic (e.g., "1 errors" vs "1 error"), it's low priority. If needed, we can add it as a custom filter in `index.html` and `outcome.html`.

- [ ] **Step 2: Commit**

```bash
git add apps/visualiser/templates/outcome.liquid
git commit -m "feat: restyle outcome.liquid with accent-border cards, remove inline styles"
```

---

### Task 8: Update `templates.json` and Clean Up

**Files:**
- Modify: `apps/visualiser/templates.json`

- [ ] **Step 1: Update templates.json with proper mappings**

Replace the entire contents of `apps/visualiser/templates.json` with:

```json
{
  "templates": [
    {
      "resourceType": "Bundle",
      "template": "bundlelab.liquid",
      "query": "",
      "querydescription": "Lab report Bundle viewer — renders Composition, Patient, DiagnosticReport, Observation, Specimen, Organization, ServiceRequest, and other EU Lab resources"
    },
    {
      "resourceType": "OperationOutcome",
      "template": "outcome.liquid",
      "query": "",
      "querydescription": "Validation outcome viewer — renders errors, warnings, and information from $validate operations"
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/visualiser/templates.json
git commit -m "feat: update templates.json with Bundle and OperationOutcome mappings"
```

---

### Task 9: Manual Verification Against Live Server

**Files:** None (verification only)

- [ ] **Step 1: Start the Docker stack**

```bash
cd /Users/joaoalmeida/Desktop/hl7Europe/sandboxes/viz-lab && docker compose up -d
```

Wait for the server to be ready (check `docker compose logs -f fhir-server` until it shows started).

- [ ] **Step 2: Test with SimpleChemistryResultReport bundle**

Open in browser:
```
http://localhost:8282/laboratory/apps/visualiser/index.html?url=https://sandbox.hl7europe.eu/laboratory/fhir/Bundle/SimpleChemistryResultReport
```

Verify:
- Composition hero card renders with blue left border, title, status badge, author names
- Patient strip displays name, gender initial, birthDate, identifiers
- DiagnosticReport card appears
- Observations render with accent borders (green for normal, red for high)
- Reference ranges display when present
- Specimen footer shows in observations that reference specimens

- [ ] **Step 3: Test with HepatitisPanel bundle**

Open:
```
http://localhost:8282/laboratory/apps/visualiser/index.html?url=https://sandbox.hl7europe.eu/laboratory/fhir/Bundle/BundleHepatitisPanel
```

Verify:
- hasMember nested observations display with indentation
- valueCodeableConcept renders correctly (Positive/Negative)
- Interpretation badges (Normal, Abnormal) display with correct colors

- [ ] **Step 4: Test with MicroCultureSusc bundle**

Open:
```
http://localhost:8282/laboratory/apps/visualizer/index.html?url=https://sandbox.hl7europe.eu/laboratory/fhir/Bundle/BundleLabResultMicroCultureSusc
```

Verify:
- Deeply nested hasMember (3 levels) renders
- valueQuantity with comparator (e.g., `<= 2`, `> 4`) displays correctly
- Susceptible/Resistant interpretation colors work

- [ ] **Step 5: Test with the IT CDA bundle (has sub-sections)**

Open:
```
http://localhost:8282/laboratory/apps/visualiser/index.html?url=https://sandbox.hl7europe.eu/laboratory/fhir/Bundle/IT-CDA2FHIR-17e2cad1-c3e3-4901-adb1-c35a0b82b883
```

Verify:
- Composition sections with sub-sections render correctly
- Multiple Practitioner/PractitionerRole/Organization resources display in Supporting Resources

- [ ] **Step 6: Test outcome.html with validation**

Use the outcome page URL to validate a bundle. Verify the accordion renders with the new accent-border styling.

- If any visual issues are found, fix the relevant template or CSS and commit.

---

### Task 10: LiquidJS `pluralize` Filter (Optional Enhancement)

**Files:**
- Modify: `apps/visualiser/index.html`
- Modify: `apps/visualiser/outcome.html`

The `outcome.liquid` template uses `| pluralize` which is not a built-in LiquidJS filter. This is cosmetic. If needed, add a custom filter.

- [ ] **Step 1: Add pluralize filter to `index.html` and `outcome.html`**

In `index.html`, after `var engine = new liquidjs.Liquid()`, add:

```javascript
engine.registerFilter('pluralize', function(v) {
  if (typeof v === 'number' && v !== 1) return 's';
  return '';
});
```

In `outcome.html`, after `var engine = new liquidjs.Liquid()`, add the same registration.

- [ ] **Step 2: Commit**

```bash
git add apps/visualiser/index.html apps/visualiser/outcome.html
git commit -m "feat: add pluralize LiquidJS filter for outcome template"
```

---

### Task 11: Remove Stale Local Bootstrap 4 Assets (Optional Cleanup)

**Files:**
- Remove: `apps/assets/bootstrap/` directory (local BS4 distribution)
- Remove: `apps/assets/js/popper.min.js` (standalone Popper, now in BS5 bundle)

- [ ] **Step 1: Verify no other HTML files reference these**

```bash
grep -r "assets/bootstrap" apps/ && grep -r "popper.min.js" apps/
```

If no files reference them after our BS5 migration, proceed to remove.

- [ ] **Step 2: Remove stale assets**

```bash
rm -rf apps/assets/bootstrap/
rm -f apps/assets/js/popper.min.js
git add apps/assets/
git commit -m "chore: remove stale Bootstrap 4 local assets after BS5 migration"
```