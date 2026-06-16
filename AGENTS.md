## Project

HL7 EU FHIR Medication Prescription & Dispense (MPD) sandbox — a Docker-based HAPI FHIR server with web apps for browsing, visualizing, and validating FHIR MPD data. Based on [viz-lab](https://github.com/hl7-eu/viz-lab).

## Architecture

```
viz-mpd/
├── docker-compose.yml      # HAPI FHIR server + PostgreSQL + ember IG uploader
├── web/                    # Custom HAPI welcome page (served at /custom)
│   ├── welcome.html
│   ├── logo.jpg
│   └── favicon.ico
├── apps/                   # Web apps served by HAPI at /apps
│   ├── index.html          # Landing page (Markdown → HTML via showdown)
│   ├── prodbrowser.html    # MPD Data Browser (lists MedicationRequest & MedicationDispense)
│   ├── datagen.html        # Data Generation (nunjucks + PapaParse + Handlebars)
│   ├── server_mgmt.html   # Server management
│   ├── header.html         # Shared header (SSI include)
│   ├── visualiser/         # FHIR resource visualiser using LiquidJS templates
│   │   ├── index.html      # Entry point — takes ?url= param, renders via LiquidJS
│   │   ├── bundle.html     # Bundle-specific viewer
│   │   ├── outcome.html    # OperationOutcome viewer
│   │   ├── templates/      # LiquidJS templates (*.liquid)
│   │   │   ├── bundlempd.liquid    # MPD Bundle viewer (RequestGroup, MedicationRequest, MedicationDispense, Patient, etc.)
│   │   │   ├── medrequest.liquid    # MedicationRequest sub-template
│   │   │   ├── meddispense.liquid   # MedicationDispense sub-template
│   │   │   ├── outcome.liquid       # Validation outcome viewer
│   │   │   ├── dump.liquid
│   │   │   └── debug.liquid
│   │   ├── templates.json  # Maps resourceType → template + FHIR query
│   │   └── resources/      # Sample FHIR Bundles (local test data)
│   ├── assets/             # Shared CSS/JS (Bootstrap, jQuery, LiquidJS)
│   └── config.json.example # Example: { "ig_url": "...", "server_url": "..." }
└── rest.http               # IntelliJ HTTP client requests
```

## Commands

```bash
# Start the full stack (HAPI FHIR + PostgreSQL + ember IG uploader)
docker compose up -d

# Rebuild after docker-compose.yml changes
docker compose up -d --build

# Stop all services
docker compose down

# View logs
docker compose logs -f fhir-server
```

### FHIR Server

- HAPI FHIR on `http://localhost:8281/mpd/fhir` (host) / `http://fhir-server:8080/mpd/fhir` (internal)
- IGs auto-loaded: `hl7.fhir.eu.mpd` v1.0.0, `hl7.fhir.eu.base` v2.0.0, `hl7.fhir.eu.extensions.r4` v1.3.0, `hl7.fhir.uv.ips` v1.0.0
- PostgreSQL backend: `db:5432`, database `hapi`, user/password `admin/admin`
- Container: `MPD` (fhir-server), `db_vizmpd` (PostgreSQL), `ember-mpd` (IG uploader)

## Key Files

- `docker-compose.yml` — Full stack config; HAPI env vars, IG installs, volumes
- `apps/visualiser/index.html` — Visualiser entry, reads `?url=` param, renders via LiquidJS template
- `apps/visualiser/templates.json` — Maps resourceType to LiquidJS template + FHIR search query
- `apps/visualiser/templates/bundlempd.liquid` — Main MPD Bundle rendering template
- `apps/visualiser/templates/medrequest.liquid` — MedicationRequest rendering sub-template
- `apps/visualiser/templates/meddispense.liquid` — MedicationDispense rendering sub-template
- `apps/assets/js/productlist.js` — Product browser: queries MedicationRequest & MedicationDispense directly
- `apps/config.json.example` — Config template (gitignored: `*config.json`)

## MPD Resource Types

The visualiser handles these EU MPD profile resources:
- **MedicationRequest** — Prescription items (ePrescription)
- **MedicationDispense** — Dispense events
- **Medication** — Medication definitions (branded, generic, combination packs)
- **RequestGroup** — Multi-item prescription orchestration
- **Patient**, **PractitionerRole**, **Organization** — Supporting resources
- **OperationOutcome** — Validation results

## Gotchas

- `config.json` is gitignored (`*config.json` pattern) — copy from `config.json.example`
- `data/` directory (PostgreSQL data) and `fhir-outputs/` are gitignored
- The visualiser's `templates.json` query/resourceType mapping is currently hardcoded in `index.html` — the commented-out `$.getJSON('templates.json', ...)` block is not active
- Web apps are served by HAPI via `hapi.fhir.custom_content_path=/custom` and `hapi.fhir.app_content_path=/apps`
- `rest.http` is for IntelliJ HTTP Client (not a plain REST endpoint)
- The project has no build step — it's static HTML/JS served directly by the FHIR server
- The product browser queries MedicationRequest and MedicationDispense resources directly (not Bundle→Composition like viz-lab)
- Docker host port is `8281` (not `8282` like viz-lab) to allow both sandboxes to run simultaneously

## Testing

No automated test suite. Manual testing via:
- Browser: `http://localhost:8281/mpd/` → welcome page → apps
- Visualiser: `apps/visualiser/index.html?url=./resources/Bundle-100A-multiitem-prescription-with-orchestration.json`
- REST: use `rest.http` in IntelliJ / VS Code REST Client