# CargoSync 🚛
### Real-Time Freight Intelligence Platform

> 🚧 Currently in active development — follow along as this gets built from scratch.

A production-grade, multi-tenant SaaS platform for freight brokers to manage loads, track carriers in real time, automate document processing with AI, and predict delivery ETAs — built for the Canadian logistics market.

---

## The Problem

Small-to-mid freight brokers manage hundreds of shipments through phone calls, spreadsheets, and outdated TMS software built in the 2000s. They have no real-time carrier visibility, no automated document processing, and no predictive intelligence. CargoSync solves all three.

---

## Key Features

- **Real-Time Load Tracking** — Live GPS with geofencing that auto-updates load status when carriers arrive at pickup, cross the border, or complete delivery
- **AI Document Processing** — Upload a Bill of Lading photo; AI extracts all structured data automatically (shipper, consignee, weight, commodity, PRO number)
- **Predictive ETA Engine** — ML model flags at-risk deliveries before they're late based on historical lane data, carrier performance, and weather
- **Event-Driven Architecture** — Apache Kafka powers all service communication; every load event triggers the right downstream action automatically
- **Multi-Tenant Portal** — Each brokerage has isolated data, custom roles (admin, dispatcher, carrier, shipper), and their own dashboard
- **Automated Invoicing** — Delivery triggers automatic invoice generation and payment tracking

---

## Tech Stack

**Backend**
- Node.js + Express.js (microservices architecture)
- Apache Kafka (event streaming)
- MongoDB (loads, documents, tenant data)
- PostgreSQL (auth, billing)
- Redis (real-time tracking, caching)

**Frontend**
- React 18 + Vite
- React Query (server state)
- Mapbox GL (live tracking map)
- Recharts (analytics dashboard)

**Infrastructure**
- Docker + Docker Compose (local dev)
- AWS ECS Fargate (production)
- GitHub Actions (CI/CD)
- Terraform (infrastructure as code)

---

## Architecture

```
Client (React)
     |
API Gateway (Express)
     |
┌────┴─────────────────────────────┐
│              Kafka               │
└──┬──────┬──────┬────────┬────────┘
   │      │      │        │
 Load  Track  Document  Notify
  SVC   SVC     SVC      SVC
   │      │      │        │
Mongo  Redis   S3+AI    SES/SMS
```

---

## Development Progress

- [x] Project architecture designed
- [ ] Monorepo setup + Docker environment
- [ ] Auth Service (JWT + Google OAuth)
- [ ] Load Service (core domain)
- [ ] React frontend — load board
- [ ] Kafka integration
- [ ] Real-time tracking + WebSockets
- [ ] AI document processing
- [ ] AWS deployment
- [ ] CI/CD pipeline

---

## Local Setup

> Coming soon as development progresses.

---

## Why I Built This

This project exists to demonstrate production-level engineering — not just that I can write code, but that I understand system design, distributed architecture, event-driven patterns, and cloud deployment. Every technical decision in this codebase has a reason behind it.

---

## Follow the Build

I'm documenting the entire build process on LinkedIn. Connect with me there if you want to follow along week by week.

---

*Built with Node.js · React · Kafka · MongoDB · AWS*
