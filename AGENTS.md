## Project

HL7 EU FHIR Laboratory sandbox — a Docker-based HAPI FHIR server with web apps for browsing, visualizing, and generating FHIR laboratory data. Based on [unicom-test-lab](https://github.com/unicom-project-eu/UNICOM-test-lab).

## Architecture

```
viz-lab/
├── docker-compose.yml      # HAPI FHIR server + PostgreSQL + ember IG uploader
├── web/                    # Custom HAPI welcome page (served at /custom)
│   ├── welcome.html
│   ├── logo.jpg
│   └── favicon.ico
├── apps/                   # Web apps served by HAPI at /apps
│   ├── index.html          # Landing page (Markdown → HTML via showdown)
│   ├── prodbrowser.html    # Laboratory Data Browser
│   ├── datagen.html        # Data Generation (nunjucks + PapaParse + Handlebars)
│   ├── server_mgmt.html   # Server management
│   ├── header.html         # Shared header (SSI include)
│   ├── visualiser/         # FHIR resource visualiser using LiquidJS templates
│   │   ├── index.html      # Entry point — takes ?url= param, renders via LiquidJS
│   │   ├── bundle.html     # Bundle-specific viewer
│   │   ├── outcome.html    # OperationOutcome viewer
│   │   ├── templates/      # LiquidJS templates (*.liquid)
│   │   │   ├── bundlelab.liquid
│   │   │   ├── obs.liquid
│   │   │   ├── outcome.liquid
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

- HAPI FHIR on `http://localhost:8282/laboratory/fhir` (host) / `http://fhir-server:8080/laboratory/fhir` (internal)
- IGs auto-loaded: hl7.fhir.eu.laboratory v0.1.1, hl7.fhir.eu.extensions v0.1.0, hl7.fhir.uv.ips v1.0.0
- PostgreSQL backend: `db:5432`, database `hapi`, user/password `admin/admin`

## Key Files

- `docker-compose.yml` — Full stack config; HAPI env vars, IG installs, volumes
- `apps/visualiser/index.html` — Visualiser entry, reads `?url=` param, renders via LiquidJS template
- `apps/visualiser/templates.json` — Maps resourceType to LiquidJS template + FHIR search query
- `apps/visualiser/templates/*.liquid` — LiquidJS rendering templates
- `apps/config.json.example` — Config template (gitignored: `*config.json`)

## Gotchas

- `config.json` is gitignored (`*config.json` pattern) — copy from `config.json.example`
- `data/` directory (PostgreSQL data) and `fhir-outputs/` are gitignored
- The visualiser's `templates.json` query/resourceType mapping is currently hardcoded in `index.html` — the commented-out `$.getJSON('templates.json', ...)` block is not active
- Web apps are served by HAPI via `hapi.fhir.custom_content_path=/custom` and `hapi.fhir.app_content_path=/apps`
- `rest.http` is for IntelliJ HTTP Client (not a plain REST endpoint)
- The project has no build step — it's static HTML/JS served directly by the FHIR server

## Testing

No automated test suite. Manual testing via:
- Browser: `http://localhost:8282/laboratory/` → welcome page → apps
- Visualiser: `apps/visualiser/index.html?url=./resources/Bundle-005-CanifugCremolum-EE-FullProduct.json`
- REST: use `rest.http` in IntelliJ / VS Code REST Client