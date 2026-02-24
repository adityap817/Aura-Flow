const assert = require('assert');

/**
 * A simple Priority Queue implementation.
 * Elements are stored as { value, priority } objects.
 * Lower priority number indicates higher priority.
 * Enqueue maintains sorted order, making dequeue and peek O(1).
 */
class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    /**
     * Adds an element to the queue with a given priority.
     * The queue maintains elements sorted by priority in ascending order.
     * If priorities are equal, elements are ordered by insertion time (FIFO).
     * @param {*} value The value to store in the queue.
     * @param {number} priority The priority of the value (lower number = higher priority).
     */
    enqueue(value, priority) {
        const newElement = { value, priority };
        let added = false;
        // Iterate to find the correct position to insert the new element
        // to maintain sorted order by priority.
        for (let i = 0; i < this.elements.length; i++) {
            if (newElement.priority < this.elements[i].priority) {
                this.elements.splice(i, 0, newElement);
                added = true;
                break;
            }
        }
        // If the new element has the lowest priority (or queue was empty), add to the end.
        if (!added) {
            this.elements.push(newElement);
        }
    }

    /**
     * Removes and returns the value of the element with the highest priority
     * (lowest priority number).
     * @returns {*} The value of the highest priority element, or undefined if the queue is empty.
     */
    dequeue() {
        if (this.isEmpty()) {
            return undefined;
        }
        // Remove and return the first element (highest priority)
        return this.elements.shift().value;
    }

    /**
     * Returns the value of the element with the highest priority without removing it.
     * @returns {*} The value of the highest priority element, or undefined if the queue is empty.
     */
    peek() {
        if (this.isEmpty()) {
            return undefined;
        }
        // Return the value of the first element (highest priority)
        return this.elements[0].value;
    }

    /**
     * Checks if the priority queue is empty.
     * @returns {boolean} True if the queue contains no elements, false otherwise.
     */
    isEmpty() {
        return this.elements.length === 0;
    }

    /**
     * Returns the number of elements currently in the queue.
     * @returns {number} The size of the queue.
     */
    size() {
        return this.elements.length;
    }
}

// --- Test Cases ---
console.log("Running PriorityQueue tests...");

// Test 1: New queue should be empty
const pq1 = new PriorityQueue();
assert.strictEqual(pq1.isEmpty(), true, "Test 1 Failed: New queue should be empty");
assert.strictEqual(pq1.size(), 0, "Test 1 Failed: New queue size should be 0");
assert.strictEqual(pq1.dequeue(), undefined, "Test 1 Failed: Dequeue on empty queue should return undefined");
assert.strictEqual(pq1.peek(), undefined, "Test 1 Failed: Peek on empty queue should return undefined");

// Test 2: Enqueue one element and check state
const pq2 = new PriorityQueue();
pq2.enqueue("Task A", 2);
assert.strictEqual(pq2.isEmpty(), false, "Test 2 Failed: Queue should not be empty after enqueue");
assert.strictEqual(pq2.size(), 1, "Test 2 Failed: Queue size should be 1");
assert.strictEqual(pq2.peek(), "Task A", "Test 2 Failed: Peek should return 'Task A'");

// Test 3: Dequeue the single element and check state
const dequeued2 = pq2.dequeue();
assert.strictEqual(dequeued2, "Task A", "Test 3 Failed: Dequeued element should be 'Task A'");
assert.strictEqual(pq2.isEmpty(), true, "Test 3 Failed: Queue should be empty after dequeueing last element");
assert.strictEqual(pq2.size(), 0, "Test 3 Failed: Queue size should be 0 after dequeueing last element");

// Test 4: Enqueue multiple elements with different priorities and check dequeue order
const pq3 = new PriorityQueue();
pq3.enqueue("Task C", 3);
pq3.enqueue("Task A", 1);
pq3.enqueue("Task B", 2);
assert.strictEqual(pq3.size(), 3, "Test 4 Failed: Queue size should be 3");
assert.strictEqual(pq3.peek(), "Task A", "Test 4 Failed: Peek should return 'Task A'");
assert.strictEqual(pq3.dequeue(), "Task A", "Test 4 Failed: Dequeue should return 'Task A'");
assert.strictEqual(pq3.dequeue(), "Task B", "Test 4 Failed: Dequeue should return 'Task B'");
assert.strictEqual(pq3.dequeue(), "Task C", "Test 4 Failed: Dequeue should return 'Task C'");
assert.strictEqual(pq3.isEmpty(), true, "Test 4 Failed: Queue should be empty after all dequeues");

// Test 5: Enqueue elements with same priority (should maintain FIFO order for same priority)
const pq4 = new PriorityQueue();
pq4.enqueue("Task X", 2);
pq4.enqueue("Task Y", 1);
pq4.enqueue("Task Z", 2); // Should be after Task X due to FIFO for same priority
assert.strictEqual(pq4.size(), 3, "Test 5 Failed: Queue size should be 3");
assert.strictEqual(pq4.dequeue(), "Task Y", "Test 5 Failed: Dequeue should return 'Task Y' (priority 1)");
assert.strictEqual(pq4.dequeue(), "Task X", "Test 5 Failed: Dequeue should return 'Task X' (priority 2, first in)");
assert.strictEqual(pq4.dequeue(), "Task Z", "Test 5 Failed: Dequeue should return 'Task Z' (priority 2, second in)");
assert.strictEqual(pq4.isEmpty(), true, "Test 5 Failed: Queue should be empty");

// Test 6: Mixed operations (enqueue, dequeue, peek)
const pq5 = new PriorityQueue();
pq5.enqueue("P1", 1);
pq5.enqueue("P3", 3);
assert.strictEqual(pq5.dequeue(), "P1", "Test 6 Failed: Dequeue P1");
pq5.enqueue("P2", 2);
assert.strictEqual(pq5.peek(), "P2", "Test 6 Failed: Peek P2");
pq5.enqueue("P0", 0);
assert.strictEqual(pq5.dequeue(), "P0", "Test 6 Failed: Dequeue P0");
assert.strictEqual(pq5.dequeue(), "P2", "Test 6 Failed: Dequeue P2");
assert.strictEqual(pq5.dequeue(), "P3", "Test 6 Failed: Dequeue P3");
assert.strictEqual(pq5.isEmpty(), true, "Test 6 Failed: Queue should be empty");

console.log("All PriorityQueue tests passed successfully!");