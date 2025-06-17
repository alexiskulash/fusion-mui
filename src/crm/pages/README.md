# CRM Customers Implementation

## Overview

The customers tab has been fully implemented as part of the CRM dashboard. This implementation provides a comprehensive customer management system with the following features:

## Features

### 1. Customer Statistics Dashboard

- **Total Customers**: Display total customer count with trend analysis
- **Active Customers**: Show currently active customers
- **New Customers**: Track new customer acquisitions
- **Customer Satisfaction**: Monitor average customer satisfaction ratings
- All stats include sparkline charts showing historical trends

### 2. Customer Data Table

- **Server-side pagination**: Efficient handling of large customer datasets
- **Real-time search**: Search across customer names, emails, and cities
- **Customer information display**:
  - Profile picture with initials fallback
  - Full name with title and username
  - Contact information (email, phone)
  - Location (city, state)
  - Age with color-coded status
  - Registration date
- **Action buttons**:
  - Email customer (opens default email client)
  - Call customer (opens phone dialer)
  - Edit customer details
  - Delete customer (with confirmation)

### 3. Customer Management Dialog

- **Add new customers**: Complete form for creating new customer records
- **Edit existing customers**: Update customer information
- **Form validation**: Required field validation and email format checking
- **Comprehensive fields**:
  - Personal information (title, name, gender)
  - Account details (email, username, password for new users)
  - Contact information (phone, cell)
  - Address details (street, city, state, country, postal code)

## API Integration

The implementation uses the Builder.io Users API for all data operations:

- **Base URL**: `https://user-api.builder-io.workers.dev/api`
- **GET /users**: Fetch paginated customer list with search
- **POST /users**: Create new customer
- **PUT /users/:id**: Update existing customer
- **DELETE /users/:id**: Delete customer

## Components Architecture

### `/pages/Customers.tsx`

- Main customer page component
- Manages search state and dialog visibility
- Renders stats cards and customer table
- Handles customer creation workflow

### `/components/CustomersTable.tsx`

- Data grid implementation using MUI X DataGrid
- Server-side pagination and search
- Customer action handlers (edit, delete, contact)
- Loading and error state management

### `/components/CustomerDialog.tsx`

- Modal form for customer creation and editing
- Comprehensive form validation
- Dynamic form state management
- API integration for CRUD operations

## Usage

1. **Navigate to Customers**: Click on "Customers" in the CRM sidebar
2. **View Customer Stats**: See overview statistics at the top of the page
3. **Search Customers**: Use the search bar to filter customers by name, email, or city
4. **Add New Customer**: Click "Add Customer" button and fill out the form
5. **Edit Customer**: Click the edit icon in the actions column
6. **Contact Customer**: Use email or phone icons to initiate contact
7. **Delete Customer**: Click delete icon and confirm the action

## Technical Notes

- Uses MUI X DataGrid for advanced table functionality
- Implements proper TypeScript interfaces for type safety
- Follows React best practices with hooks and state management
- Responsive design works on mobile and desktop
- Error handling for API failures
- Loading states for better user experience

## Dependencies

- `@mui/x-data-grid`: Advanced data table functionality
- `@mui/material`: UI components and styling
- `react`: Core React framework
- `typescript`: Type safety and development experience
