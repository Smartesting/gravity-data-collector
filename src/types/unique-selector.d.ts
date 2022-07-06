// See https://github.com/ericclemmons/unique-selector/issues/37#issuecomment-477531307

declare module "@cypress/unique-selector" {
  export type Selector = string;

  export type SelectorType = "ID" | "Class" | "Tag" | "NthChild" | "Attributes";

  export type Options = {
    selectorTypes?: SelectorType[];
    attributesToIgnore?: string[];
    excludeRegex?: RegExp | null;
  };

  declare function unique(element: Element, options?: Options): Selector;

  export = unique;
}
