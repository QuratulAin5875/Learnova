export type UserRole = 'learner' | 'admin';
export type MasteryStatus = 'mastered' | 'completed' | 'not_completed' | 'locked';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type DifficultyTier = 'easy' | 'medium' | 'hard';
export type ErrorType = 'conceptual' | 'procedural' | 'careless';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  title?: string;
  department?: string;
  onboardingCompleted: boolean;
  activeCourseId: string;
  streakDays: number;
  profilePublic: boolean;
  certsPublic: boolean;
  educationLevel?: string;
  priorExperience?: string;
  learningGoal?: string;
}

export interface TopicNode {
  id: string;
  code: string;
  subjectId: string;
  title: string;
  subtitle: string;
  tier: 'Foundational' | 'Intermediate' | 'Advanced';
  stage: number;
  stageTitle: string;
  mastery: number; // 0 to 100
  confidence: number; // 0 to 100
  status: MasteryStatus;
  isTargetNode?: boolean;
  prerequisites: string[]; // topic IDs
  prerequisitesMet: boolean;
  unlockRequirementText?: string;
  competencies: string[];
  syllabus: string[];
  expectedMinutes: number;
}

export interface SubjectCourse {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  topicCount: number;
  dependencyCount: number;
  enrolled: boolean;
  active: boolean;
  overallMastery: number;
  overallConfidence: number;
  topicsMastered: number;
}

