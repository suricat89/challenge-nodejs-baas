'use strict'
import {
  filterObjectFields,
  getFieldListString,
  mapFieldsStringToObject,
  validateRequiredFields
} from './util'

describe('Validate required fields', () => {
  const object = { foo: 'aaaa', bar: 'bbbb', test: 1000, nestedObj: { testNested: 2 } }
  it('should validate string fields', () => {
    // should work with the separators /[,| |;]/
    expect(
      validateRequiredFields(object, 'foo bar test')
    ).toHaveLength(0)

    expect(
      validateRequiredFields(object, 'foo, bar; test')
    ).toHaveLength(0)

    expect(
      validateRequiredFields(object, 'foo;, bar ,; test')
    ).toHaveLength(0)

    expect(
      validateRequiredFields(object, 'foo;, bar')
    ).toHaveLength(0)

    expect(
      validateRequiredFields(object, 'foo;, bar test asdf qqqq')
    ).toMatchObject([
      { fieldName: 'asdf' },
      { fieldName: 'qqqq' }
    ])

    expect(
      validateRequiredFields(object, 'nestedObj.testNested bar')
    ).toHaveLength(0)

    expect(
      validateRequiredFields(object, 'nestedObj.wrong foo')
    ).toMatchObject([
      { fieldName: 'nestedObj.wrong' }
    ])

    expect(
      validateRequiredFields(object, 'foo.bar')
    ).toMatchObject([
      { fieldName: 'foo.bar' }
    ])

    expect(
      validateRequiredFields(object, 'asdf.bar')
    ).toMatchObject([
      { fieldName: 'asdf.bar' }
    ])
  })

  it('should validate a string array', () => {
    expect(
      validateRequiredFields(object, ['foo', 'bar', 'test'])
    ).toHaveLength(0)

    expect(
      validateRequiredFields(object, ['test'])
    ).toHaveLength(0)

    expect(
      validateRequiredFields(object, ['foo', 'bar', 'test', 'asdf', 'qqqq'])
    ).toMatchObject([
      { fieldName: 'asdf' },
      { fieldName: 'qqqq' }
    ])

    expect(
      validateRequiredFields(object, ['nestedObj.testNested', 'foo'])
    ).toHaveLength(0)

    expect(
      validateRequiredFields(object, ['nestedObj.wrong', 'bar'])
    ).toMatchObject([
      { fieldName: 'nestedObj.wrong' }
    ])
  })

  it('should validate more complex scenarios', () => {
    expect(
      validateRequiredFields(object, [
        { fieldName: 'foo', validateMethod: 'EXISTS' },
        { fieldName: 'bar', validateMethod: 'NOT_EQUAL', validateValue: 'bbbb' }
      ])
    ).toMatchObject([
      { fieldName: 'bar' }
    ])

    expect(
      validateRequiredFields(object, [
        { fieldName: 'foo', validateMethod: 'EXISTS' },
        { fieldName: 'bar', validateMethod: 'NOT_EQUAL', validateValue: 1000 },
        { fieldName: 'test', validateMethod: 'GREATER', validateValue: 999 },
        { fieldName: 'test', validateMethod: 'LESSER', validateValue: 1001 }
      ])
    ).toHaveLength(0)

    expect(
      validateRequiredFields(object, [
        { fieldName: 'test', validateMethod: 'GREATER_OR_EQUAL', validateValue: 999 },
        { fieldName: 'test', validateMethod: 'LESSER_OR_EQUAL', validateValue: 1000 },
        { fieldName: 'foo', validateMethod: 'EQUAL', validateValue: 'aaaa' },
        { fieldName: 'foo', validateMethod: 'EQUAL', validateValue: 1234 }
      ])
    ).toMatchObject([
      { fieldName: 'foo', validateMethod: 'EQUAL', validateValue: 1234 }
    ])

    expect(
      validateRequiredFields(object, [
        { fieldName: 'nestedObj.testNested' },
        { fieldName: 'foo', validateMethod: 'EQUAL', validateValue: 'aaaa' }
      ])
    ).toHaveLength(0)

    expect(
      validateRequiredFields(object, [
        { fieldName: 'nestedObj.testNested', validateMethod: 'GREATER', validateValue: 2 },
        { fieldName: 'foo', validateMethod: 'EQUAL', validateValue: 'aaaa' }
      ])
    ).toMatchObject([
      { fieldName: 'nestedObj.testNested' }
    ])
  })
})

describe('Get field list as a String', () => {
  it('should convert a string array', () => {
    expect(getFieldListString(['foo', 'bar', 'test']))
      .toBe("'foo', 'bar', 'test'")

    expect(getFieldListString(['foo', 'bar', 'test'], ', ', false))
      .toBe('foo, bar, test')

    expect(getFieldListString(['foo', 'bar', 'test'], ';'))
      .toBe("'foo';'bar';'test'")

    expect(getFieldListString(['foo'], ';'))
      .toBe("'foo'")
  })

  it('should convert a single string', () => {
    expect(getFieldListString('foo'))
      .toBe("'foo'")

    expect(getFieldListString('foo', ';', false))
      .toBe('foo')
  })

  it('should convert a single RequiredField specification', () => {
    expect(getFieldListString({ fieldName: 'foo' }))
      .toBe("'foo'")
  })

  it('should convert an array of RequiredField', () => {
    expect(
      getFieldListString([
        { fieldName: 'foo' },
        { fieldName: 'bar' },
        { fieldName: 'test' }
      ])
    ).toBe("'foo', 'bar', 'test'")

    expect(
      getFieldListString([
        { fieldName: 'foo' },
        { fieldName: 'bar' },
        { fieldName: 'test' }
      ], ';', false)
    ).toBe('foo;bar;test')

    expect(
      getFieldListString([
        { fieldName: 'foo' }
      ])
    ).toBe("'foo'")
  })

  it('should deal with empty arrays', () => {
    expect(
      getFieldListString([])
    ).toBe('')
  })
})

describe('Map field list (from query params) to object', () => {
  it('should map single level attributes', () => {
    expect(
      mapFieldsStringToObject('foo, bar;test')
    ).toMatchObject({
      default: ['foo', 'bar', 'test']
    })
  })

  it('should map nested object attributes', () => {
    expect(
      mapFieldsStringToObject('foo bar test.nested')
    ).toMatchObject({
      default: ['foo', 'bar'],
      test: ['nested']
    })
  })
})

describe('Filter object fields', () => {
  const object = { foo: 'aaaa', bar: 'bbbb', test: 1000, nestedObj: { testNested: 2 } }
  it('should filter a populated object', () => {
    expect(
      filterObjectFields(object, ['foo', 'bar', 'nestedObj'])
    ).toMatchObject({
      foo: 'aaaa',
      bar: 'bbbb',
      nestedObj: { testNested: 2 }
    })
  })

  it('should deal with an empty object', () => {
    expect(
      filterObjectFields({}, ['foo', 'bar', 'nestedObj'])
    ).toMatchObject({})
  })

  it('should deal with an empty field list', () => {
    expect(
      filterObjectFields(object, [])
    ).toMatchObject({})
  })
})
