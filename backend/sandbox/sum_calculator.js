// sum_calculator.js

// --- Calculator Logic ---
/**
 * Adds two numbers together.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The sum of a and b.
 */
function add(a, b) {
  return a + b;
}

/**
 * Returns the sum of 5 and 7.
 * @returns {number} The sum of 5 and 7.
 */
function sumFiveAndSeven() {
  return add(5, 7);
}

// --- Self-Testing Logic ---
const assert = require('assert');

console.log('Running tests...');

let testsPassed = true;

// Test for the specific sum of 5 and 7
try {
  const result = sumFiveAndSeven();
  assert.strictEqual(result, 12, `Expected sumFiveAndSeven() to be 12, but got ${result}`);
  console.log('  Test passed: sumFiveAndSeven() returns 12');
} catch (error) {
  console.error('  Test failed: sumFiveAndSeven() -', error.message);
  testsPassed = false;
}

// Optional: Test the general add function
try {
  assert.strictEqual(add(2, 3), 5, 'add(2, 3) should be 5');
  console.log('  Test passed: add(2, 3) returns 5');
  assert.strictEqual(add(-1, 1), 0, 'add(-1, 1) should be 0');
  console.log('  Test passed: add(-1, 1) returns 0');
  assert.strictEqual(add(10, 0), 10, 'add(10, 0) should be 10');
  console.log('  Test passed: add(10, 0) returns 10');
} catch (error) {
  console.error('  Test failed: add function -', error.message);
  testsPassed = false;
}

if (testsPassed) {
  console.log('\nAll tests completed successfully.');
} else {
  console.error('\nSome tests failed. Exiting with error.');
  process.exit(1); // Exit with a non-zero code to indicate failure
}
