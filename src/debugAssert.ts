export function assert(assertionPassed: boolean, message: string) {
  if (!assertionPassed) {
    alert(`Assertion failed: ${message}`)
  }
}
