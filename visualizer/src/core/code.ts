/* ============================================================
   DSA Visualizer Studio — 5-language synced code panel data.
   Every language file has the SAME semantic structure so a single
   step maps to the same line number in each. Lines 1-based.
   ============================================================ */

export interface CodeLang {
  id: string
  label: string
  filename: string
  /** 1-based line -> highlighted region key, and reverse map. */
  lines: string[]
}

export const CODE_LANGS: CodeLang[] = [
  {
    id: 'c',
    label: 'C',
    filename: 'traversal.c',
    lines: [
      '#include <stdio.h>',
      '',
      'int main(void) {',
      '    int a[] = {2, 5, 1, 8, 3};',
      '    int n = 5, sum = 0, i;',
      '    for (i = 0; i < n; i++) {',
      '        sum += a[i];               /* forward: running sum */',
      '    }',
      '    printf("sum = %d\\n", sum);',
      '    int sufMax = a[n - 1];         /* reverse: suffix max */',
      '    for (i = n - 1; i >= 0; i--) {',
      '        if (a[i] > sufMax) sufMax = a[i];',
      '    }',
      '    return 0;',
      '}',
      '',
    ],
  },
  {
    id: 'cpp',
    label: 'C++',
    filename: 'traversal.cpp',
    lines: [
      '#include <iostream>',
      '#include <vector>',
      '',
      'int main() {',
      '    std::vector<int> a = {2, 5, 1, 8, 3};',
      '    int n = (int)a.size(), sum = 0;',
      '    for (int i = 0; i < n; i++) {',
      '        sum += a[i];               // forward: running sum',
      '    }',
      '    std::cout << "sum = " << sum << "\\n";',
      '    int sufMax = a[n - 1];         // reverse: suffix max',
      '    for (int i = n - 1; i >= 0; i--) {',
      '        if (a[i] > sufMax) sufMax = a[i];',
      '    }',
      '    return 0;',
      '}',
      '',
    ],
  },
  {
    id: 'java',
    label: 'Java',
    filename: 'Traversal.java',
    lines: [
      'public class Traversal {',
      '    public static void main(String[] args) {',
      '        int[] a = {2, 5, 1, 8, 3};',
      '        int n = a.length, sum = 0;',
      '        for (int i = 0; i < n; i++) {',
      '            sum += a[i];            // forward: running sum',
      '        }',
      '        System.out.println("sum = " + sum);',
      '        int sufMax = a[n - 1];      // reverse: suffix max',
      '        for (int i = n - 1; i >= 0; i--) {',
      '            if (a[i] > sufMax) sufMax = a[i];',
      '        }',
      '    }',
      '}',
      '',
    ],
  },
  {
    id: 'python',
    label: 'Python',
    filename: 'traversal.py',
    lines: [
      'a = [2, 5, 1, 8, 3]',
      '',
      '# forward: running sum',
      'total = 0',
      'for i in range(len(a)):',
      '    total += a[i]',
      'print("sum =", total)',
      '',
      '# reverse: suffix max',
      'suf_max = a[-1]',
      'for i in range(len(a) - 1, -1, -1):',
      '    if a[i] > suf_max:',
      '        suf_max = a[i]',
      '',
    ],
  },
  {
    id: 'dart',
    label: 'Dart',
    filename: 'traversal.dart',
    lines: [
      'void main() {',
      '  var a = [2, 5, 1, 8, 3];',
      '  int sum = 0;',
      '  for (var i = 0; i < a.length; i++) {',
      '    sum += a[i];                // forward: running sum',
      '  }',
      '  print("sum = \${sum}");',
      '  int sufMax = a[a.length - 1]; // reverse: suffix max',
      '  for (var i = a.length - 1; i >= 0; i--) {',
      '    if (a[i] > sufMax) sufMax = a[i];',
      '  }',
      '}',
      '',
    ],
  },
]

export function languageById(id: string): CodeLang {
  return CODE_LANGS.find((l) => l.id === id) ?? CODE_LANGS[0]
}
