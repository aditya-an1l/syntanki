/// <reference types="vitest/globals" />
import { parseSnippet } from "../cloze";

describe("C++ parser", () => {
  it("extracts class keyword", () => {
    const cards = parseSnippet("class Solution { public: void solve(); };", "cpp");
    expect(cards.some((c) => c.back === "class")).toBe(true);
  });
  it("extracts virtual keyword", () => {
    const cards = parseSnippet("virtual void draw() = 0;", "cpp");
    expect(cards.some((c) => c.back === "virtual")).toBe(true);
  });
  it("extracts template keyword", () => {
    const cards = parseSnippet("template<typename T> T add(T a, T b);", "cpp");
    expect(cards.some((c) => c.back === "template")).toBe(true);
  });
  it("extracts #include directive", () => {
    const cards = parseSnippet("#include <vector>", "cpp");
    expect(cards.some((c) => c.back === "#include")).toBe(true);
  });
  it("extracts std::cout", () => {
    const cards = parseSnippet('std::cout << "hello";', "cpp");
    expect(cards.some((c) => c.back === "std::cout")).toBe(true);
  });
  it("extracts namespace", () => {
    const cards = parseSnippet("namespace std {}", "cpp");
    expect(cards.some((c) => c.back === "namespace")).toBe(true);
  });
  it("extracts new keyword", () => {
    const cards = parseSnippet("int* p = new int;", "cpp");
    expect(cards.some((c) => c.back === "new")).toBe(true);
  });
  it("extracts delete keyword", () => {
    const cards = parseSnippet("delete p;", "cpp");
    expect(cards.some((c) => c.back === "delete")).toBe(true);
  });
});

describe("Python parser tuning", () => {
  it("extracts def function name", () => {
    const cards = parseSnippet("def binary_search(arr, target):", "python");
    expect(cards.some((c) => c.back === "binary_search")).toBe(true);
  });
  it("extracts from...import module", () => {
    const cards = parseSnippet("from collections import deque", "python");
    expect(cards.some((c) => c.back === "collections")).toBe(true);
  });
  it("extracts class keyword", () => {
    const cards = parseSnippet("class Solution:", "python");
    expect(cards.some((c) => c.back === "class")).toBe(true);
  });
  it("extracts elif keyword", () => {
    const cards = parseSnippet("elif x > 0:", "python");
    expect(cards.some((c) => c.back === "elif")).toBe(true);
  });
});

describe("JavaScript/TypeScript parser tuning", () => {
  it("extracts export interface", () => {
    const cards = parseSnippet("export interface ListNode { val: number; next: ListNode | null; }", "typescript");
    expect(cards.some((c) => c.back === "interface")).toBe(true);
    expect(cards.some((c) => c.back === "ListNode")).toBe(true);
  });
  it("extracts async function", () => {
    const cards = parseSnippet("async function fetchData() {}", "javascript");
    expect(cards.some((c) => c.back === "async function")).toBe(true);
  });
  it("extracts await keyword", () => {
    const cards = parseSnippet("const data = await fetch(url);", "javascript");
    expect(cards.some((c) => c.back === "await")).toBe(true);
  });
});

describe("Java parser tuning", () => {
  it("extracts public static void main", () => {
    const cards = parseSnippet("public static void main(String[] args) {}", "java");
    expect(cards.some((c) => c.back === "public static void main(String[] args)")).toBe(true);
  });
  it("extracts System.out.println", () => {
    const cards = parseSnippet("System.out.println(result);", "java");
    expect(cards.some((c) => c.back === "System.out.println()")).toBe(true);
  });
});

describe("SQL parser tuning", () => {
  it("extracts SELECT statement", () => {
    const cards = parseSnippet("SELECT * FROM users WHERE id = 1", "sql");
    expect(cards.some((c) => c.back === "SELECT")).toBe(true);
  });
  it("extracts WHERE clause", () => {
    const cards = parseSnippet("SELECT * FROM users WHERE id = 1", "sql");
    expect(cards.some((c) => c.back === "WHERE")).toBe(true);
  });
  it("extracts JOIN clause", () => {
    const cards = parseSnippet("SELECT * FROM orders JOIN users ON orders.user_id = users.id", "sql");
    expect(cards.some((c) => c.back === "JOIN")).toBe(true);
  });
});
