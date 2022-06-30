import { describe, expect, it } from "vitest";
import { DataAnonymizer } from "./dataAnonymizer";

describe("anonymize", () => {
    it("anonymize same strings with same seeds should be equal", () => {
        const anonymizer = new DataAnonymizer("bla bla truc chose");
        const a = anonymizer.anonymize("super youki!!!!");
        const b = anonymizer.anonymize("super youki!!!!");
        expect(a).toEqual(b);
    });
    it("anonymize different strings  with same seeds should be different", () => {
        const anonymizer = new DataAnonymizer("bla bla truc chose");
        const a = anonymizer.anonymize("super youki!!!!");
        const b = anonymizer.anonymize("super youki 2 cds ds!!!!");
        expect(a).not.toEqual(b);
    });
    it("anonymize with different seeds should be different", () => {
        const anonymizer1 = new DataAnonymizer("bla bla truc chose");
        const a = anonymizer1.anonymize("super youki!!!!");
        const anonymizer2 = new DataAnonymizer("bla bla trs");
        const b = anonymizer2.anonymize("super youki!!!!");
        expect(a).not.toEqual(b);

        console.log(anonymizer1.anonymize("julien.botella@smartesting.com"));
    });
});
