import { CharClass, charClasses } from "./dataAnonymizerCharClasses";

export class DataAnonymizer {
    private seed: string;

    constructor(seed: string) {
        this.seed = seed;
    }

    anonymize(input: string): string {
        return input
            .split("")
            .map((char) => getNewChar(char, hashCode(char + this.seed + char + input)))
            .join("");
    }
}

function getNewChar(char: string, generatedRandom: number) {
    let currentCharClass = getCharClass(char);
    return getRandomChar(currentCharClass, generatedRandom);
}

function getCharClass(char: string): CharClass {
    let charClass = charClasses.find((cc) => cc.chars.indexOf(char) > -1);
    if (charClass) return charClass;
    return {
        name: "other",
        chars: char
    };
}

function getRandomChar(charClass: CharClass, generatedRandom: number) {
    if (charClass.name === "other") {
        return charClass.chars;
    }
    return charClass.chars[getRandomInt(charClass.chars.length, generatedRandom)];
}

function getRandomInt(max: number, generatedNumber: number) {
    return Math.floor(max * generatedNumber);
}

function hashCode(input: string): number {
    let hash = 0,
        i,
        chr;
    if (input.length === 0) return hash;
    for (i = 0; i < input.length; i++) {
        chr = input.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return parseFloat("0." + Math.abs(hash));
}
