import { type NextApiRequest, type NextApiResponse } from 'next';
import { toString as creatQr } from 'qrcode';
import { z } from 'zod';

const querySchema = z.object({
    text: z.string(),
});

const QRcodeHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const parseResult = querySchema.safeParse(req.query);
    if (!parseResult.success) {
        res.status(400).json(parseResult.error.format());
        return;
    }

    const { text } = parseResult.data;
    const svg = await creatQr(text, { type: 'svg', margin: 1 });

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
};

export default QRcodeHandler;
