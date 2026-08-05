/* ============================================================
   DSA Knowledge Base - script.js (module: lang-tables)
   Content Database + App Logic | Vanilla JS | No dependencies
   ============================================================ */

/* ---------- Reference Library ----------
   Every explained code line must carry a learnable reference.
   Authors may write an inline markdown link [label](url), OR use
   the {token} shorthand below, which renderExplain() expands into
   a real documentation link. validate.js enforces that each
   explained line has at least one resolvable reference. */

var REFS = {
    c: {
        main: 'https://en.cppreference.com/w/c/language/main_function',
        printf: 'https://en.cppreference.com/w/c/io/fprintf',
        scanf: 'https://en.cppreference.com/w/c/io/fscanf',
        printf_variadic: 'https://en.cppreference.com/w/c/variadic',
        malloc: 'https://en.cppreference.com/w/c/memory/malloc',
        calloc: 'https://en.cppreference.com/w/c/memory/calloc',
        realloc: 'https://en.cppreference.com/w/c/memory/realloc',
        free: 'https://en.cppreference.com/w/c/memory/free',
        sizeof: 'https://en.cppreference.com/w/c/language/sizeof',
        for: 'https://www.learn-c.org/en/For_loops',
        while: 'https://www.learn-c.org/en/While_loops',
        if: 'https://www.learn-c.org/en/If_Statements',
        array: 'https://www.learn-c.org/en/Arrays',
        pointer: 'https://www.learn-c.org/en/Pointers',
        return: 'https://en.cppreference.com/w/c/language/return',
        stdio: 'https://en.cppreference.com/w/c/header/stdio',
        qsort: 'https://en.cppreference.com/w/c/algorithm/qsort'
    },
    cpp: {
        main: 'https://en.cppreference.com/w/cpp/language/main_function',
        vector: 'https://en.cppreference.com/w/cpp/container/vector',
        sort: 'https://en.cppreference.com/w/cpp/algorithm/sort',
        lower_bound: 'https://en.cppreference.com/w/cpp/algorithm/lower_bound',
        upper_bound: 'https://en.cppreference.com/w/cpp/algorithm/upper_bound',
        accumulate: 'https://en.cppreference.com/w/cpp/algorithm/accumulate',
        cin: 'https://en.cppreference.com/w/cpp/io/cin',
        cout: 'https://en.cppreference.com/w/cpp/io/cout',
        ios: 'https://en.cppreference.com/w/cpp/io/ios_base/sync_with_stdio',
        namespace: 'https://en.cppreference.com/w/cpp/language/namespace',
        auto: 'https://en.cppreference.com/w/cpp/language/auto',
        lambda: 'https://en.cppreference.com/w/cpp/language/lambda',
        pair: 'https://en.cppreference.com/w/cpp/utility/pair',
        max: 'https://en.cppreference.com/w/cpp/algorithm/max',
        min: 'https://en.cppreference.com/w/cpp/algorithm/min',
        array: 'https://en.cppreference.com/w/cpp/language/array'
    },
    java: {
        main: 'https://docs.oracle.com/javase/tutorial/getStarted/application/index.html',
        class: 'https://docs.oracle.com/javase/tutorial/java/javaOO/classdecl.html',
        import: 'https://docs.oracle.com/javase/tutorial/java/package/usepkgs.html',
        scanner: 'https://docs.oracle.com/javase/8/docs/api/java/util/Scanner.html',
        HashMap: 'https://docs.oracle.com/javase/8/docs/api/java/util/HashMap.html',
        HashSet: 'https://docs.oracle.com/javase/8/docs/api/java/util/HashSet.html',
        ArrayList: 'https://docs.oracle.com/javase/8/docs/api/java/util/ArrayList.html',
        Arrays: 'https://docs.oracle.com/javase/8/docs/api/java/util/Arrays.html',
        Arrays_sort: 'https://docs.oracle.com/javase/8/docs/api/java/util/Arrays.html#sort-int:A-',
        binarySearch: 'https://docs.oracle.com/javase/8/docs/api/java/util/Arrays.html#binarySearch-int:A-int-',
        Math: 'https://docs.oracle.com/javase/8/docs/api/java/lang/Math.html',
        System: 'https://docs.oracle.com/javase/8/docs/api/java/lang/System.html',
        println: 'https://docs.oracle.com/javase/8/docs/api/java/io/PrintStream.html#println-java.lang.String-',
        for: 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/for.html',
        if: 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/if.html',
        return: 'https://docs.oracle.com/javase/tutorial/java/javaOO/returnvalue.html'
    },
    python: {
        main: 'https://docs.python.org/3/library/__main__.html',
        def: 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions',
        for: 'https://docs.python.org/3/tutorial/controlflow.html#for-statements',
        range: 'https://docs.python.org/3/library/stdtypes.html#range',
        list: 'https://docs.python.org/3/tutorial/datastructures.html#more-on-lists',
        dict: 'https://docs.python.org/3/tutorial/datastructures.html#dictionaries',
        set: 'https://docs.python.org/3/tutorial/datastructures.html#sets',
        enumerate: 'https://docs.python.org/3/library/functions.html#enumerate',
        input: 'https://docs.python.org/3/library/functions.html#input',
        print: 'https://docs.python.org/3/library/functions.html#print',
        accumulate: 'https://docs.python.org/3/library/itertools.html#itertools.accumulate',
        Counter: 'https://docs.python.org/3/library/collections.html#collections.Counter',
        bisect: 'https://docs.python.org/3/library/bisect.html',
        lambda: 'https://docs.python.org/3/tutorial/controlflow.html#lambda-expressions',
        max: 'https://docs.python.org/3/library/functions.html#max',
        min: 'https://docs.python.org/3/library/functions.html#min',
        append: 'https://docs.python.org/3/tutorial/datastructures.html#more-on-lists',
        if: 'https://docs.python.org/3/tutorial/controlflow.html#if-statements'
    },
    dart: {
        main: 'https://dart.dev/language/functions#the-main-function',
        var: 'https://dart.dev/language/variables',
        final: 'https://dart.dev/language/variables#final-and-const',
        List: 'https://dart.dev/language/collections#lists',
        Map: 'https://dart.dev/language/collections#maps',
        Set: 'https://dart.dev/language/collections#sets',
        for: 'https://dart.dev/language/loops#for-loops',
        forin: 'https://dart.dev/language/loops#for-in',
        while: 'https://dart.dev/language/loops#while-and-do-while',
        if: 'https://dart.dev/language/branches#if',
        print: 'https://dart.dev/language/functions#the-print-function',
        stdin: 'https://api.dart.dev/stable/dart-io/Stdin-class.html',
        dartio: 'https://dart.dev/libraries/dart-io',
        readLineSync: 'https://api.dart.dev/stable/dart-io/Stdin-class.html#method-readLineSync',
        add: 'https://api.dart.dev/stable/dart-core/List-class.html#method-add',
        sort: 'https://api.dart.dev/stable/dart-core/List-class.html#method-sort',
        growable: 'https://dart.dev/language/collections#list-literal-collections',
        length: 'https://api.dart.dev/stable/dart-core/List-class.html#property-length'
    }
};

