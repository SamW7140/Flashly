---
tags: [flashcards]
deck: Programming Concepts
---

# Programming Concepts - Multi-line Format

> This example showcases the ?? (multi-line) format:
> - Detailed explanations
> - Code examples
> - Lists and structure
> - Rich formatting

## What is recursion in programming?
??
Recursion is a programming technique where a function calls itself to solve a problem by breaking it down into smaller, similar subproblems.

**Key components:**
1. **Base case** - Stopping condition
2. **Recursive case** - Function calls itself
3. **Progress** - Each call moves toward base case

**Example in Python:**
```python
def factorial(n):
    if n == 0:        # Base case
        return 1
    return n * factorial(n-1)  # Recursive case
```

**When to use:**
- Tree traversal
- Divide and conquer algorithms
- Problems with recursive structure

**Caution:** Watch for stack overflow!

## What is the difference between a stack and a queue?
??
**Stack (LIFO - Last In, First Out):**
- Elements added/removed from the same end (top)
- Like a stack of plates
- Operations: push, pop, peek
- Use cases: Undo functionality, call stack, backtracking

**Queue (FIFO - First In, First Out):**
- Elements added at rear, removed from front
- Like a line of people
- Operations: enqueue, dequeue, front
- Use cases: Task scheduling, breadth-first search, buffers

**Key difference:** Order of removal
- Stack: Most recent first
- Queue: Oldest first

## Explain the concept of Big O notation
??
Big O notation describes the worst-case time or space complexity of an algorithm as input size grows.

**Common complexities (best to worst):**

| Notation | Name | Example |
|----------|------|---------|
| O(1) | Constant | Array access |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Linear search |
| O(n log n) | Linearithmic | Merge sort |
| O(n²) | Quadratic | Bubble sort |
| O(2ⁿ) | Exponential | Recursive fibonacci |

**Rules:**
1. Drop constants: O(2n) → O(n)
2. Drop non-dominant terms: O(n² + n) → O(n²)
3. Different inputs use different variables: O(a + b)

**Focus on:** Growth rate as n → ∞

## What is object-oriented programming (OOP)?
??
Object-Oriented Programming is a paradigm based on "objects" that contain data (attributes) and code (methods).

**Four pillars of OOP:**

1. **Encapsulation**
   - Bundle data and methods together
   - Hide internal details
   - Control access via public/private

2. **Inheritance**
   - Child classes inherit from parent
   - Promotes code reuse
   - Creates hierarchies

3. **Polymorphism**
   - Same interface, different implementations
   - Method overriding and overloading
   - "Many forms"

4. **Abstraction**
   - Hide complex details
   - Show only essential features
   - Interface/abstract classes

**Benefits:**
- Modularity and reusability
- Easier maintenance
- Real-world modeling
- Scalability

## What is a hash table and how does it work?
??
A hash table (hash map) is a data structure that maps keys to values using a hash function for fast lookups.

**How it works:**
1. **Hash function** converts key to array index
   - `index = hash(key) % array_size`
2. Store value at that index
3. Retrieve by hashing key again

**Collision handling:**
- **Chaining:** Store multiple items in same slot (linked list)
- **Open addressing:** Find next available slot

**Time complexity:**
- Average case: O(1) for insert, delete, lookup
- Worst case: O(n) if many collisions

**Use cases:**
- Database indexing
- Caches
- Symbol tables
- Counting frequencies

**Example:** Python's `dict`, JavaScript's `Object`

## Explain the difference between synchronous and asynchronous programming
??
**Synchronous (Blocking):**
- Tasks execute one after another
- Each task must complete before next starts
- Simpler to understand and debug
- Can waste time waiting (I/O operations)

```javascript
console.log("Start");
const data = fetchDataSync(); // Blocks here
console.log(data);
console.log("End");
```

**Asynchronous (Non-blocking):**
- Tasks can run concurrently
- Doesn't wait for task completion
- Uses callbacks, promises, or async/await
- Better performance for I/O operations

```javascript
console.log("Start");
fetchDataAsync().then(data => {
    console.log(data);
});
console.log("End"); // Runs before data logs
```

**When to use async:**
- Network requests
- File I/O
- Database queries
- User input
- Timers

**Common patterns:**
- Callbacks
- Promises
- Async/await
- Event loops

## What is the CAP theorem in distributed systems?
??
The CAP theorem states that a distributed system cannot simultaneously provide all three of these guarantees:

