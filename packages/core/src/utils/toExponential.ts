export default function toExponential(val: string | number): string | number {
    const num = Number(val)
    if (num === 0) {
        return 0;
    }
    const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
    if (m !== null) {
      return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
    }
    return num
}
