import { describe, it, expect } from 'vitest'
import { filterJobs } from '../src/lib/jobsApi.js'
import { jobs } from '../src/data/jobs.js'

const base = { q: '', location: '', types: [], modes: [], industry: '', posted: 0, sort: 'latest', expMin: 0, expMax: Infinity, salMin: 0, salMax: Infinity }
const run = (f) => filterJobs(jobs, { ...base, ...f })

describe('filterJobs', () => {
  it('returns everything, newest first, with no filters', () => {
    const r = run({})
    expect(r).toHaveLength(20)
    expect(r[0].posted_days_ago).toBe(0)
  })
  it('matches title, company and skills case-insensitively', () => {
    expect(run({ q: 'REACT' }).map((j) => j.title)).toEqual(expect.arrayContaining(['Senior React Developer', 'Full Stack Developer']))
    expect(run({ q: 'zoho' })).toHaveLength(2)
  })
  it('treats "remote" as a location that also matches remote work mode', () => expect(run({ location: 'remote' })).toHaveLength(4))
  it('filters by job type, work mode and industry', () => {
    expect(run({ types: ['Internship'] })).toHaveLength(1)
    expect(run({ modes: ['Remote'] })).toHaveLength(4)
    expect(run({ industry: 'Healthcare' })[0].title).toBe('Staff Nurse')
  })
  it('keeps jobs whose experience / salary ranges overlap the filter', () => {
    expect(run({ expMax: 1 })).toHaveLength(7)
    expect(run({ salMin: 30 }).every((j) => j.salary_max >= 30)).toBe(true)
  })
  it('sorts by salary when asked', () => expect(run({ sort: 'salary' })[0].title).toBe('Senior React Developer'))
  it('returns an empty list rather than throwing when nothing matches', () => expect(run({ q: 'zzz-no-such-job' })).toEqual([]))
})
