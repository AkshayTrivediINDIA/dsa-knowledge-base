/* ============================================================
   DSA Knowledge Base - script.js (module: content:12-research)
   Content Database + App Logic | Vanilla JS | No dependencies
   ============================================================ */

/* Pages: research/array */

DB["research/array"] = {  
        title: 'Array Research Notes',
        crumbs: ['Home', 'Data Structures', 'Array', 'Research'],
        tags: ['array', 'research', 'memory', 'cache', 'complexity'],
        content: [
            '# Array Research Notes',
            '',
            'Research verified from GeeksforGeeks, LeetCode editorials, academic papers (Kadane proof — UMD CMSC 351, Bitner 1982) and The DSA Handbook.',
            '',
            '## Memory Layout',
            '',
            'An array stores elements in **contiguous memory**. Element `arr[i]` lives at address `base + i * sizeof(element)`. That is why random access is O(1): the address is pure arithmetic, no pointer chasing required.',
            '',
            '~~~cpp',
            'int arr[5] = {10, 20, 30, 40, 50};',
            '// arr[3] is located at  base + 3 * sizeof(int)',
            'int x = arr[3];  // O(1)',
            '~~~',
            '',
            '> [!info] Why contiguous memory matters',
            '> The CPU loads memory in cache lines (typically 64 bytes). Scanning an array reads one line at a time and reuses it fully — far faster than walking a linked list, whose nodes are scattered in memory.',
            '',
            '## Static vs Dynamic Arrays',
            '',
            '| Property | Static Array | Dynamic Array |',
            '|---|---|---|',
            '| Size | Fixed at compile time | Grows at runtime |',
            '| Resize | Impossible | Doubling strategy |',
            '| Append cost | — | O(1) amortized |',
            '| Storage | Stack (local) | Heap |',
            '| Example | `int a[10]` | `vector<int>` / `ArrayList` |',
            '',
            '## Complexity Reference',
            '',
            '| Operation | Complexity | Notes |',
            '|---|---|---|',
            '| Access `arr[i]` | O(1) | Direct addressing |',
            '| Search (unsorted) | O(n) | Linear scan |',
            '| Search (sorted) | O(log n) | Binary search |',
            '| Append (end) | O(1) amortized | Doubling on overflow |',
            '| Insert (middle) | O(n) | Shift elements |',
            '| Delete (middle) | O(n) | Shift elements |',
            '',
            '## FAQ',
            '',
            '1. **Why is access O(1)?** Because the address is computed arithmetically: `base + offset`.',
            '2. **What is cache locality?** Consecutive elements occupy the same cache lines, so sequential reads hit the cache.',
            '3. **What happens on dynamic resize?** A new larger block is allocated and all elements are copied — O(n) once, but amortized to O(1) per append.',
            '',
            '> [!warning] Common pitfall',
            '> Off-by-one errors and uninitialized reads are the top array bugs. Always bounds-check before indexing.'
        ].join('\n')
  };
