// Simple NGN currency to words utility
export function numberToWords(amount: number): string {
  if (isNaN(amount)) return '';
  const parts = amount.toFixed(2).split('.');
  const naira = parseInt(parts[0], 10);
  const kobo = parseInt(parts[1], 10);
  const nairaWords = toWords(naira);
  const koboWords = kobo > 0 ? ` and ${toWords(kobo)} kobo` : '';
  return `${nairaWords} naira${koboWords}`;
}

// Basic number to words (English, up to billions)
function toWords(num: number): string {
  const a = [ '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen' ];
  const b = [ '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety' ];
  const g = [ '', 'thousand', 'million', 'billion' ];
  if (num === 0) return 'zero';
  let str = '';
  let grp = 0;
  while (num > 0) {
    let h = num % 1000;
    if (h > 0) {
      let s = '';
      if (h > 99) s += a[Math.floor(h / 100)] + ' hundred ';
      h = h % 100;
      if (h > 19) s += b[Math.floor(h / 10)] + (h % 10 ? '-' + a[h % 10] : '');
      else if (h > 0) s += a[h];
      str = s.trim() + (g[grp] ? ' ' + g[grp] : '') + (str ? ' ' + str : '');
    }
    num = Math.floor(num / 1000);
    grp++;
  }
  return str.trim();
}
