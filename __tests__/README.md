# Test Suite Configuration

This project uses Jest with **dual environment support** to handle different types of tests:

## Test Environment Setup

### 🔧 **Node Environment** (.test.ts files)

- **Purpose**: API routes, database operations, utility functions
- **Environment**: Node.js (no DOM)
- **Tests**: `location.test.ts`, `mapLocationDto.test.ts`

### 🌐 **JSdom Environment** (.test.tsx files)

- **Purpose**: React components, DOM interactions
- **Environment**: JSdom (simulated browser)
- **Tests**: `register.test.tsx`, `profile.test.tsx`, `login.test.tsx`
- **Setup**: `jest.setup.jsdom.js` (includes React Testing Library DOM matchers)

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- register.test.tsx
npm test -- profile.test.tsx
npm test -- login.test.tsx
npm test -- location.test.ts
npm test -- mapLocationDto.test.ts

# Run tests with specific pattern
npm test -- --testNamePattern="login"

# Run with coverage
npm test -- --coverage
```

## Test Categories

### 📦 **Unit Tests**

- **mapLocationDto.test.ts**: Utility function tests (100% coverage)
- **register.test.tsx**: React registration component tests (100% coverage)
- **profile.test.tsx**: Server-side React profile component tests (100% coverage)
- **login.test.tsx**: React login component tests with error handling (100% coverage)

### 🔗 **Integration Tests**

- **location.test.ts**: API route tests with database integration

## Current Test Coverage

- ✅ **40 tests total** (all passing)
- ✅ **99.16% overall code coverage**
- ✅ **5 test suites** across 2 environments

## Recent Enhancements

### Login Component Improvements ✨

- **Added comprehensive error handling** for signIn failures
- **Loading states** with disabled inputs during authentication
- **Error display** with user-friendly messages
- **Form validation** and edge case coverage
- **Complete test coverage** including error scenarios

### Test Capabilities 🧪

- **Mock authentication** with NextAuth.js
- **Error simulation** and graceful handling verification
- **Loading state testing** with async operations
- **Form interaction testing** with React Testing Library
- **CSS and accessibility validation**

## Configuration Files

- **jest.config.ts**: Multi-project Jest configuration
- **jest.setup.jsdom.js**: React Testing Library setup for component tests
- \***\*tests**/\*\*: All test files following naming convention

## Register Page Test Suite

The `register.test.tsx` includes 11 comprehensive tests covering:

### Component Rendering

- ✅ Renders all form elements correctly
- ✅ Validates form field attributes (required, types)
- ✅ Checks form structure and styling

### User Interactions

- ✅ Updates input values when typing
- ✅ Maintains component state correctly during user interaction
- ✅ Form submission with empty fields (HTML5 validation)

### API Integration

- ✅ Successful form submission and redirect
- ✅ Error handling for failed registration
- ✅ Default error message display

### Form Validation

- ✅ Email field with proper type and validation
- ✅ Password field with proper type and validation
- ✅ Pseudo field with proper type and validation

## Testing Stack

- **Jest** - Test runner and assertions
- **React Testing Library** - Component testing utilities
- **User Event** - Realistic user interaction simulation
- **Jest DOM** - Additional DOM matchers
- **JSdom** - Browser environment simulation (for React tests)
- **Prisma** - Database testing (for API tests)

The configuration ensures that each test runs in the appropriate environment for optimal performance and compatibility.

## ProfilePage Test Suite

The `profile.test.tsx` includes 9 comprehensive tests covering:

### Authentication & Authorization

- ✅ Renders user profile when authenticated session exists
- ✅ Shows access denied message when no session exists
- ✅ Calls getServerSession with correct authOptions

### Data Handling & Edge Cases

- ✅ Handles missing user data gracefully
- ✅ Handles partial user data correctly
- ✅ Handles null user object properly
- ✅ Handles getServerSession errors appropriately

### UI & Structure

- ✅ Displays user information in correct format with proper HTML structure
- ✅ Has correct CSS classes and styling structure

This test suite achieves **100% code coverage** and thoroughly tests the server-side authentication flow using NextAuth.js.