**C - Consistency:**
- All nodes see the same data at the same time
- Every read receives the most recent write
- Example: Strong consistency in databases

**A - Availability:**
- Every request receives a response (success or failure)
- System remains operational
- No downtime

**P - Partition Tolerance:**
- System continues despite network partitions
- Handles communication breakdowns
- Essential for distributed systems

**The trade-off:**
Since network partitions can happen, you must choose between:

1. **CP Systems** (Consistency + Partition Tolerance)
   - Sacrifice availability during partition
   - Example: HBase, MongoDB
   - Use case: Financial transactions

2. **AP Systems** (Availability + Partition Tolerance)
   - Sacrifice consistency (eventual consistency)
   - Example: Cassandra, DynamoDB
   - Use case: Social media feeds

**Reality:** Most systems offer tunable consistency

## What are design patterns in software engineering?
??
Design patterns are reusable solutions to common software design problems. They're templates, not finished code.

**Categories:**

**1. Creational Patterns** (Object creation)
- **Singleton:** Ensure only one instance exists
- **Factory:** Create objects without specifying exact class
- **Builder:** Construct complex objects step by step

**2. Structural Patterns** (Object composition)
- **Adapter:** Make incompatible interfaces work together
- **Decorator:** Add behavior without modifying code
- **Facade:** Provide simplified interface

**3. Behavioral Patterns** (Object interaction)
- **Observer:** Notify dependents of state changes
- **Strategy:** Select algorithm at runtime
- **Command:** Encapsulate requests as objects

**Benefits:**
- Proven solutions
- Common vocabulary
- Best practices
- Easier maintenance

**Example - Observer Pattern:**
```python
# Used in: Event systems, MVC architecture
class Subject:
    def __init__(self):
        self._observers = []

    def attach(self, observer):
        self._observers.append(observer)

    def notify(self, data):
        for observer in self._observers:
            observer.update(data)
```

## What is RESTful API design?
??
REST (Representational State Transfer) is an architectural style for designing networked applications.

**Key principles:**

1. **Stateless**
   - Each request contains all needed information
   - Server doesn't store client state
   - Improves scalability

2. **Client-Server Architecture**
   - Separation of concerns
   - Independent evolution

3. **Uniform Interface**
   - Consistent resource identification (URIs)
   - Standard HTTP methods

4. **Cacheable**
   - Responses labeled as cacheable/non-cacheable
   - Improves performance

**HTTP Methods:**
- `GET` - Retrieve resource (safe, idempotent)
- `POST` - Create resource
- `PUT` - Update/replace resource (idempotent)
- `PATCH` - Partial update
- `DELETE` - Remove resource (idempotent)

**Best practices:**
```
GET    /users           # List all users
GET    /users/123       # Get specific user
POST   /users           # Create user
PUT    /users/123       # Update user
DELETE /users/123       # Delete user
```

**Status codes:**
- 2xx: Success (200 OK, 201 Created)
- 4xx: Client error (400 Bad Request, 404 Not Found)
- 5xx: Server error (500 Internal Server Error)

## Explain database normalization
??
Database normalization is the process of organizing data to reduce redundancy and improve data integrity.

**Normal Forms:**

**1NF (First Normal Form):**
- Atomic values (no arrays)
- Each column has unique name
- Order doesn't matter

**2NF (Second Normal Form):**
- Meets 1NF
- No partial dependencies
- Non-key columns depend on entire primary key

**3NF (Third Normal Form):**
- Meets 2NF
- No transitive dependencies
- Non-key columns depend only on primary key

**BCNF (Boyce-Codd):**
- Stronger version of 3NF
- Every determinant is a candidate key

**Trade-offs:**
- ✅ Pros: Less redundancy, easier updates, data integrity
- ❌ Cons: More complex queries, more joins, possible performance impact

**Example - Denormalized:**
```
Orders: id, customer_name, customer_address, product, price
```

**Example - Normalized (3NF):**
```
Customers: id, name, address
Products: id, name, price
Orders: id, customer_id, product_id
```

**When to denormalize:**
- Read-heavy applications
- Data warehouses
- Need faster queries
- Acceptable redundancy

---

## Multi-line Format Tips

**✅ Use ?? format when:**
- Answer needs explanation
- Including code examples
- Using lists or tables
- Multiple paragraphs
- Rich formatting needed

**Benefits:**
- Comprehensive understanding
- Context-rich learning
- Better retention
- Reference material

**Expected cards:** 10 detailed flashcards
**Review strategy:** These cards may take longer to review but provide deeper understanding
