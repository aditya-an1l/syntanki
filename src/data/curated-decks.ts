export interface CuratedCard {
  front: string;
  back: string;
  language: string;
  source: string;
}

export interface CuratedDeck {
  key: string;
  name: string;
  tags: string[];
  retention: number;
  cards: CuratedCard[];
}

const SRC = "Syntanki starter deck";

function text(front: string, back: string): CuratedCard {
  return { front, back, language: "text", source: SRC };
}

export const CURATED_DECKS: CuratedDeck[] = [
  {
    key: "dsa",
    name: "DSA Fundamentals",
    tags: ["dsa", "algorithms"],
    retention: 0.9,
    cards: [
      text("Average time to look up a key in a hash table: ____", "O(1)"),
      text("Worst-case time to look up a key in a hash table (all keys collide): ____", "O(n)"),
      text("A balanced binary search tree gives ____ search, insert, and delete.", "O(log n)"),
      text("BFS tracks its frontier with a ____.", "queue"),
      text("DFS tracks its frontier with a ____ (or the call stack).", "stack"),
      text("Two pointers finds a target pair in O(n) when the array is ____.", "sorted"),
      {
        front:
          "def binary_search(a, t):\n    lo, hi = 0, len(a) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if a[mid] == t:\n            return ____\n    return -1",
        back: "mid",
        language: "python",
        source: SRC,
      },
      {
        front:
          "def fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return ____",
        back: "a",
        language: "python",
        source: SRC,
      },
      {
        front: "from collections import ____\nq = deque()\nq.append(1)\nq.popleft()",
        back: "deque",
        language: "python",
        source: SRC,
      },
      {
        front: "Reverse a Python list with slicing: nums[____]",
        back: "::-1",
        language: "python",
        source: SRC,
      },
    ],
  },
  {
    key: "bigo",
    name: "Big-O and Complexity",
    tags: ["complexity", "big-o"],
    retention: 0.9,
    cards: [
      text("O(1) means the runtime ____ as the input grows.", "does not grow (constant)"),
      text("O(n) means the runtime grows ____ with the input.", "linearly"),
      text("O(n^2) usually comes from a ____ over the input.", "nested loop"),
      text("Binary search runs in O(____).", "log n"),
      text("A single pass over a list runs in O(____).", "n"),
      text("Accessing list[i] by index is O(____).", "1"),
      text("Inserting at the front of a list is O(____).", "n"),
      text("Space complexity counts the ____ memory, not the input itself.", "extra (auxiliary)"),
      text("Merging two sorted arrays of size n each is O(____).", "n"),
      text("Comparison sorting cannot beat O(____) in the worst case.", "n log n"),
    ],
  },
  {
    key: "python-stdlib",
    name: "Python Standard Library",
    tags: ["python", "stdlib"],
    retention: 0.9,
    cards: [
      {
        front: "from collections import ____\nprint(Counter('aab').most_common(1))",
        back: "Counter",
        language: "python",
        source: SRC,
      },
      {
        front: "import ____\nprint(____.sqrt(16))  # 4.0",
        back: "math",
        language: "python",
        source: SRC,
      },
      {
        front: "for i, v in ____(['a', 'b']):\n    print(i, v)  # 0 a, 1 b",
        back: "enumerate",
        language: "python",
        source: SRC,
      },
      {
        front: "print(____([1, 2, 3]))  # 6",
        back: "sum",
        language: "python",
        source: SRC,
      },
      {
        front: "print('hello world'.____())  # ['hello', 'world']",
        back: "split",
        language: "python",
        source: SRC,
      },
      {
        front: "print(','.____(['a', 'b']))  # 'a,b'",
        back: "join",
        language: "python",
        source: SRC,
      },
      {
        front: "nums = [3, 1, 2]\nprint(____(nums))  # [1, 2, 3]",
        back: "sorted",
        language: "python",
        source: SRC,
      },
      {
        front: "from functools import ____\nprint(reduce(lambda a, b: a + b, [1, 2, 3]))  # 6",
        back: "reduce",
        language: "python",
        source: SRC,
      },
      {
        front: "d = {'a': 1}\nprint(d.____('b', 0))  # 0",
        back: "get",
        language: "python",
        source: SRC,
      },
      {
        front: "print(list(____(range(1, 5), range(5, 9))))  # [(1, 5), (2, 6), ...]",
        back: "zip",
        language: "python",
        source: SRC,
      },
    ],
  },
  {
    key: "js-ts",
    name: "JS and TS Essentials",
    tags: ["javascript", "typescript"],
    retention: 0.9,
    cards: [
      {
        front: "const nums = [1, 2, 3];\nconsole.log(nums.____(n => n * 2));  // [2, 4, 6]",
        back: "map",
        language: "javascript",
        source: SRC,
      },
      {
        front: "const nums = [1, 2, 3, 4];\nconsole.log(nums.____(n => n % 2 === 0));  // [2, 4]",
        back: "filter",
        language: "javascript",
        source: SRC,
      },
      {
        front: "const nums = [1, 2, 3];\nconsole.log(nums.____((a, b) => a + b, 0));  // 6",
        back: "reduce",
        language: "javascript",
        source: SRC,
      },
      {
        front: "A ____ binding cannot be reassigned.",
        back: "const",
        language: "javascript",
        source: SRC,
      },
      {
        front: "console.log(typeof null);  // '____'",
        back: "object",
        language: "javascript",
        source: SRC,
      },
      {
        front: "console.log([1, 2, 3].at(____));  // 3",
        back: "-1",
        language: "javascript",
        source: SRC,
      },
      {
        front: "console.log([1, 2, 3].____(x => x === 2));  // true",
        back: "includes",
        language: "javascript",
        source: SRC,
      },
      {
        front: "function len(x: string): ____ { return x.length; }",
        back: "number",
        language: "typescript",
        source: SRC,
      },
      {
        front: "type User = { name: string; age?: ____ };",
        back: "number",
        language: "typescript",
        source: SRC,
      },
      {
        front: "Never use 'any' when you mean optional. Mark a field optional with ____.",
        back: "?",
        language: "typescript",
        source: SRC,
      },
    ],
  },
  {
    key: "sql",
    name: "SQL Basics",
    tags: ["sql", "database"],
    retention: 0.9,
    cards: [
      {
        front: "SELECT name FROM users ____ age > 18;",
        back: "WHERE",
        language: "sql",
        source: SRC,
      },
      {
        front: "SELECT * FROM users ORDER BY age ____;  -- oldest first",
        back: "DESC",
        language: "sql",
        source: SRC,
      },
      {
        front: "SELECT user_id, COUNT(*) FROM orders ____ user_id;",
        back: "GROUP BY",
        language: "sql",
        source: SRC,
      },
      {
        front: "____ users SET name = 'x' WHERE id = 1;",
        back: "UPDATE",
        language: "sql",
        source: SRC,
      },
      {
        front: "SELECT u.name, o.total FROM users u ____ JOIN orders o ON o.user_id = u.id;",
        back: "INNER",
        language: "sql",
        source: SRC,
      },
      {
        front: "SELECT ____ FROM users;  -- remove duplicate rows",
        back: "DISTINCT name",
        language: "sql",
        source: SRC,
      },
      {
        front: "INSERT ____ users (name) VALUES ('a');",
        back: "INTO",
        language: "sql",
        source: SRC,
      },
      {
        front: "SELECT * FROM users ____ 5;  -- first 5 rows",
        back: "LIMIT",
        language: "sql",
        source: SRC,
      },
      {
        front: "DELETE FROM users ____ id = 1;",
        back: "WHERE",
        language: "sql",
        source: SRC,
      },
      {
        front: "Count rows in a table: SELECT ____(*) FROM users;",
        back: "COUNT",
        language: "sql",
        source: SRC,
      },
    ],
  },
];
