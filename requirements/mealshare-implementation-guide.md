# MealShare Implementation Plan (Supabase MVP+)

## 1. Core Infrastructure Setup (Completed)
- [x] 1.1 Authentication System
- [x] 1.2 Database Foundation
- [x] 1.2.4 RLS Policies
- [x] 1.2.5 Profile Trigger

## 2. Enhanced User Management
### 2.1 Role-Based Profile System
- 2.1.1 Create post-login role selection screen
- 2.1.2 Store role in user_profiles table
- 2.1.3 Add profile completion redirect logic
- 2.1.4 Implement basic user dashboard shell

### 2.2 Auth Session Management
- 2.2.1 Set up global auth listener
- 2.2.2 Create session refresh mechanism
- 2.2.3 Implement role-based route protection

## 3. Food Listing System
### 3.1 Listing Creation Flow
- 3.1.1 Build basic listing form (title, description, quantity)
- 3.1.2 Add image upload to Supabase Storage
- 3.1.3 Implement expiry datetime picker
- 3.1.4 Add "Urgent" flag toggle

### 3.2 Geolocation Integration
- 3.2.1 Install PostGIS extension in Supabase
- 3.2.2 Add geography(POINT) column to listings
- 3.2.3 Implement Mapbox map picker component
- 3.2.4 Create address lookup autocomplete

## 4. Bidding Engine
### 4.1 Core Bidding System
- 4.1.1 Create bid submission form
- 4.1.2 Implement bid validation rules
- 4.1.3 Add bidding history table
- 4.1.4 Set up realtime bid updates

### 4.2 Bid Management
- 4.2.1 Create provider bid review interface
- 4.2.2 Implement bid acceptance/rejection
- 4.2.3 Add bid status tracking
- 4.2.4 Setup bid expiration timers

## 5. Payment Integration
### 5.1 Razorpay Setup
- 5.1.1 Create Razorpay developer account
- 5.1.2 Configure API keys in environment
- 5.1.3 Implement payment initiation endpoint
- 5.1.4 Create payment verification workflow

### 5.2 Payment Components
- 5.2.1 Build payment button component
- 5.2.2 Add payment status tracking
- 5.2.3 Implement success/failure handlers
- 5.2.4 Setup basic transaction history

## 6. Delivery Tracking System
### 6.1 Realtime Geolocation
- 6.1.1 Create driver location table
- 6.1.2 Implement location update endpoint
- 6.1.3 Add Mapbox realtime tracking
- 6.1.4 Setup geofence alerts

### 6.2 Delivery Management
- 6.2.1 Create delivery status workflow
- 6.2.2 Implement pickup verification
- 6.2.3 Add delivery confirmation
- 6.2.4 Setup simple rating system

## 7. Notification System
### 7.1 Email Notifications
- 7.1.1 Configure Resend SMTP
- 7.1.2 Create email templates
- 7.1.3 Implement trigger-based sending
- 7.1.4 Setup unsubscribe mechanism

### 7.2 SMS Alerts
- 7.2.1 Integrate Twilio API
- 7.2.2 Create SMS message templates
- 7.2.3 Implement critical alerts
- 7.2.4 Add SMS rate limiting

### 7.3 In-App Notifications
- 7.3.1 Create notifications table
- 7.3.2 Implement realtime bell icon
- 7.3.3 Add mark-as-read functionality
- 7.3.4 Setup notification preferences

## 8. Deployment Preparation
### 8.1 Production Setup
- 8.1.1 Configure Vercel environment
- 8.1.2 Set up required domains
- 8.1.3 Implement basic monitoring
- 8.1.4 Create deployment checklist

### 8.2 Security Finalization
- 8.2.1 Review RLS policies
- 8.2.2 Implement rate limiting
- 8.2.3 Add input sanitization
- 8.2.4 Setup backup strategy

## Implementation Order Recommendation
1. User Management (2)
2. Listings (3)
3. Bidding (4)
4. Payments (5)
5. Notifications (7)
6. Delivery (6)
7. Deployment (8)

## Key Dependencies
* Geolocation required before delivery tracking
* Bidding system before payment integration
* Auth system before all user-facing features
* Database triggers before notifications