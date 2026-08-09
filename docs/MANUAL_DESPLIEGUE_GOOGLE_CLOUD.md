# ☁️ Manual de Despliegue en Google Cloud Run

Este documento detalla el procedimiento de empaquetado y despliegue serverless en la nube de Google Cloud Platform (GCP).

---

## 1. Prerrequisitos en GCP

- Proyecto en GCP activo: `cs-project-mjozmzeg`
- Google Cloud SDK CLI (`gcloud`) autenticado:
  ```bash
  gcloud auth login
  gcloud config set project cs-project-mjozmzeg
  ```

---

## 2. Construcción y Despliegue

La aplicación cuenta con un archivo `Dockerfile` optimizado en 3 etapas (`deps`, `builder`, `runner`) dentro de la carpeta `web/`.

Para desplegar en Cloud Run directamente desde el código fuente:
```bash
gcloud run deploy dao-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --quiet
```

---

## 3. URL de Producción

Servicio desplegado y verificado:
🌐 **https://dao-app-164795413515.us-central1.run.app**
