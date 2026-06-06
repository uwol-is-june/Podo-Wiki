declare module 'turndown-plugin-gfm' {
  import TurndownService from 'turndown'
  export function tables(service: TurndownService): void
  export function gfm(service: TurndownService): void
  export function strikethrough(service: TurndownService): void
  export function taskListItems(service: TurndownService): void
  export function highlightedCodeBlock(service: TurndownService): void
}