export interface DiagnosticQuestion {
  id: string;
  subjectId?: string;
  topicId: string;
  topicName: string;
  difficulty: DifficultyTier;
  stem: string;
  hint: string;
  options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface CertificateRecord {
  certificateId: string;
  learnerName: string;
  courseCode: string;
  courseName: string;
  description: string;
  tier: 'Mastered' | 'Completed';
  score: number;
  status: 'Active & Authentic' | 'Revoked';
  issueDate: string;
  isPublic: boolean;
}

/**
 * Bayesian Knowledge Tracing (BKT) single-step update (matches IMPLEMENTATION_GUIDE.md Section 13.1)
 */
export function bktUpdate(
  pKnown: number,
  correct: boolean,
  difficulty: DifficultyTier = 'medium'
): number {
  const pTransit = 0.16;
  const pSlip = difficulty === 'easy' ? 0.06 : difficulty === 'medium' ? 0.1 : 0.15;
  const pGuess = difficulty === 'easy' ? 0.25 : difficulty === 'medium' ? 0.2 : 0.12;

  const num = correct ? pKnown * (1 - pSlip) : pKnown * pSlip;
  const den = correct
    ? num + (1 - pKnown) * pGuess
    : num + (1 - pKnown) * (1 - pSlip);
  const posterior = den > 0 ? num / den : pKnown;
  return Math.min(0.99, Math.max(0.05, posterior + (1 - posterior) * pTransit));
}

/**
 * Adaptive Difficulty Selector (matches IMPLEMENTATION_GUIDE.md Section 13.2)
 */
export function selectNextDifficulty(
  current: DifficultyTier,
  correct: boolean,
  confidence: ConfidenceLevel
): DifficultyTier {
  const order: DifficultyTier[] = ['easy', 'medium', 'hard'];
  const idx = order.indexOf(current);
  if (correct && confidence !== 'low') return order[Math.min(2, idx + 1)];
  if (!correct) return order[Math.max(0, idx - 1)];
  return current;
}

/**
 * Error Type Classifier (FR06-03, FR07-04):
 * - Careless: fast response (<9s) + high confidence
 * - Conceptual: low confidence with slow response OR high confidence misconception
 * - Procedural: multi-revision or moderate latency execution failure
 */
export function classifyErrorType(
  responseSec: number,
  confidence: ConfidenceLevel,
  revisions: number
): ErrorType {
  if (confidence === 'high' && responseSec <= 8 && revisions === 0) return 'careless';
  if (revisions >= 1 || (confidence === 'medium' && responseSec > 10)) return 'procedural';
  return 'conceptual';
}

/**
 * Directed Acyclic Graph (DAG) Cycle Detector using Depth-First Search (UC-21 / AD-21).
 * Returns the cycle path of topic titles if a cycle exists, or null if valid DAG.
 */
export function detectGraphCycle(nodes: TopicNode[]): string[] | null {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const path: string[] = [];

  function dfs(currentId: string): string[] | null {
    visited.add(currentId);
    inStack.add(currentId);
    path.push(currentId);

    const node = nodeMap.get(currentId);
    if (node) {
      for (const prereqId of node.prerequisites) {
        if (!nodeMap.has(prereqId)) continue;
        if (!visited.has(prereqId)) {
          const cycle = dfs(prereqId);
          if (cycle) return cycle;
        } else if (inStack.has(prereqId)) {
          const idx = path.indexOf(prereqId);
          const cycleIds = [...path.slice(idx), prereqId];
          return cycleIds.map((id) => nodeMap.get(id)?.title || id);
        }
      }
    }

    path.pop();
    inStack.delete(currentId);
    return null;
  }

  for (const n of nodes) {
    if (!visited.has(n.id)) {
      const cycle = dfs(n.id);
      if (cycle) return cycle;
    }
  }
  return null;
}

export const INITIAL_USER: User = {
  id: 'usr_alex_01',
  name: 'Alex Morgan',
  username: 'alex-morgan',
  email: 'alex.morgan@university.edu',
  role: 'learner',
  avatarInitials: 'AM',
  onboardingCompleted: true,
  activeCourseId: 'cs-250',
  streakDays: 4,
  profilePublic: true,
  certsPublic: true,
  educationLevel: '2nd Year Computer Science (Undergraduate)',
  priorExperience: 'Basic C++ (Variables, Loops, Functions, Arrays)',
  learningGoal:
    'Prepare for my Data Structures & Algorithms (DSA) coursework and upcoming technical internship interviews.',
};

export const ADMIN_USER: User = {
  id: 'usr_admin_01',
  name: 'Dr. Robert Vance',
  username: 'robert-vance',
  email: 'r.vance@university.edu',
  role: 'admin',
  avatarInitials: 'RV',
  title: 'Academic Director / Admin',
  department: 'Faculty of Computer Science & Engineering',
  onboardingCompleted: true,
  activeCourseId: 'cs-250',
  streakDays: 12,
  profilePublic: false,
  certsPublic: false,
};

export const COURSES: SubjectCourse[] = [
  {
    id: 'cs-101',
    code: 'CS-101',
    name: 'Programming Fundamentals',
    shortName: 'PF',
    description: 'Imperative logic, control flow, functional decomposition, and pointer mechanics.',
    topicCount: 9,
    dependencyCount: 11,
    enrolled: true,
    active: false,
    overallMastery: 91,
    overallConfidence: 88,
    topicsMastered: 9,
  },
  {
    id: 'cs-201',
    code: 'CS-201',
    name: 'Object-Oriented Programming',
    shortName: 'OOP',
    description: 'Polymorphism, abstraction hierarchies, encapsulation integrity, and behavioral design.',
    topicCount: 8,
    dependencyCount: 12,
    enrolled: true,
    active: false,
    overallMastery: 74,
    overallConfidence: 79,
    topicsMastered: 4,
  },
  {
    id: 'cs-250',
    code: 'CS-250',
    name: 'Data Structures and Algorithms',
    shortName: 'DSA',
    description: 'Linear & non-linear memory layouts, traversal invariants, asymptotic bounds, and complexity analysis.',
    topicCount: 18,
    dependencyCount: 22,
    enrolled: true,
    active: true,
    overallMastery: 68,
    overallConfidence: 74,
    topicsMastered: 8,
  },
  {
    id: 'cs-310',
    code: 'CS-310',
    name: 'Design and Analysis of Algorithms',
    shortName: 'DAA',
    description: 'Greedy heuristics, dynamic programming recurrence relations, divide-and-conquer, and NP-completeness.',
    topicCount: 11,
    dependencyCount: 18,
    enrolled: false,
    active: false,
    overallMastery: 42,
    overallConfidence: 50,
    topicsMastered: 1,
  },
];

export const ALL_TOPICS: TopicNode[] = [
  // CS-250: Data Structures and Algorithms (5 Core Nodes)
  {
    id: 'dsa-arrays',
    code: 'CS250-T01',
    subjectId: 'cs-250',
    title: 'Arrays',
    subtitle: 'Contiguous memory, random memory access, pointer arithmetic, and cache lines.',
    tier: 'Foundational',
    stage: 1,
    stageTitle: 'Foundations: Linear Data Units',
    mastery: 92,
    confidence: 89,
    status: 'mastered',
    prerequisites: [],
    prerequisitesMet: true,
    competencies: ['Two Pointers', 'Prefix Sum', 'Window Slicing'],
    syllabus: ['Contiguous Memory Layout & Indexing', 'Two-Pointer & Sliding Window Invariants', 'Dynamic Array Amortization Analysis'],
    expectedMinutes: 30,
  },
  {
    id: 'dsa-linked-lists',
    code: 'CS250-T02',
    subjectId: 'cs-250',
    title: 'Functions & Linked Lists',
    subtitle: 'Singly, doubly linked nodes, pointer reallocation, recursion stacks, and dynamic allocation.',
    tier: 'Intermediate',
    stage: 1,
    stageTitle: 'Foundations: Linear Data Units',
    mastery: 78,
    confidence: 76,
    status: 'completed',
    prerequisites: ['dsa-arrays'],
    prerequisitesMet: true,
    competencies: ['Fast/Slow Pointers', 'In-place Reversal', 'Cycle Detection'],
    syllabus: ['Singly & Doubly Linked Node Pointers', 'Floyd Cycle-Finding (Tortoise & Hare)', 'In-place List Reversal & Merge'],
    expectedMinutes: 40,
  },
  {
    id: 'dsa-tree-traversal',
    code: 'CS250-T03',
    subjectId: 'cs-250',
    title: 'Tree Traversal',
    subtitle: 'Understanding how to systematically visit every node in a tree structure. Essential for searching, sorting, and manipulating hierarchical data.',
    tier: 'Intermediate',
    stage: 2,
    stageTitle: 'Branching & Hierarchical Structures',
    mastery: 48,
    confidence: 51,
    status: 'not_completed',
    isTargetNode: true,
    prerequisites: ['dsa-arrays', 'dsa-linked-lists'],
    prerequisitesMet: true,
    competencies: ['Recursive vs Iterative DFS', 'Level-order BFS', 'Subtree Boundary Checks'],
    syllabus: [
      'Breadth-First Search (BFS / Level Order)',
      'Depth-First: In-Order Traversal',
      'Pre-Order & Post-Order Heuristics',
    ],
    expectedMinutes: 45,
  },
  {
    id: 'dsa-bst',
    code: 'CS250-T04',
    subjectId: 'cs-250',
    title: 'Binary Search Trees & AVL Balancing',
    subtitle: 'Self-balancing heuristics, rotation semantics, AVL height guarantees, and Red-Black properties.',
    tier: 'Intermediate',
    stage: 2,
    stageTitle: 'Branching & Hierarchical Structures',
    mastery: 0,
    confidence: 0,
    status: 'locked',
    prerequisites: ['dsa-tree-traversal'],
    prerequisitesMet: false,
    unlockRequirementText: 'Requires: Tree Traversal (Completed or Mastered) • Unlocks at ≥70% Traversal Mastery',
    competencies: ['BST Invariant Search', 'AVL Height Balancing', 'Rotations & Rebalancing'],
    syllabus: ['BST Ordering Invariant & Search', 'Single & Double AVL Tree Rotations', 'Deletion & Height Balance Maintenance'],
    expectedMinutes: 55,
  },
  {
    id: 'dsa-graphs',
    code: 'CS250-T05',
    subjectId: 'cs-250',
    title: 'Dijkstra, BFS & DFS Traversal Networks',
    subtitle: 'Adjacency matrices, greedy search methods, priority queues, and DAG topological sorting.',
    tier: 'Advanced',
    stage: 3,
    stageTitle: 'Graph Algorithmic Topology',
    mastery: 0,
    confidence: 0,
    status: 'locked',
    prerequisites: ['dsa-bst'],
    prerequisitesMet: false,
    unlockRequirementText: 'Requires completion of Stage 02',
    competencies: ['Shortest Path Proofs', 'Topological Sort & DAG Cycle Detection', 'Minimum Spanning Forests'],
    syllabus: ['Adjacency Representations', 'Dijkstra Shortest Path with Min-Heap', 'Kahn Topological Sort & Cycle Detection'],
    expectedMinutes: 60,
  },

  // CS-101: Programming Fundamentals
  {
    id: 'pf-control-flow',
    code: 'CS101-T01',
    subjectId: 'cs-101',
    title: 'Variables, Types & Control Flow',
    subtitle: 'Primitive types, branching conditionals, loop invariants, and boolean short-circuiting.',
    tier: 'Foundational',
    stage: 1,
    stageTitle: 'Foundations: Imperative Execution',
    mastery: 95,
    confidence: 92,
    status: 'mastered',
    prerequisites: [],
    prerequisitesMet: true,
    competencies: ['Loop Invariants', 'Branching Logic', 'Type Promotion'],
    syllabus: ['Primitive Memory Types', 'Conditional Branching & Switch Tables', 'Iterative Loop Invariants'],
    expectedMinutes: 25,
  },
  {
    id: 'pf-functions',
    code: 'CS101-T02',
    subjectId: 'cs-101',
    title: 'Modular Functions & Call Stack',
    subtitle: 'Stack frames, pass-by-value vs pass-by-reference, and base-case recursion.',
    tier: 'Intermediate',
    stage: 2,
    stageTitle: 'Modular Decomposition & Memory',
    mastery: 91,
    confidence: 88,
    status: 'mastered',
    prerequisites: ['pf-control-flow'],
    prerequisitesMet: true,
    competencies: ['Call Stack Frames', 'Pass-by-Reference', 'Recursion Base Cases'],
    syllabus: ['Activation Records & Stack Frames', 'Parameter Passing Semantics', 'Tail vs Non-Tail Recursion'],
    expectedMinutes: 35,
  },
  {
    id: 'pf-pointers',
    code: 'CS101-T03',
    subjectId: 'cs-101',
    title: 'Pointers & Dynamic Memory Addressing',
    subtitle: 'Dereferencing, pointer arithmetic, heap allocation, and memory leak prevention.',
    tier: 'Advanced',
    stage: 3,
    stageTitle: 'Low-Level Memory Mechanics',
    mastery: 88,
    confidence: 84,
    status: 'completed',
    isTargetNode: true,
    prerequisites: ['pf-functions'],
    prerequisitesMet: true,
    competencies: ['Pointer Arithmetic', 'Heap Lifecycle', 'Dangling Pointer Prevention'],
    syllabus: ['Address-of & Dereference Operators', 'Arrays vs Pointer Decay', 'Dynamic Heap Allocation & Deallocation'],
    expectedMinutes: 45,
  },

  // CS-201: Object-Oriented Programming
  {
    id: 'oop-classes',
    code: 'CS201-T01',
    subjectId: 'cs-201',
    title: 'Classes, Encapsulation & Constructors',
    subtitle: 'Access modifiers, object lifecycle, invariant enforcement, and deep vs shallow copies.',
    tier: 'Foundational',
    stage: 1,
    stageTitle: 'Foundations: Object Encapsulation',
    mastery: 90,
    confidence: 86,
    status: 'mastered',
    prerequisites: [],
    prerequisitesMet: true,
    competencies: ['State Encapsulation', 'Copy Constructors', 'RAII Lifecycle'],
    syllabus: ['Class Invariants & Access Specifiers', 'Constructor Initialization Lists', 'Deep vs Shallow Copying'],
    expectedMinutes: 35,
  },
  {
    id: 'oop-inheritance',
    code: 'CS201-T02',
    subjectId: 'cs-201',
    title: 'Inheritance & Polymorphic Dispatch',
    subtitle: 'Virtual method tables (vtables), abstract interfaces, and Liskov substitution.',
    tier: 'Intermediate',
    stage: 2,
    stageTitle: 'Abstraction & Polymorphism',
    mastery: 62,
    confidence: 65,
    status: 'not_completed',
    isTargetNode: true,
    prerequisites: ['oop-classes'],
    prerequisitesMet: true,
    competencies: ['Dynamic Dispatch (vtable)', 'Abstract Interfaces', 'Liskov Substitution'],
    syllabus: ['Base & Derived Class Hierarchies', 'Virtual Functions & Vtable Dispatch', 'Pure Virtual Interfaces'],
    expectedMinutes: 45,
  },
  {
    id: 'oop-patterns',
    code: 'CS201-T03',
    subjectId: 'cs-201',
    title: 'SOLID Principles & Design Patterns',
    subtitle: 'Dependency inversion, Factory, Strategy, and Observer architectural patterns.',
    tier: 'Advanced',
    stage: 3,
    stageTitle: 'Architectural Design Patterns',
    mastery: 0,
    confidence: 0,
    status: 'locked',
    prerequisites: ['oop-inheritance'],
    prerequisitesMet: false,
    unlockRequirementText: 'Requires: Inheritance & Polymorphic Dispatch (≥70% Completed)',
    competencies: ['SOLID Architecture', 'Strategy & Factory Patterns', 'Decoupled Interfaces'],
    syllabus: ['Single Responsibility & Open-Closed Rules', 'Strategy & Observer Behavioral Patterns', 'Dependency Injection'],
    expectedMinutes: 50,
  },

  // CS-310: Design and Analysis of Algorithms
  {
    id: 'daa-asymptotics',
    code: 'CS310-T01',
    subjectId: 'cs-310',
    title: 'Asymptotic Complexity & Master Theorem',
    subtitle: 'Big-O, Omega, Theta bounds, recurrence trees, and Master Theorem cases.',
    tier: 'Foundational',
    stage: 1,
    stageTitle: 'Foundations: Growth & Recurrences',
    mastery: 76,
    confidence: 74,
    status: 'completed',
    prerequisites: [],
    prerequisitesMet: true,
    competencies: ['Big-O/Theta Proofs', 'Recurrence Trees', 'Master Theorem'],
    syllabus: ['Asymptotic Upper & Tight Bounds', 'Divide-and-Conquer Recurrences', 'Master Theorem Case Analysis'],
    expectedMinutes: 40,
  },
  {
    id: 'daa-dp',
    code: 'CS310-T02',
    subjectId: 'cs-310',
    title: 'Dynamic Programming & Optimal Substructure',
    subtitle: 'Overlapping subproblems, top-down memoization vs bottom-up tabulation.',
    tier: 'Intermediate',
    stage: 2,
    stageTitle: 'Optimization Paradigms',
    mastery: 44,
    confidence: 48,
    status: 'not_completed',
    isTargetNode: true,
    prerequisites: ['daa-asymptotics'],
    prerequisitesMet: true,
    competencies: ['State Transition Equations', 'Memoization vs Tabulation', 'Knapsack & LCS'],
    syllabus: ['Optimal Substructure Identification', '1D & 2D State Transition Tables', 'Space-Optimized Tabulation'],
    expectedMinutes: 55,
  },
  {
    id: 'daa-np',
    code: 'CS310-T03',
    subjectId: 'cs-310',
    title: 'NP-Completeness & Polynomial Reductions',
    subtitle: 'P vs NP, Cook-Levin reductions, 3-SAT, and approximation ratios.',
    tier: 'Advanced',
    stage: 3,
    stageTitle: 'Computational Intractability',
    mastery: 0,
    confidence: 0,
    status: 'locked',
    prerequisites: ['daa-dp'],
    prerequisitesMet: false,
    unlockRequirementText: 'Requires: Dynamic Programming (≥70% Completed)',
    competencies: ['Polynomial-Time Verification', 'NP-Hard Reductions', 'Approximation Bounds'],
    syllabus: ['Decision Problems & Certificates', 'Polynomial Reductions (3-SAT to Clique)', 'Approximation Heuristics'],
    expectedMinutes: 60,
  },
];

// Keep backward-compatible export for DSA_TOPICS
export const DSA_TOPICS = ALL_TOPICS.filter((t) => t.subjectId === 'cs-250');

// Full 8-Question Adaptive Assessment Bank
export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'q-bst-1',
    subjectId: 'cs-250',
    topicId: 'dsa-bst',
    topicName: 'Binary Search Trees',
    difficulty: 'medium',
    stem: 'Which property must be maintained for every node in a valid Binary Search Tree (BST)?',
    hint: 'Consider the fundamental structural ordering rules that differentiate a BST from a standard binary tree.',
    options: [
      { id: 'A', text: 'Every node has exactly two children' },
      { id: 'B', text: 'Left subtree values are smaller and right subtree values are larger' },
      { id: 'C', text: 'All leaf nodes are at the same depth' },
      { id: 'D', text: 'Every node has the same number of descendants' },
    ],
    correctOption: 'B',
    explanation: 'A valid BST requires that for every node N, all keys in its left subtree are strictly less than N, and all keys in its right subtree are strictly greater than N.',
  },
  {
    id: 'q-bst-2',
    subjectId: 'cs-250',
    topicId: 'dsa-bst',
    topicName: 'Binary Search Trees',
    difficulty: 'easy',
    stem: 'If a new value is smaller than the current node, where should the search continue in a Binary Search Tree?',
    hint: 'Apply the BST ordering invariant to a single comparison step.',
    options: [
      { id: 'A', text: 'Right subtree' },
      { id: 'B', text: 'Left subtree' },
      { id: 'C', text: 'Parent pointer' },
      { id: 'D', text: 'Sibling node' },
    ],
    correctOption: 'B',
    explanation: 'Values smaller than the current node always reside in the left subtree by the BST ordering property.',
  },
  {
    id: 'q-trav-1',
    subjectId: 'cs-250',
    topicId: 'dsa-tree-traversal',
    topicName: 'Tree Traversal & BST Invariants',
    difficulty: 'medium',
    stem: 'Which traversal of a valid Binary Search Tree produces the node keys in sorted ascending order?',
    hint: 'Think about when the root is visited relative to the left (smaller) and right (larger) subtrees.',
    options: [
      { id: 'A', text: 'Pre-order traversal (Root, Left, Right)' },
      { id: 'B', text: 'In-order traversal (Left, Root, Right)' },
      { id: 'C', text: 'Post-order traversal (Left, Right, Root)' },
      { id: 'D', text: 'Level-order traversal (Breadth-First)' },
    ],
    correctOption: 'B',
    explanation: 'In-order traversal visits all smaller elements in the left subtree first, then the current node, and finally all larger elements in the right subtree.',
  },
  {
    id: 'q-arr-1',
    subjectId: 'cs-250',
    topicId: 'dsa-arrays',
    topicName: 'Arrays & Memory Indexing',
    difficulty: 'easy',
    stem: 'What is the worst-case time complexity of accessing an element by index in a contiguous static array?',
    hint: 'Contiguous memory layout allows direct base-address + offset arithmetic.',
    options: [
      { id: 'A', text: 'O(1) constant time' },
      { id: 'B', text: 'O(log n) logarithmic time' },
      { id: 'C', text: 'O(n) linear scan time' },
      { id: 'D', text: 'O(n log n) time' },
    ],
    correctOption: 'A',
    explanation: 'Because arrays occupy contiguous memory, address(A[i]) = base_address + i * element_size is computed in O(1) time.',
  },
  {
    id: 'q-ll-1',
    subjectId: 'cs-250',
    topicId: 'dsa-linked-lists',
    topicName: 'Functions & Linked Lists',
    difficulty: 'medium',
    stem: 'In Floyd’s Cycle-Finding Algorithm (Tortoise and Hare) on a singly linked list, how do the two pointers advance?',
    hint: 'Compare the step size of the slow pointer versus the fast pointer.',
    options: [
      { id: 'A', text: 'Both advance by 1 node, starting from different ends' },
      { id: 'B', text: 'Slow advances by 1 node while Fast advances by 2 nodes per iteration' },
      { id: 'C', text: 'Fast jumps to the tail pointer and walks backward' },
      { id: 'D', text: 'Slow advances by 2 nodes while Fast advances by 4 nodes' },
    ],
    correctOption: 'B',
    explanation: ' advancing slow by 1 step and fast by 2 steps guarantees they meet inside any cycle in O(n) time and O(1) auxiliary space.',
  },
  {
    id: 'q-trav-2',
    subjectId: 'cs-250',
    topicId: 'dsa-tree-traversal',
    topicName: 'Tree Traversal',
    difficulty: 'hard',
    stem: 'Which auxiliary data structure is required to implement an iterative Level-Order (Breadth-First) traversal of a binary tree?',
    hint: 'Nodes at depth d must be processed in First-In, First-Out order before depth d+1.',
    options: [
      { id: 'A', text: 'A LIFO Call Stack' },
      { id: 'B', text: 'A FIFO Queue' },
      { id: 'C', text: 'A Min-Heap Priority Queue' },
      { id: 'D', text: 'A Disjoint-Set Union array' },
    ],
    correctOption: 'B',
    explanation: 'Breadth-First (Level-Order) traversal enqueues children in FIFO order so each level is visited completely before the next.',
  },
  {
    id: 'q-bst-3',
    subjectId: 'cs-250',
    topicId: 'dsa-bst',
    topicName: 'Binary Search Trees & AVL Balancing',
    difficulty: 'hard',
    stem: 'What is the maximum allowed balance factor |height(left) - height(right)| for any node in a valid AVL tree?',
    hint: 'AVL trees trigger a single or double rotation as soon as a subtree height differs by 2.',
    options: [
      { id: 'A', text: 'At most 0 (perfectly balanced)' },
      { id: 'B', text: 'At most 1 (balance factor in {-1, 0, +1})' },
      { id: 'C', text: 'At most 2' },
      { id: 'D', text: 'At most log2(n)' },
    ],
    correctOption: 'B',
    explanation: 'Every node in an AVL tree maintains a balance factor of -1, 0, or +1, guaranteeing O(log n) worst-case search and insertion.',
  },
  {
    id: 'q-graph-1',
    subjectId: 'cs-250',
    topicId: 'dsa-graphs',
    topicName: 'Graph Algorithmic Topology',
    difficulty: 'hard',
    stem: 'Why does Learnova require a curriculum prerequisite knowledge graph to be a Directed Acyclic Graph (DAG)?',
    hint: 'Think about what happens to topological ordering if Topic A requires Topic B and Topic B requires Topic A.',
    options: [
      { id: 'A', text: 'Only a DAG admits a valid topological sort without circular prerequisite deadlocks' },
      { id: 'B', text: 'A DAG forces every topic to have at most one prerequisite' },
      { id: 'C', text: 'A DAG guarantees all edge weights are negative' },
      { id: 'D', text: 'A DAG prevents cross-subject prerequisite edges' },
    ],
    correctOption: 'A',
    explanation: 'A directed graph has a valid topological prerequisite ordering if and only if it contains no directed cycles (a DAG).',
  },
];

