import { C as n, s as t } from './index-0a115175.js';
const e = [];
function s(s, o = n) {
    let c;
    const l = [];
    function i(n) {
        if (t(s, n) && ((s = n), c)) {
            const n = !e.length;

            l.forEach(n => {
                n[1](), e.push(n, s);
            });

            if (n) {
                for (let n = 0; n < e.length; n += 2) e[n][0](e[n + 1]);
                e.length = 0;
            }
        }
    }
    return {
        set: i,
        update(n) {
            i(n(s));
        },
        subscribe(t, e = n) {
            const u = [t, e];
            return (
                l.push(u),
                1 === l.length && (c = o(i) || n),
                t(s),
                () => {
                    const n = l.indexOf(u);
                    -1 !== n && l.splice(n, 1), 0 === l.length && (c(), (c = null));
                }
            );
        }
    };
}
export { s as w };
