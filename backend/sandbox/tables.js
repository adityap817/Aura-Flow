const assert = require('assert');

/**
 * Generates a multiplication table for a given number up to a specified limit.
 * @param {number} number - The number for which to generate the table.
 * @param {number} [limit=10] - The upper limit for multiplication (e.g., up to number x 10).
 * @returns {string[]} An array of strings, each representing a line in the multiplication table.
 */
function generateMultiplicationTable(number, limit = 10) {
  const table = [];
  for (let i = 1; i <= limit; i++) {
    table.push(`${number} x ${i} = ${number * i}`);
  }
  return table;
}

/**
 * Runs a series of assertion tests for the generateMultiplicationTable function.
 */
function runTests() {
  console.log('Running tests for generateMultiplicationTable...');

  try {
    // Test Case 1: Table of 5, first 3 entries
    const table5_subset = generateMultiplicationTable(5, 3);
    assert.deepStrictEqual(table5_subset, [
      '5 x 1 = 5',
      '5 x 2 = 10',
      '5 x 3 = 15'
    ], 'Test Case 1 Failed: Table of 5 (first 3 entries)');

    // Test Case 2: Table of 7, first 2 entries
    const table7_subset = generateMultiplicationTable(7, 2);
    assert.deepStrictEqual(table7_subset, [
      '7 x 1 = 7',
      '7 x 2 = 14'
    ], 'Test Case 2 Failed: Table of 7 (first 2 entries)');

    // Test Case 3: Specific entry for table of 5 (5 x 10)
    const fullTable5 = generateMultiplicationTable(5, 10);
    assert.strictEqual(fullTable5[9], '5 x 10 = 50', 'Test Case 3 Failed: Specific entry 5x10');

    // Test Case 4: Empty table for limit 0
    const emptyTable = generateMultiplicationTable(10, 0);
    assert.deepStrictEqual(emptyTable, [], 'Test Case 4 Failed: Empty table for limit 0');

    // Test Case 5: Default limit (10)
    const defaultTable = generateMultiplicationTable(3);
    assert.strictEqual(defaultTable.length, 10, 'Test Case 5 Failed: Default limit should be 10');
    assert.strictEqual(defaultTable[9], '3 x 10 = 30', 'Test Case 5 Failed: Last entry of default table');

    console.log('All tests passed successfully!');
  } catch (error) {
    console.error('Tests failed:', error.message);
    process.exit(1); // Exit with a non-zero code to indicate failure
  }
}

// Main execution block: Determines whether to print tables or run tests
if (require.main === module) {
  const args = process.argv.slice(2); // Get command line arguments

  if (args.includes('--test')) {
    runTests();
  } else {
    console.log("--- Table of 5 ---");
    generateMultiplicationTable(5).forEach(line => console.log(line));

    console.log("\n--- Table of 7 ---");
    generateMultiplicationTable(7).forEach(line => console.log(line));
  }
}

// Export the function for potential external use (e.g., if another script wanted to import it)
module.exports = { generateMultiplicationTable };
