import { HTMLInputWithValue } from "../types";
import { DataAnonymizer } from "../anonymizer/dataAnonymizer";
import { v4 as uuidv4 } from "uuid";

export function getHTMLElementAttributes(elt: HTMLElement) {
    const attrList = elt.getAttributeNames();

    return attrList.reduce<Record<string, string>>((acc, attr) => {
        acc[attr] = elt.getAttribute(attr) || "";
        return acc;
    }, {});
}

export function isCheckbox(element: HTMLInputWithValue): boolean {
    switch (element.type) {
        case "checkbox":
            return true;
        default:
            return false;
    }
}

export function anonymizeInputValue(element: HTMLInputWithValue): string {

    const anonymizer = new DataAnonymizer(uuidv4());

    switch (element.type) {
        case "checkbox":
            return (!!element.getAttribute("checked")).toString();
        case "email":
            return anonymizer.anonymize(element.value);
        case "file":
            return anonymizer.anonymize(element.value);
        case "password":
            return "[[PASSWORD]]";
        case "search":
            return element.value;
        case "text":
            return anonymizer.anonymize(element.value);
        case "tel":
            return anonymizer.anonymize(element.value);
        case "url":
            return anonymizer.anonymize(element.value);
        default:
            return anonymizer.anonymize(element.value);
    }
}
