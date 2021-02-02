import { extractParam } from '../transform';

describe('Extract Params', () => {

  test('Should extract a named parameter', () => {
    const actual = extractParam('foo', 'lang="typescript" foo="test"')
    expect(actual).toBe("test")
  })

  test('Should resolve to undefined if Parameter name cant be found', () => {
    const actual = extractParam('bar', 'lang="typescript" foo="test"')
    expect(actual).toBe(undefined)
  })

  test('Should resolve a simple parameter', () => {
    const actual = extractParam('imgType', 'imgType="mermaid" ')
    expect(actual).toBe("mermaid")
  })
})