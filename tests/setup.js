import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(cleanup)

// jsdom lacks these browser APIs that framer-motion / theme code touch
class IO { observe() {} unobserve() {} disconnect() {} takeRecords() { return [] } }
globalThis.IntersectionObserver ??= IO
if (!window.matchMedia) {
  window.matchMedia = (query) => ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false } })
}
