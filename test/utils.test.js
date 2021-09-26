import { isUrl, replacePlaceholders } from '../src/utils'

describe('isUrl function tests', () => {
  it('Returns null if text is not passed', () => {
    expect(isUrl()).toBeNull()
  })

  it('Returns null if is passed an undefined variable', () => {
    expect(isUrl(undefined)).toBeNull()
  })

  it('Returns false if a string without http at start is passed', () => {
    expect(isUrl('NotAnUrl')).toBeFalsy()
  })

  it('Returns true if an http url is passed', () => {
    expect(isUrl('http://google.com')).toBeTruthy()
  })

  it('Returns true if an https url is passed', () => {
    expect(isUrl('https://google.com')).toBeTruthy()
  })
})

describe('replacePlaceholders function tests', () => {
  it('Returns null if url is null', () => {
    expect(replacePlaceholders(null, {})).toBe('')
  })

  it('Returns null if placeholders is null', () => {
    expect(replacePlaceholders('', null)).toBe('')
  })

  it('Returns url if placeholders is an empty Object', () => {
    const url = 'https://google.com/search'
    expect(replacePlaceholders(url, {})).toBe(url)
  })

  it("Switches the placeholder if it's present in the url", () => {
    const url = 'https://google.com/:placeholder/'
    const fullUrl = 'https://google.com/search/'
    expect(replacePlaceholders(url, { placeholder: '/search' })).toBe(fullUrl)
  })
})
