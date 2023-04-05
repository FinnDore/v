import { type NextApiRequest, type NextApiResponse } from 'next';
import ColorHash from 'color-hash';

// TODO CREDDIT JR
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const colorHash = new ColorHash({ saturation: 1 });

// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
export const stringToColour = (s: string): string => colorHash.hex(s);

export const generateColours = (s: string): [string, string] => {
    const s1 = s.substring(0, s.length / 2);
    const s2 = s.substring(s.length / 2);
    const c1 = stringToColour(s1);
    const c2 = stringToColour(s2);

    return [c1, c2];
};

export const generateSVG = (s: string, size = 256): string => {
    const [c1, c2] = generateColours(s);

    const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${size / 2}" cy="${size / 2}" r="${
        size / 2
    }" fill="url(#gradient)" />
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop stop-color="${c1}" />
      <stop offset="1" stop-color="${c2}" />
    </linearGradient>
  </defs>
</svg>
  `.trim();

    return svg;
};
export default function returnSvg(req: NextApiRequest, res: NextApiResponse) {
    const svg = generateSVG(
        (Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug) ??
            'aaaaaaaaaaaaaaaaaaaaaaaaaa'
    );
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('pragma', 'cache');
    res.send(svg);
}
