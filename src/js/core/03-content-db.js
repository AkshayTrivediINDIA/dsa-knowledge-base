/* ============================================================
   DSA Knowledge Base - script.js (module: content-db)
   Content Database + App Logic | Vanilla JS | No dependencies
   ============================================================ */

/* ---------- Content Database (populated by content/*.js modules) ---------- */

var DB = {};

/* ---------- Data Structure Category Cards ---------- */

var DS_CARDS = [
    {
        id: 'array', title: 'Array',
        desc: 'Memory layout, traversal, prefix sums, 12 sorting algorithms, 7 search algorithms, hashing, and 16 interview problems with 5-language solutions.',
        icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="8" height="8" rx="1.5"/><rect x="14" y="2" width="8" height="8" rx="1.5"/><rect x="2" y="14" width="8" height="8" rx="1.5"/><rect x="14" y="14" width="8" height="8" rx="1.5"/></svg>',
        color: '#0969da', colorVar: 'var(--accent-primary)',
        status: 'active', topics: 39, problems: 16,
        path: 'research/array',
        expectedTopics: []
    },
    {
        id: 'linked-list', title: 'Linked List',
        desc: 'Singly, doubly, and circular linked lists. Reversal, cycle detection, and merge patterns.',
        icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="12" r="2.5"/><circle cx="12" cy="12" r="2.5"/><circle cx="19" cy="12" r="2.5"/><line x1="7.5" y1="12" x2="9.5" y2="12"/><line x1="14.5" y1="12" x2="16.5" y2="12"/></svg>',
        color: '#1a7f37', colorVar: 'var(--accent-success)',
        status: 'comingsoon', topics: 0, problems: 0,
        path: 'coming-soon/linked-list',
        expectedTopics: ['Singly Linked List', 'Doubly Linked List', 'Fast & Slow Pointers', 'Reversal', 'Merge Lists', 'Cycle Detection']
    },
    {
        id: 'stack', title: 'Stack',
        desc: 'LIFO structure for expression evaluation, balanced parentheses, and monotonic stack patterns.',
        icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="14" width="16" height="4" rx="1"/><rect x="4" y="8" width="16" height="4" rx="1"/><rect x="4" y="2" width="16" height="4" rx="1"/></svg>',
        color: '#9a6700', colorVar: 'var(--accent-warning)',
        status: 'comingsoon', topics: 0, problems: 0,
        path: 'coming-soon/stack',
        expectedTopics: ['Stack Basics', 'Balanced Parentheses', 'Next Greater Element', 'Monotonic Stack', 'Expression Evaluation', 'Min Stack']
    },
    {
        id: 'queue', title: 'Queue',
        desc: 'FIFO structure, deque, circular queue, and BFS traversal patterns.',
        icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="7" width="14" height="10" rx="2"/><line x1="17" y1="10" x2="21" y2="10"/><line x1="17" y1="14" x2="21" y2="14"/><circle cx="21" cy="10" r="1.5"/><circle cx="21" cy="14" r="1.5"/></svg>',
        color: '#8250df', colorVar: 'var(--accent-purple)',
        status: 'comingsoon', topics: 0, problems: 0,
        path: 'coming-soon/queue',
        expectedTopics: ['Queue Basics', 'Circular Queue', 'Deque', 'BFS Traversal', 'Sliding Window Maximum', 'Level Order Traversal']
    },
    {
        id: 'hash-table', title: 'Hash Table',
        desc: 'Hashing fundamentals, collision handling, frequency counting, and two-sum patterns.',
        icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><circle cx="6.5" cy="6.5" r="1.2"/><circle cx="17.5" cy="6.5" r="1.2"/><circle cx="6.5" cy="17.5" r="1.2"/><circle cx="17.5" cy="17.5" r="1.2"/></svg>',
        color: '#cf222e', colorVar: 'var(--accent-danger)',
        status: 'comingsoon', topics: 0, problems: 0,
        path: 'coming-soon/hash-table',
        expectedTopics: ['Hash Map Basics', 'Hash Set', 'Frequency Counting', 'Two Sum Pattern', 'Group Anagrams', 'Consistent Hashing']
    },
    {
        id: 'tree', title: 'Binary Tree',
        desc: 'Tree traversals, BST operations, LCA, and serialization patterns.',
        icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="4" r="2.5"/><circle cx="5" cy="13" r="2.5"/><circle cx="19" cy="13" r="2.5"/><line x1="10.5" y1="6" x2="6.5" y2="11"/><line x1="13.5" y1="6" x2="17.5" y2="11"/><circle cx="2" cy="21" r="1.5"/><circle cx="8" cy="21" r="1.5"/><line x1="4" y1="15" x2="3" y2="19.5"/><line x1="6" y1="15" x2="7" y2="19.5"/></svg>',
        color: '#1a7f37', colorVar: 'var(--accent-green)',
        status: 'comingsoon', topics: 0, problems: 0,
        path: 'coming-soon/tree',
        expectedTopics: ['Tree Traversals', 'BST Operations', 'Lowest Common Ancestor', 'Path Sum', 'Serialization', 'Balanced Tree Check']
    },
    {
        id: 'heap', title: 'Heap / Priority Queue',
        desc: 'Min/max heap, top-K problems, and merge-K sorted patterns.',
        icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="4" r="2.5"/><circle cx="5" cy="10" r="2.5"/><circle cx="19" cy="10" r="2.5"/><circle cx="2" cy="18" r="2"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/><circle cx="22" cy="18" r="2"/><line x1="10.5" y1="6" x2="6.5" y2="8"/><line x1="13.5" y1="6" x2="17.5" y2="8"/><line x1="4" y1="12" x2="3" y2="16"/><line x1="6" y1="12" x2="7" y2="16"/><line x1="18" y1="12" x2="17" y2="16"/><line x1="20" y1="12" x2="21" y2="16"/></svg>',
        color: '#9a6700', colorVar: 'var(--accent-warning)',
        status: 'comingsoon', topics: 0, problems: 0,
        path: 'coming-soon/heap',
        expectedTopics: ['Min Heap', 'Max Heap', 'Priority Queue', 'Top-K Elements', 'Merge K Sorted', 'Median of Stream']
    },
    {
        id: 'graph', title: 'Graph',
        desc: 'BFS, DFS, shortest path, topological sort, and union-find patterns.',
        icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="7.5" y1="8" x2="11" y2="16"/><line x1="16.5" y1="8" x2="13" y2="16"/></svg>',
        color: '#0969da', colorVar: 'var(--accent-primary)',
        status: 'comingsoon', topics: 0, problems: 0,
        path: 'coming-soon/graph',
        expectedTopics: ['Graph Representation', 'BFS & DFS', 'Shortest Path', 'Topological Sort', 'Cycle Detection', 'Minimum Spanning Tree']
    },
    {
        id: 'trie', title: 'Trie',
        desc: 'Prefix tree for string search, autocomplete, and word games.',
        icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="3" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="3" cy="21" r="1.5"/><circle cx="9" cy="21" r="1.5"/><circle cx="15" cy="21" r="1.5"/><circle cx="21" cy="21" r="1.5"/><line x1="11" y1="5" x2="7" y2="10"/><line x1="13" y1="5" x2="17" y2="10"/><line x1="5" y1="14" x2="3.5" y2="19.5"/><line x1="7" y1="14" x2="8.5" y2="19.5"/><line x1="17" y1="14" x2="15.5" y2="19.5"/><line x1="19" y1="14" x2="20.5" y2="19.5"/></svg>',
        color: '#8250df', colorVar: 'var(--accent-purple)',
        status: 'comingsoon', topics: 0, problems: 0,
        path: 'coming-soon/trie',
        expectedTopics: ['Trie Basics', 'Prefix Search', 'Word Search', 'Autocomplete', 'Palindrome Pairs', 'Word Dictionary']
    },
    {
        id: 'union-find', title: 'Union-Find',
        desc: 'Disjoint set for connected components, cycle detection, and Kruskal\'s algorithm.',
        icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="7" cy="7" r="4"/><circle cx="17" cy="7" r="4"/><circle cx="12" cy="17" r="4"/><line x1="10" y1="9" x2="14" y2="9" stroke-dasharray="2 2"/></svg>',
        color: '#1a7f37', colorVar: 'var(--accent-success)',
        status: 'comingsoon', topics: 0, problems: 0,
        path: 'coming-soon/union-find',
        expectedTopics: ['Disjoint Set', 'Union by Rank', 'Path Compression', 'Connected Components', 'Redundant Connection', 'Accounts Merge']
    },
    {
        id: 'dp', title: 'Dynamic Programming',
        desc: 'Memoization, tabulation, knapsack, LIS, and string distance patterns.',
        icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9.5" y="2" width="5" height="5" rx="1"/><rect x="17" y="2" width="5" height="5" rx="1"/><rect x="2" y="9.5" width="5" height="5" rx="1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><rect x="17" y="9.5" width="5" height="5" rx="1"/><rect x="2" y="17" width="5" height="5" rx="1"/><rect x="9.5" y="17" width="5" height="5" rx="1"/><rect x="17" y="17" width="5" height="5" rx="1"/></svg>',
        color: '#cf222e', colorVar: 'var(--accent-danger)',
        status: 'comingsoon', topics: 0, problems: 0,
        path: 'coming-soon/dp',
        expectedTopics: ['1D DP', '2D DP', 'Knapsack', 'Longest Common Subsequence', 'Edit Distance', 'Matrix Chain']
    },
    {
        id: 'greedy', title: 'Greedy',
        desc: 'Greedy choice property, interval scheduling, and optimization patterns.',
        icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
        color: '#953800', colorVar: 'var(--accent-orange)',
        status: 'comingsoon', topics: 0, problems: 0,
        path: 'coming-soon/greedy',
        expectedTopics: ['Greedy Basics', 'Activity Selection', 'Huffman Coding', 'Job Sequencing', 'Fractional Knapsack', 'Interval Scheduling']
    },
    {
        id: 'backtracking', title: 'Backtracking',
        desc: 'Recursive exploration with pruning for permutations, combinations, and constraint satisfaction.',
        icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v8l4-2"/><circle cx="12" cy="12" r="3"/><path d="M12 15l-4 2"/><path d="M12 15l4 2"/><path d="M8 17l-3 4"/><path d="M16 17l3 4"/></svg>',
        color: '#0969da', colorVar: 'var(--accent-primary)',
        status: 'comingsoon', topics: 0, problems: 0,
        path: 'coming-soon/backtracking',
        expectedTopics: ['Subsets', 'Permutations', 'Combination Sum', 'N-Queens', 'Sudoku Solver', 'Word Search']
    },
    {
        id: 'bit', title: 'Bit Manipulation',
        desc: 'Bitwise operations, masking, and XOR tricks for efficient computation.',
        icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><text x="3" y="18" font-family="monospace" font-size="14" fill="currentColor" stroke="none">01</text><text x="14" y="18" font-family="monospace" font-size="14" fill="currentColor" stroke="none">10</text></svg>',
        color: '#8250df', colorVar: 'var(--accent-purple)',
        status: 'comingsoon', topics: 0, problems: 0,
        path: 'coming-soon/bit',
        expectedTopics: ['Bit Basics', 'XOR Tricks', 'Bit Masking', 'Single Number', 'Counting Bits', 'Power of Two']
    },
    {
        id: 'string', title: 'String',
        desc: 'Anagram checks, palindrome patterns, substring search (KMP), and sliding-window techniques on strings.',
        icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><text x="4" y="18" font-family="monospace" font-size="14" fill="currentColor" stroke="none">Aa</text><path d="M5 3v3"/><path d="M19 3v3"/><line x1="5" y1="6" x2="19" y2="6"/></svg>',
        color: '#953800', colorVar: 'var(--accent-orange)',
        status: 'comingsoon', topics: 0, problems: 0,
        path: 'coming-soon/string',
        expectedTopics: ['String Basics', 'Anagram Checks', 'Palindrome', 'Substring Search (KMP)', 'Sliding Window on Strings', 'Pattern Matching']
    }
];

