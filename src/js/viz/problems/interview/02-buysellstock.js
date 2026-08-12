/* ============================================================
   DSA Knowledge Base - module: viz/problems/interview/02-buysellstock
   Best Time to Buy & Sell: one pass. Track the cheapest price
   seen so far; at each day compute profit = price - minSoFar
   and keep the best. Mounts on code/buysellstock.
   ============================================================ */

function vizIvBuySellFrames(state) {
    var prices = state.prices || [];
    var n = prices.length;
    var frames = [];

    function push(narr, extra) {
        var f = { narr: narr, arr: prices, highlight: {}, vars: {} };
        for (var k in extra) f[k] = extra[k];
        frames.push(f);
    }

    if (!n) { frames.push({ narr: 'Empty array — nothing to trade.', arr: [], vars: {} }); return frames; }

    var minSoFar = prices[0];
    var minIdx = 0;
    var best = 0;
    var buyI = 0, sellI = 0;

    push('One pass: keep the cheapest price seen so far (buy low). At each day compute profit vs that low. O(n).',
        { highlight: { 0: 'left' }, vars: { day: 0, min: minSoFar, profit: 0, best: 0 }, log: 'init' });

    for (var i = 1; i < n; i++) {
        var profit = prices[i] - minSoFar;
        var h = {};
        h[minIdx] = 'left';
        h[i] = 'active';
        if (prices[i] < minSoFar) {
            h[minIdx] = 'dim';
            minSoFar = prices[i];
            minIdx = i;
            h[i] = 'left';
            push('Day ' + i + ': price ' + prices[i] + ' is a new low \u2192 buy here instead. min so far = ' + minSoFar + '.',
                { highlight: h, vars: { day: i, min: minSoFar, profit: 0, best: best } });
        } else if (profit > best) {
            best = profit;
            buyI = minIdx; sellI = i;
            var h2 = {};
            h2[buyI] = 'found';
            h2[sellI] = 'found';
            push('Day ' + i + ': sell at ' + prices[i] + ' \u2192 profit ' + profit + ' is a NEW BEST. (buy day ' + buyI + ', sell day ' + sellI + ')',
                { highlight: h2, vars: { day: i, min: minSoFar, profit: profit, best: best }, log: 'new best' });
        } else {
            push('Day ' + i + ': price ' + prices[i] + ', profit vs ' + minSoFar + ' = ' + profit + ' \u2014 not better than ' + best + '.',
                { highlight: h, vars: { day: i, min: minSoFar, profit: profit, best: best } });
        }
    }

    var hf = {};
    hf[buyI] = 'found';
    hf[sellI] = 'found';
    push('Maximum profit = ' + best + (best > 0 ? ' (buy day ' + buyI + ' at ' + prices[buyI] + ', sell day ' + sellI + ' at ' + prices[sellI] + ')' : ' \u2014 prices never go up') + '.',
        { highlight: hf, vars: { best: best }, log: 'done' });

    return frames;
}

VIZ_CONFIG['buysellstock'] = {
    title: 'Best Time to Buy & Sell Stock — one-pass min-so-far',
    family: 'buysellstock',
    defaultState: { prices: [7, 1, 5, 3, 6, 4] },
    inputs: [
        { key: 'prices', label: 'Prices', value: '7, 1, 5, 3, 6, 4', placeholder: '7, 1, 5, 3, 6, 4', parse: vizParseList }
    ],
    legend: [
        { label: 'buy (min so far)', color: 'vz-left' },
        { label: 'examining day', color: 'vz-active' },
        { label: 'best buy/sell pair', color: 'vz-found' }
    ],
    stepMs: 1150,
    simulate: vizIvBuySellFrames
};

/* ---------- Focus Mode config ---------- */

FOCUS_CONFIG['buysellstock'] = {
    title: 'Best Time to Buy & Sell Stock — Focus Mode',
    viz: 'buysellstock',
    codeGroup: 'buysellstock',
    tagline: 'Buy low, remember the low.',
    lead: 'Compare every buy/sell pair, then realize just tracking the cheapest price so far is enough.',
    optLabel: 'Min-so-far scan',
    beats: [
        {
            narr: 'Brute force checks every buy/sell pair — for 6 days that is 15 pairs to evaluate.',
            brute: 1,
            opt: 1
        },
        {
            narr: 'Each new day re-checks every earlier buy price: O(n\u00b2) pair evaluations.',
            brute: 15,
            opt: 6
        },
        {
            narr: 'The optimum must buy at the cheapest price seen before the sell day. One pass tracking the minimum so far gives the best profit in O(n).',
            brute: 15,
            opt: 2
        }
    ],
    recap:
        'The best sell day sells at the highest profit, and that profit is always price[day] minus the cheapest price that came before. ' +
        'So keep a running minimum as you walk forward and compute the profit at every day, remembering the largest. ' +
        'One O(n) pass replaces O(n\u00b2) pair checking — you never need to look at a buy day twice.',
    recapTitle: 'Concept recap — why is one low enough?'
};