function refUrl(lang, token) {
    var table = REFS[lang] || {};
    return table[token] || null;
}

/* ---------- Language Ordering & Labels ----------
   Shared by the language switcher UI, code block headers and the
   explain group tabs. Kept in the first module so the renderer can
   build <select> options without depending on module load order. */

var LANG_ORDER = ['c', 'cpp', 'java', 'python', 'dart'];

var LANG_TAB_LABELS = { c: 'C', cpp: 'C++', java: 'Java', python: 'Python', dart: 'Dart' };

function langName(l) {
    return LANG_TAB_LABELS[l] || String(l || '').toUpperCase();
}

function langSelectOptions(currentLang) {
    return LANG_ORDER.map(function (l) {
        return '<option value="' + l + '"' + (l === currentLang ? ' selected' : '') + '>' + langName(l) + '</option>';
    }).join('');
}

/* ---------- Language Tables (Syntax Highlighting) ---------- */

var LANG_LABELS = {
    c: 'C',
    cpp: 'C++',
    java: 'Java',
    python: 'Python',
    dart: 'Dart'
};

var LANG_KEYWORDS = {
    c: ['auto','break','case','const','continue','default','do','else','enum','extern','for','goto','if','register','return','sizeof','static','struct','switch','typedef','union','while','volatile','inline'],
    cpp: ['auto','break','case','catch','class','const','constexpr','continue','default','delete','do','else','enum','explicit','extern','for','friend','if','inline','namespace','new','noexcept','nullptr','operator','override','private','protected','public','register','return','sizeof','static','struct','switch','template','this','throw','try','typedef','typename','union','using','virtual','while','volatile'],
    java: ['abstract','assert','break','case','catch','class','const','continue','default','do','else','enum','extends','final','finally','for','goto','if','implements','import','instanceof','interface','native','new','package','private','protected','public','return','static','strictfp','super','switch','synchronized','this','throw','throws','transient','try','void','volatile','while'],
    python: ['and','as','assert','async','await','break','class','continue','def','del','elif','else','except','finally','for','from','global','if','import','in','is','lambda','nonlocal','not','or','pass','raise','return','try','while','with','yield'],
    dart: ['abstract','as','assert','async','await','break','case','catch','class','const','continue','covariant','default','deferred','do','dynamic','else','enum','export','extends','extension','external','factory','final','finally','for','get','hide','if','implements','import','in','interface','is','library','mixin','new','on','operator','part','rethrow','return','set','show','static','super','switch','sync','this','throw','try','typedef','var','void','while','with','yield']
};

var LANG_TYPES = {
    c: ['int','char','float','double','long','short','unsigned','signed','void'],
    cpp: ['int','char','float','double','long','short','unsigned','signed','void','bool','string','vector','list','map','set','unordered_map','unordered_set','stack','queue','deque','pair','auto'],
    java: ['int','char','float','double','long','short','byte','boolean','String','Object','Integer','Long','Double','Float','Boolean','Character','int[]','String[]'],
    python: ['int','float','str','bool','list','dict','set','tuple','bytes'],
    dart: ['int','double','num','bool','String','List','Map','Set','Object','Future','Stream']
};

var LANG_BUILTINS = {
    c: ['printf','scanf','fprintf','fscanf','sprintf','snprintf','malloc','calloc','realloc','free','memcpy','memset','strlen','strcmp','strcpy','exit','NULL','return'],
    cpp: ['cout','cin','endl','printf','scanf','push_back','pop_back','make_pair','sort','reverse','max','min','swap','binary_search','lower_bound','upper_bound','NULL','true','false','int','vector'],
    java: ['System','out','println','print','main','Math','Arrays','ArrayList','HashMap','HashSet','LinkedList','Stack','Queue','PriorityQueue','Scanner','StringBuilder','StringBuffer','Collections','Integer'],
    python: ['print','len','range','int','str','float','list','dict','set','tuple','sorted','min','max','sum','abs','any','all','enumerate','zip','map','filter','isinstance','input','open','True','False','None'],
    dart: ['print','main','max','min','sort','map','where','fold','reduce','length','isEmpty','isEmptyOrNull']
};
