import { describe, it, expect } from 'vitest'
import { toCsv } from '../src/lib/dash.js'

describe('toCsv', () => {
  const cols = [{ header: 'Name', value: (r) => r.name }, { header: 'Skills', value: (r) => r.skills }]
  it('quotes cells, joins arrays and uses CRLF line endings', () => {
    expect(toCsv(cols, [{ name: 'Ann "Q"', skills: ['a', 'b'] }])).toBe('"Name","Skills"\r\n"Ann ""Q""","a; b"')
  })
  it('neutralises spreadsheet formula injection', () => {
    const out = toCsv(cols, [{ name: '=SUM(1)', skills: [] }, { name: '+1', skills: null }, { name: '@cmd', skills: undefined }])
    expect(out.split('\r\n').slice(1)).toEqual([`"'=SUM(1)",""`, `"'+1",""`, `"'@cmd",""`])
  })
})