export const CERTIFICATES: CertificateRecord[] = [
  {
    certificateId: 'LRN-2024-PF-0142',
    learnerName: 'Alex Morgan',
    courseCode: 'CS-101',
    courseName: 'Programming Fundamentals',
    description: 'Rigorous academic curriculum covering imperative logic, control flow, functional decomposition, memory management, and algorithmic thinking.',
    tier: 'Mastered',
    score: 91,
    status: 'Active & Authentic',
    issueDate: 'October 14, 2024',
    isPublic: true,
  },
  {
    certificateId: 'LRN-2024-DSA-0982',
    learnerName: 'Alex Morgan',
    courseCode: 'CS-250',
    courseName: 'Data Structures and Algorithms',
    description: 'Core competency in linear structures, hierarchical tree traversals, balanced search trees, and asymptotic complexity analysis.',
    tier: 'Completed',
    score: 78,
    status: 'Active & Authentic',
    issueDate: 'November 02, 2024',
    isPublic: true,
  },
];

// ---- Question bank for the other pilot subjects (so every course has a working assessment) ----
const q = (
  id: string,
  subjectId: string,
  topicId: string,
  topicName: string,
  difficulty: DifficultyTier,
  stem: string,
  hint: string,
  options: [string, string, string, string],
  correct: 'A' | 'B' | 'C' | 'D',
  explanation: string
): DiagnosticQuestion => ({
  id,
  subjectId,
  topicId,
  topicName,
  difficulty,
  stem,
  hint,
  options: options.map((text, i) => ({ id: (['A', 'B', 'C', 'D'] as const)[i], text })),
  correctOption: correct,
  explanation,
});

