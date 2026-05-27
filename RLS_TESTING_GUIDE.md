# RLS (Row Level Security) Testing Guide

## Overview
This guide documents the automated testing procedures for verifying Row Level Security policies in the application.

## Test Suites

### 1. Parent Access Tests
Verifies that parents can only access their own children's data.

**Test Cases:**
- ✓ Parent can view own children
- ✓ Parent cannot view other parent's children
- ✓ Parent can view own children's progress
- ✓ Parent can update own children's settings
- ✓ Parent cannot modify other children's data

### 2. Child Access Tests
Verifies that children can only access their own data.

**Test Cases:**
- ✓ Child can view own progress
- ✓ Child cannot view other child's progress
- ✓ Child can update own achievements
- ✓ Child cannot modify other child's coins
- ✓ Child can view own inventory

### 3. Cross-Household Tests
Verifies complete isolation between different households.

**Test Cases:**
- ✓ Parent A cannot access Parent B's children
- ✓ Child A cannot access Child B's data (different households)
- ✓ Messages are restricted to parent-child pairs
- ✓ Leaderboard shows only appropriate data
- ✓ No data leakage across households

### 4. Edge Case Tests
Tests unusual scenarios and potential security vulnerabilities.

**Test Cases:**
- ✓ Unauthenticated access is denied
- ✓ Invalid child_id in session is rejected
- ✓ Expired sessions are handled properly
- ✓ SQL injection attempts are blocked
- ✓ Malformed requests are rejected

## Running Tests

### Via Admin Panel
1. Navigate to Admin Panel
2. Go to "Security" tab
3. Click "RLS Test Runner"
4. Select test suite or run all tests
5. Review results

### Via Edge Function
```typescript
const { data, error } = await supabase.functions.invoke('rls-test-runner', {
  body: { 
    action: 'runTests', 
    testSuite: 'all' // or 'parent', 'child', 'crossHousehold', 'edgeCases'
  }
});
```

## Test Data Setup

### Creating Test Environment
```sql
-- Run the migration
psql -f supabase/migrations/20240127_rls_test_setup.sql

-- Verify test data
SELECT * FROM parent_profiles WHERE email LIKE 'test_%';
SELECT * FROM children WHERE parent_id IN (
  SELECT id FROM parent_profiles WHERE email LIKE 'test_%'
);
```

## Expected Results

### All Tests Should Pass
- Total Tests: ~25-30
- Passed: 100%
- Failed: 0

### If Tests Fail
1. Review the specific test failure
2. Check RLS policies on affected table
3. Verify helper functions (get_parent_profile, is_parent_of_child)
4. Check session context setup
5. Review migration files

## Security Requirements

### Critical Rules
1. **Parent Isolation**: Parents can ONLY access their own children
2. **Child Isolation**: Children can ONLY access their own data
3. **No Cross-Household Access**: Complete isolation between families
4. **Authentication Required**: All access requires valid auth token
5. **Session Validation**: child_id in session must be valid

### Tables with RLS
- parent_profiles
- children
- user_progress
- child_coins
- streaks
- user_achievements
- user_challenges
- leaderboard_entries
- pixel_kingdom_progress
- user_inventory
- messages
- learning_sessions
- scheduled_messages

## Troubleshooting

### Common Issues

**Test fails: "Parent can view other parent's children"**
- Check children table RLS policies
- Verify is_parent_of_child() function
- Ensure parent_id foreign key is set

**Test fails: "Child can access other child data"**
- Check get_current_child_id() function
- Verify session context is set properly
- Review user_progress RLS policies

**All tests fail**
- Verify RLS is enabled on tables
- Check auth.uid() returns valid value
- Ensure test users exist in database

## Continuous Testing

### Automated Testing Schedule
- Run full test suite after each migration
- Run daily automated tests in production
- Run before each deployment
- Run after any RLS policy changes

### Monitoring
- Set up alerts for test failures
- Log all test runs
- Track test performance over time
- Monitor for new edge cases

## Adding New Tests

### Test Template
```typescript
{
  name: 'Test description',
  type: 'parent|child|crossHousehold|edgeCase',
  query: 'SQL query to execute',
  expectedResult: 'success|empty|error',
  description: 'Detailed test description'
}
```

### Best Practices
1. Test both positive and negative cases
2. Include boundary conditions
3. Test with different user roles
4. Verify error messages are appropriate
5. Document expected behavior

## Compliance

### COPPA Compliance
- Children's data is strictly isolated
- Parents have full control over child data
- No unauthorized data sharing
- Audit trail for all access

### GDPR Compliance
- Data access is strictly controlled
- Users can only access their own data
- Deletion cascades properly
- Export functionality respects RLS

## References
- PARENT_CHILD_SCHEMA.md - Schema documentation
- supabase/migrations/20240126_*.sql - RLS policy definitions
- src/components/admin/RLSTestRunner.tsx - Test UI component