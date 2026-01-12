# CrmUsersTable Testing Documentation

## Overview

This document describes the unit tests for the `CrmUsersTable` component, which manages user data with search, pagination, and edit functionality.

## Test Setup

### Dependencies

The tests use the following libraries:
- **Jest**: Testing framework
- **React Testing Library**: React component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers for DOM

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

### 1. Component Rendering
- ✅ Renders component with title "Users Management"
- ✅ Renders search input field
- ✅ Displays loading state initially

### 2. Data Fetching
- ✅ Fetches users from API on component mount
- ✅ Displays fetched users in the DataGrid table
- ✅ Handles network errors gracefully
- ✅ Displays error messages when API returns error status

### 3. Search Functionality
- ✅ Updates search query when typing in search input
- ✅ Fetches users with search query parameter
- ✅ Resets page to 0 when performing a new search

### 4. Pagination
- ✅ Displays total row count correctly
- ✅ Changes page when pagination controls are used
- ✅ Supports different page sizes (5, 10, 25, 50)
- ✅ Updates API calls with correct page parameters

### 5. Edit Functionality
- ✅ Opens edit dialog when edit button is clicked
- ✅ Populates edit form with user data
- ✅ Updates form fields when edited
- ✅ Closes dialog when cancel is clicked
- ✅ Saves user changes via PUT request
- ✅ Displays error when save fails
- ✅ Shows loading state while saving
- ✅ Refreshes user list after successful save

### 6. Data Grid Columns
- ✅ Displays all column headers (Name, Email, Phone, Location, Age, Actions)
- ✅ Formats location correctly (City, State, Country)
- ✅ Displays age from date of birth

### 7. Accessibility
- ✅ Search input has accessible name
- ✅ Edit buttons have accessible labels
- ✅ Dialog has accessible name
- ✅ All interactive elements are keyboard accessible

## Test Data

The tests use mock user data from the Users API with the following structure:

```typescript
{
  login: { uuid, username, password },
  name: { title, first, last },
  email: string,
  phone: string,
  location: { city, state, country, street, postcode },
  dob: { date, age },
  // ... other fields
}
```

## Mock API Responses

### Successful Fetch
```json
{
  "page": 1,
  "perPage": 10,
  "total": 100,
  "data": [...]
}
```

### Error Responses
- Network errors (rejected promise)
- HTTP errors (ok: false)

## Key Testing Patterns

### 1. Async Testing
All API calls are tested using `waitFor` to handle asynchronous behavior:

```typescript
await waitFor(() => {
  expect(screen.getByText('Mr John Doe')).toBeInTheDocument();
});
```

### 2. User Interactions
User interactions use `userEvent` for realistic simulation:

```typescript
const user = userEvent.setup();
await user.type(searchInput, 'john');
```

### 3. Mock Cleanup
All mocks are cleared before each test:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockResolvedValue(...);
});
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Future Test Improvements

1. Add integration tests with real API endpoints
2. Test error boundaries and fallback UI
3. Add performance tests for large datasets
4. Test accessibility with screen readers
5. Add visual regression tests
6. Test mobile responsive behavior
7. Add E2E tests with Cypress or Playwright

## Troubleshooting

### Common Issues

**Issue**: `window.matchMedia is not a function`
- **Solution**: Already handled in `jest.setup.cjs` with mock implementation

**Issue**: Tests timeout
- **Solution**: Increase Jest timeout or check async operations

**Issue**: DataGrid rendering errors
- **Solution**: Ensure `jest-environment-jsdom` is properly configured

## Contributing

When adding new features to `CrmUsersTable`, please:
1. Add corresponding unit tests
2. Maintain test coverage above 80%
3. Update this documentation
4. Run all tests before submitting PR
