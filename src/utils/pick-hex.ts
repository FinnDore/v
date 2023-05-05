export const pickHex = (
    color1: readonly [number, number, number],
    color2: readonly [number, number, number],
    weight: number
) => {
    const p = weight;
    const w = p * 2 - 1;
    const w1 = (w / 1 + 1) / 2;
    const w2 = 1 - w1;
    return `rgb(${Math.round(+color1[0] * w1 + +color2[0] * w2)},${Math.round(
        +color1[1]! * w1 + +color2[1] * w2
    )},${Math.round(+color1[2] * w1 + +color2[2] * w2)})`;
};