export const EXTRA_QUESTIONS: DiagnosticQuestion[] = [
  q('q-pf-1', 'cs-101', 'pf-control-flow', 'Variables, Types & Control Flow', 'easy',
    'What does a loop invariant describe?', 'Think about what stays true before and after every iteration.',
    ['A value that never changes in memory', 'A condition that holds true before and after each iteration', 'The number of times the loop runs', 'A variable declared outside the loop'], 'B',
    'A loop invariant is a property that holds at the start of every iteration and is used to reason about correctness.'),
  q('q-pf-2', 'cs-101', 'pf-functions', 'Modular Functions & Call Stack', 'medium',
    'What happens to a function’s local variables when it returns?', 'Consider the stack frame lifecycle.',
    ['They persist on the heap', 'Their stack frame is popped and the storage is released', 'They are copied to the caller', 'They become global'], 'B',
    'Local variables live in the activation record, which is popped from the call stack on return.'),
  q('q-pf-3', 'cs-101', 'pf-pointers', 'Pointers & Dynamic Memory', 'hard',
    'What is a dangling pointer?', 'Think about what the pointer refers to after deallocation.',
    ['A pointer initialised to null', 'A pointer that refers to memory that has already been freed', 'A pointer to a pointer', 'A pointer to a constant'], 'B',
    'A dangling pointer references memory that was freed, so dereferencing it is undefined behaviour.'),
  q('q-oop-1', 'cs-201', 'oop-classes', 'Classes & Encapsulation', 'easy',
    'What is the main purpose of encapsulation?', 'Think about hiding internal state.',
    ['To make all members public', 'To bundle data with the methods that operate on it and restrict direct access', 'To speed up compilation', 'To allow multiple inheritance'], 'B',
    'Encapsulation protects class invariants by restricting direct access to internal state.'),
  q('q-oop-2', 'cs-201', 'oop-inheritance', 'Inheritance & Polymorphism', 'medium',
    'Which mechanism enables runtime polymorphism in C++?', 'It involves a per-class table of function pointers.',
    ['Function overloading', 'Virtual functions dispatched through a vtable', 'Templates', 'Static members'], 'B',
    'Virtual functions are resolved at runtime through the object’s vtable pointer.'),
  q('q-oop-3', 'cs-201', 'oop-patterns', 'SOLID & Design Patterns', 'hard',
    'The Dependency Inversion Principle says high-level modules should depend on…', 'Think about abstractions.',
    ['Concrete low-level classes', 'Abstractions, not concrete implementations', 'Global variables', 'Static utility functions'], 'B',
    'Both high- and low-level modules should depend on abstractions, which decouples them.'),
  q('q-daa-1', 'cs-310', 'daa-asymptotics', 'Asymptotic Complexity', 'easy',
    'Which notation gives a tight (two-sided) bound on growth?', 'Compare Big-O, Omega and Theta.',
    ['Big-O', 'Big-Omega', 'Big-Theta', 'Little-o'], 'C',
    'Theta bounds a function both above and below, giving a tight asymptotic bound.'),
  q('q-daa-2', 'cs-310', 'daa-dp', 'Dynamic Programming', 'medium',
    'What property must a problem have for dynamic programming to apply?', 'Think about subproblems being reused.',
    ['Only greedy choices', 'Optimal substructure and overlapping subproblems', 'No recursion', 'A sorted input'], 'B',
    'DP relies on optimal substructure plus overlapping subproblems so results can be memoised.'),
  q('q-daa-3', 'cs-310', 'daa-np', 'NP-Completeness', 'hard',
    'To prove a problem NP-complete you must show it is in NP and…', 'Think about reductions.',
    ['It has an exponential algorithm', 'A known NP-complete problem reduces to it in polynomial time', 'It has no solution', 'It is solvable in O(n)'], 'B',
    'NP-hardness is shown by a polynomial-time reduction from a known NP-complete problem.'),
];

export const QUESTION_BANK: DiagnosticQuestion[] = [...DIAGNOSTIC_QUESTIONS, ...EXTRA_QUESTIONS];

/** Maps topic status from a mastery percentage (business rule: <70 / 70-89 / >=90). */
export function statusFromMastery(m: number): MasteryStatus {
  return m >= 90 ? 'mastered' : m >= 70 ? 'completed' : 'not_completed';
}

/** The topic a learner should work on next: first unlocked, not-yet-completed topic. */
export function pickActiveTopic(topics: TopicNode[]): TopicNode | undefined {
  return (
    topics.find((t) => t.status === 'not_completed' && t.prerequisitesMet) ||
    topics.find((t) => t.status === 'completed') ||
    topics[topics.length - 1]
  );
}

export interface AssessmentLog {
  id: string;
  courseId: string;
  type: 'Initial Diagnostic' | 'Micro-Assessment';
  title: string;
  date: string; // ISO
  correct: number;
  total: number;
  confidence: number; // 0-100
}

export interface MasterySnapshot {
  ts: string; // ISO
  courseId: string;
  mastery: number;
  confidence: number;
}
