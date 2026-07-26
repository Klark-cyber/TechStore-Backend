# TechStore

> A full-stack e-commerce platform for browsing, purchasing, and managing electronics — built with a REST API architecture, secure cookie-based authentication, and a server-rendered admin panel.

## Overview

TechStore is an electronics e-commerce platform built with React, Express, and MongoDB. The platform enables customers to browse products by category, manage a cart, complete checkout, track order status, and rate purchased products — while store administrators manage inventory and users through a dedicated, server-rendered admin panel.

## Key Features

### Member
- Browse products by category, brand, and price
- Product search and filtering
- Product detail view with image gallery
- Shopping cart (persisted client-side)
- Checkout and order creation
- Order tracking across Paused / In Progress / Finished states
- Verified-purchase product rating (only after an order reaches Finished status)
- Profile management (username, phone, address, description, profile photo, password)
- Top Users leaderboard based on activity points

### Admin
- Server-rendered admin panel (EJS)
- Product creation and management
- Member account management
- Session-based admin authentication, isolated from customer authentication

## Tech Stack

**Frontend:** React, TypeScript, React Router, Redux, Material UI (MUI), MUI Joy, Axios

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT Authentication, bcryptjs, Multer, EJS, express-session (admin panel), connect-mongodb-session

## Authentication

Two independent authentication systems, isolated by role:

- **Customers:** JWT stored in a signed, httpOnly cookie (`accessToken`), issued on signup/login and validated on protected routes
- **Admin panel:** Traditional server-side session (`express-session`, MongoDB-backed session store), isolated from the customer-facing token flow

## API Architecture

- RESTful API over Express routers
- Multer-based multipart handling for image uploads (product images, profile photos)
- Role-based middleware guarding admin-only and authenticated-only routes

## Database

members, products, orders, orderItems, reviews

## Architecture Patterns

- MVC (Model-View-Controller: Mongoose schemas / Express controllers / EJS views for the admin panel)
- Middleware-based request guarding (`verifyAuth`, `verifyAdmin`)
- Service-layer separation (business logic isolated from controllers)

## Deployment

- Frontend: Vercel
- Backend: DigitalOcean VPS (PM2, Nginx, SSL via Let's Encrypt)

## Development Workflow

- Git
- GitHub
- master / develop branches

## Project Highlights

- REST API with strict role-based access control
- Verified-purchase gating on product reviews (prevents rating without a completed order)
- Cookie-based JWT authentication, separated from a session-based admin system
- Responsive, mobile-first UI across all pages
- Dark-themed, custom Material UI design system
- PM2 + Nginx + SSL production deployment on a self-managed VPS
