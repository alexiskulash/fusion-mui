# CRM Components Test Suite

This directory contains unit tests for the CRM user management components.

## Test Files

### CrmUserEditModal.test.tsx
Comprehensive unit tests for the user edit modal component.

**Test Coverage:**
- ✅ Modal rendering (open/closed states)
- ✅ Display of user information
- ✅ Form field editing
- ✅ Form submission
- ✅ API success handling
- ✅ API error handling  
- ✅ Network error handling
- ✅ Loading states
- ✅ Form validation
- ✅ Avatar display
- ✅ Username readonly field
- ✅ Field change handlers
- ✅ API payload validation

**Total Tests:** 14 tests

### CrmUsersTable.test.tsx
Comprehensive unit tests for the users table component with DataGrid.

**Test Coverage:**
- ✅ Table rendering
- ✅ Data fetching on mount
- ✅ User information display
- ✅ Search functionality
- ✅ API error handling
- ✅ Pagination
- ✅ Edit modal integration
- ✅ Error alert dismissal
- ✅ Data refresh after updates
- ✅ Query parameter validation
- ✅ Gender chip rendering
- ✅ Avatar display
- ✅ Empty search results handling

**Total Tests:** 13 tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Configuration

Tests are configured using:
- **Jest** - Test runner
- **React Testing Library** - Component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - DOM matchers

### Configuration Files
- `jest.config.ts` - Jest configuration
- `jest.setup.ts` - Test environment setup
- `__mocks__/fileMock.js` - Asset mocking

## Best Practices

1. **Async Handling** - All async operations use `waitFor` from React Testing Library
2. **User Events** - User interactions use `userEvent` instead of `fireEvent` for more realistic testing
3. **API Mocking** - Global fetch is mocked for API calls
4. **Accessibility** - Tests use accessible queries (getByRole, getByLabelText)
5. **Cleanup** - Tests clean up mocks between runs using `beforeEach`/`afterEach`

## Future Improvements

- Add integration tests for the full user management workflow
- Add visual regression tests
- Increase coverage for edge cases
- Add performance benchmarks