/* ---------- Home Dashboard Cards (kept for backward compat) ---------- */

var HOME_CARDS = [
    { path: 'research/array', title: 'Array Research', desc: 'Memory layout, static vs dynamic arrays, cache behavior, complexity reference and FAQ.' },
    { path: 'topics/traversal', title: 'Traversal', desc: 'Forward, reverse and stride iteration — the base of every array algorithm.' },
    { path: 'topics/prefix-sum', title: 'Prefix Sum', desc: 'O(1) range-sum queries in 1D and 2D using cumulative arrays.' },
    { path: 'topics/difference-array', title: 'Difference Array', desc: 'O(1) range updates with deferred materialization.' },
    { path: 'topics/sliding-window', title: 'Sliding Window', desc: 'Fixed and variable windows for contiguous subarray constraints.' },
    { path: 'topics/two-pointers', title: 'Two Pointers', desc: 'Opposite-end and same-direction pointers to beat nested loops.' },
    { path: 'topics/kadane', title: 'Kadane', desc: 'Maximum subarray sum in O(n) time, O(1) space.' },
    { path: 'topics/bubble-sort', title: 'Sorting Algorithms', desc: '12 sorting algorithms: bubble, selection, insertion, merge, quick, heap, counting, radix, bucket, shell, tim, and cycle sort.' },
    { path: 'topics/binary-search', title: 'Search Algorithms', desc: '7 search algorithms: binary, linear, ternary, jump, interpolation, exponential, and fibonacci search.' },
    { path: 'topics/hashing', title: 'Hashing', desc: 'Frequency arrays and hashmaps for membership and counting.' },
    { path: 'topics/matrix', title: 'Matrix / 2D Array', desc: 'Neighbor traversal, transpose, rotation and spiral recipes.' },
    { path: 'topics/merge-intervals', title: 'Merge Intervals', desc: 'Sort + sweep for merging, inserting and intersecting intervals.' },
    { path: 'topics/dutch-national-flag', title: 'Dutch National Flag', desc: 'Three-way partition of 0s, 1s and 2s in one pass.' },
    { path: 'topics/binary-search-answer', title: 'Binary Search on Answer', desc: 'Minimize the maximum with a monotone feasibility check.' },
    { path: 'topics/complexity', title: 'Complexity Analysis', desc: 'Big-O hierarchy, space analysis and how to talk through it.' },
    { path: 'interview/easy', title: 'Interview — Easy', desc: 'Two Sum, buy/sell stock, move zeroes, majority element and more.' },
    { path: 'interview/medium', title: 'Interview — Medium', desc: 'Prefix-sum + hash, sliding windows, merge intervals and product subarrays.' },
    { path: 'interview/hard', title: 'Interview — Hard', desc: 'Binary search on answer, trapping rain water, monotonic deque.' },
    { path: 'leetcode/easy', title: 'LeetCode Easy', desc: '15 warm-up problems mapped to named patterns.' },
    { path: 'leetcode/medium', title: 'LeetCode Medium', desc: '18 interview-target problems grouped by technique.' },
    { path: 'leetcode/hard', title: 'LeetCode Hard', desc: 'The optimization tier — deque, index-hash, merge-sort tricks.' },
    { path: 'codeforces/div3', title: 'Codeforces Div 3', desc: 'Observation-heavy array problems with fast I/O patterns.' },
    { path: 'codeforces/div2', title: 'Codeforces Div 2', desc: 'Invariant tricks, difference arrays and constraint reading.' },
    { path: 'codeforces/patterns', title: 'Codeforces Patterns', desc: 'The reusable tricks that appear in every contest.' },
    { path: 'snippets', title: 'Code Snippets', desc: 'One place, five languages — every snippet explained line by line.' },
    { path: 'patterns/overview', title: 'Patterns Cheat Sheet', desc: 'Detector phrases, hint words, and a full complexity reference.' }
];
