# Smart Campus Intelligence: Predict, Optimize & Improve Student Success
**Aligned with the KPMG Student Analytics Brief**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg?style=flat&logo=next.js)](https://nextjs.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0+-red.svg?style=flat)](https://xgboost.readthedocs.io)
[![TreeSHAP](https://img.shields.io/badge/Explainability-TreeSHAP-blue.svg?style=flat)](https://shap.readthedocs.io)
[![Python](https://img.shields.io/badge/Python-3.10+-yellow.svg?style=flat&logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)

---

## 1. Executive Summary & KPMG Brief Alignment

Smart Campus Intelligence is an enterprise-grade academic analytics platform designed to solve student retention, multi-dimensional risk identification, and placement readiness across engineering institutions.

### Core Capabilities:
1. **Deterministic 5-Domain Success Formula**: Continuous normalized index bounded strictly between `0.00` and `100.00`.
2. **Dual XGBoost Risk Classifier**: Independent inference of Academic Risk and Placement Risk with hard boundary rules.
3. **Local Explainability (XAI)**: Exact local Shapley value attributions via TreeSHAP with directional badges (`+Risk` vs `Support`).
4. **Behavioral Personas (K-Means, K=4)**: Archetype segmentation separating high-potential unpolished gems from attendance-deficient talents.
5. **Interactive What-If Digital Twin**: Sub-50ms simulation engine with 250ms debounced parameter experimentation.
6. **Statutory Attendance Margin**: Quantitative integer cushion/deficit calculation against university regulations.
7. **Closed-Loop Accountability**: High-risk flags linked directly to prescriptive intervention workflows.
8. **Role-Based Access Control (RBAC)**: Distinct authenticated surfaces for Administrators, Faculty Advisors, and Students.

---

## 2. Institutional Credentials & Access Surfaces

| Role | Email Identifier | Password | Access Surface | Focal Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@campus.edu` | `Admin@2026` | `/admin` | Executive Risk Command, Dept Benchmarks, Sync Operations |
| **Faculty Advisor** | `faculty@campus.edu` | `Faculty@2026` | `/faculty` | Cohort Rosters, Statutory Margin Deficits, Batch Notices |
| **Student (Exemplar)** | `student@campus.edu` | `Student@2026` | `/students/STU-2024-001` | Personal Success Score, TreeSHAP strengths, Digital Twin |
| **Student (At-Risk)** | `atrisk.student@campus.edu` | `Student@2026` | `/students/STU-2024-003` | Deficit Margin Alerts, Backlog Clearance Roadmap |

> **Quick 1-Click Login:** The `/login` page provides quick-fill preset buttons for each role to facilitate instant demonstrations.

## 2. Mathematical Formulations

### 2.1 Master Success Score
$$\text{Success Score} = (0.40 \times \text{Academic Index}) + (0.30 \times \text{Engagement Index}) + (0.30 \times \text{Placement Readiness Index})$$

- **Academic Index (40%)**:
  $$\text{Academic Index} = (\text{CGPA} \times 10 \times 0.70) + (\max(0, 100 - \text{backlogs} \times 20) \times 0.30)$$
- **Engagement Index (30%)**:
  $$\text{Engagement Index} = (\text{Attendance\%} \times 0.40) + (\text{Assignment\%} \times 0.40) + (\min(\text{Certs}, 5) \times 20 \times 0.20)$$
- **Placement Readiness Index (30%)**:
  $$\text{Placement Index} = (\text{Coding Score} \times 0.40) + (\text{Aptitude Score} \times 0.30) + (\min(\text{Mocks}, 5) \times 20 \times 0.30)$$

### 2.2 Statutory Attendance Margin Health Formula
$$\text{Margin} = \left\lfloor \frac{\text{Attended Classes} - (0.75 \times \text{Total Classes})}{0.75} \right\rfloor$$
- **Margin $\ge 0$**: Buffer of future lectures student can safely skip without falling below 75%.
- **Margin $< 0$**: Statutory deficit. Consecutive lectures needed to regain compliance:
  $$k = \left\lceil \frac{0.75 \times \text{Total Classes} - \text{Attended Classes}}{0.25} \right\rceil$$

### 2.3 Dual XGBoost Risk Tiers
- **High Risk**: Risk Probability $\ge 0.60$ OR Attendance $< 75.0\%$ OR Backlogs $\ge 2$
- **Medium Risk**: $0.35 \le \text{Risk Probability} < 0.60$
- **Low Risk**: $\text{Risk Probability} < 0.35$

### 2.4 Behavioral Personas (K-Means, K=4)
- **Cluster 0: High Academic / Placement Ready** (Exemplars: High CGPA, High Technical, Safe Attendance)
- **Cluster 1: Unpolished Gems** (High CGPA $\ge 7.8$, Practical Coding $< 60\%$)
- **Cluster 2: Disengaged Talents** (High Tech Aptitude $\ge 75\%$, Attendance $< 75\%$, Margin $< 0$)
- **Cluster 3: Critical Academic Support Needed** (Backlogs $\ge 2$, Low CGPA, Multi-Risk)

---

## 3. Directory Canon

```
smart-campus-intelligence/
├── .vscode/                                 # launch.json, tasks.json, settings.json
├── database/                                # schema.sql, seeds.sql, rls_policies.sql, seed_generator.py
├── backend/                                 # PYTHON FASTAPI ENGINE
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── train_models.py                      # Synthetic training & artifact serialization
│   ├── models/                              # xgb_risk_model.pkl, scaler.pkl, kmeans_segmentation.pkl, model_features.pkl
│   ├── app/
│   │   ├── main.py                          # Router mounts, CORS middleware, global health checks
│   │   ├── config.py                        # Pydantic BaseSettings
│   │   ├── core/                            # database.py (sessionmaker), security.py (RBAC / Auth)
│   │   ├── models/                          # SQLAlchemy ORM: student.py, indicators.py, score.py, intervention.py, feedback.py
│   │   ├── schemas/                         # Pydantic DTOs: common.py, admin.py, faculty.py, student.py, simulation.py, intervention.py, outreach.py
│   │   ├── services/                        # Core Analytics: scoring_engine, ml_service, explainability_engine, clustering_engine, simulation_engine, resource_allocator
│   │   └── api/                             # v1 endpoints: admin.py, faculty.py, student.py, xai.py, simulator.py, interventions.py
│   └── tests/                               # test_scoring.py, test_simulation.py, test_api_endpoints.py
└── frontend/                                # NEXT.JS 14 APP ROUTER
    ├── package.json, tsconfig.json, tailwind.config.ts, next.config.mjs
    └── src/
        ├── types/                           # Typed contracts: common.ts, admin.ts, faculty.ts, student.ts, intervention.ts
        ├── lib/api/                         # client.ts (Fetch wrapper pointing to NEXT_PUBLIC_API_BASE_URL)
        ├── components/                      # ui/ (Button, Card, Slider, Table), layout/ (Shell, Sidebar, TopHeader), shared/ (KpiCard, RiskBadge, ScoreGauge)
        ├── modules/                         # admin/, faculty/, profile/, interventions/, student/, methodology/, data-management/
        └── app/                             # admin/page.tsx, faculty/page.tsx, student/page.tsx, students/[id]/page.tsx, interventions/page.tsx
```

---

## 4. Quickstart Guide

### 4.1 Backend Engine Setup
```bash
cd backend
python -m venv .venv
# Activate venv:
# Windows: .venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate

pip install -r requirements.txt

# Train models & seed database
python train_models.py
python ../database/seed_generator.py

# Run FastAPI Server (port 8000)
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger API Documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 4.2 Running Backend Test Suite
```bash
cd backend
pytest -v
```

### 4.3 Frontend Next.js Setup
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:3000` to inspect the Executive Analytics Command.

---

## 5. Deployment Guide

- **FastAPI Backend**: Deployable to Render / Railway / AWS ECS using the included `backend/Dockerfile`. Set environment variables `DATABASE_URL` (PostgreSQL) and `CORS_ORIGINS`.
- **Next.js Frontend**: Deployable to Vercel. Set `NEXT_PUBLIC_API_BASE_URL` to your production FastAPI API base URL.
#   c o d e c r a z e  
 