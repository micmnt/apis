/**
 * @jest-environment jsdom
 */

import axios from 'axios'
import { createHeaders, executeRequest, getAuthType, isUrl, replacePlaceholders, resourcesBaseOperations } from '../src/utils'
import { localStorageMock } from './mocks/localStorageMock'

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
  it('Returns empty string if url is null', () => {
    expect(replacePlaceholders(null, {})).toBe('')
  })

  it('Returns empty string if placeholders is null', () => {
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

describe('createHeaders function tests', () => {
  const accessToken = { key: 'apis-accesToken', value: 'awsomeAccessToken' }

  // LocalStorage setup before all tests
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    })

    window.localStorage.setItem(accessToken.key, accessToken.value)
  })

  // LocalStorage cleanup after all tests
  afterAll(() => {
    window.localStorage.clear()
  })

  it('Returns an empty object if no params are passed to the function', () => {
    const expectedObject = {
      headers: {}
    }
    expect(createHeaders(null, null, null, null, null, null)).toStrictEqual(expectedObject)
    expect(createHeaders(undefined, undefined, undefined, undefined, undefined, undefined)).toStrictEqual(expectedObject)
  })

  it('Returns an object with authorization header if token is passed', () => {
    const tokenName = accessToken.key
    const expectedObject = {
      headers: {
        authorization: `Bearer ${accessToken.value}`
      }
    }
    expect(createHeaders(null, null, null, [], null, tokenName)).toStrictEqual(expectedObject)
  })

  it('Returns an object with a custom authorization header if tokenName is present and overrideToken is passed', () => {
    const tokenName = accessToken.key
    const overrideToken = 'customToken'
    const expectedObject = {
      headers: {
        authorization: overrideToken
      }
    }

    expect(createHeaders(null, overrideToken, null, [], null, tokenName)).toStrictEqual(expectedObject)
  })

  it('Returns an empty object if tokenName is passed and disableAuth is true', () => {
    const tokenName = accessToken.key
    const disableAuth = true
    const expectedObject = {
      headers: {}
    }

    expect(createHeaders(null, null, disableAuth, null, null, tokenName)).toStrictEqual(expectedObject)
  })

  it('Returns an empty object if customHeaders array is not an array of key/value pairs', () => {
    const expectedObject = {
      headers: {}
    }

    expect(createHeaders(null, null, null, [null, null], null, null)).toStrictEqual(expectedObject)
    expect(createHeaders(null, null, null, [undefined, undefined], null, null)).toStrictEqual(expectedObject)
    expect(createHeaders(null, null, null, ['string1', 'string2'], null, null)).toStrictEqual(expectedObject)
    expect(createHeaders(null, null, null, [{ prop1: 'value1', prop2: 'value2' }], null, null)).toStrictEqual(expectedObject)
  })

  it('Returns an object with custom headers keys if customHeaders array is an array of key/value pairs', () => {
    const customHeaders = [{ key: 'customHeaderKey', value: 'customHeaderValue' }]
    const expectedObject = {
      headers: {
        customHeaderKey: 'customHeaderValue'
      }
    }

    expect(createHeaders(null, null, null, customHeaders, null, null)).toStrictEqual(expectedObject)
  })

  it('Returns an empty object if custom params passed as option are not of type object', () => {
    const expectedObject = {
      headers: {}
    }

    expect(createHeaders('stringParam', null, null, null, null, null)).toStrictEqual(expectedObject)
    expect(createHeaders(3, null, null, null, null, null)).toStrictEqual(expectedObject)
    expect(createHeaders([3, 'arrayParam'], null, null, null, null, null)).toStrictEqual(expectedObject)
    expect(createHeaders(true, null, null, null, null, null)).toStrictEqual(expectedObject)
  })

  it('Returns an object with custom params object equal to the passed one', () => {
    const customParams = {
      paramKey: 'paramValue',
      paramKey2: 'paramValue2'
    }

    const expectedObject = {
      headers: {},
      params: customParams
    }

    expect(createHeaders(customParams, null, null, null, null, null)).toStrictEqual(expectedObject)
  })

  it('Returns an empty object if passed responseType is not a string', () => {
    const expectedObject = {
      headers: {}
    }

    expect(createHeaders(null, null, null, null, 3, null)).toStrictEqual(expectedObject)
    expect(createHeaders(null, null, null, null, { key: 'value' }, null)).toStrictEqual(expectedObject)
    expect(createHeaders(null, null, null, null, ['value1', 'value2'], null)).toStrictEqual(expectedObject)
    expect(createHeaders(null, null, null, null, true, null)).toStrictEqual(expectedObject)
  })

  it('Returns an object with custom responseType if passed responseType is a string', () => {
    const responseType = 'blob'
    const expectedObject = {
      headers: {},
      responseType
    }

    expect(createHeaders(null, null, null, null, responseType, null)).toStrictEqual(expectedObject)
  })
})

describe('getAuthType function tests', () => {
  it('Returns the default value if null or undefined is passed as parameter', () => {
    const defaultValue = 'Bearer'

    expect(getAuthType(null)).toStrictEqual(defaultValue)
    expect(getAuthType(undefined)).toStrictEqual(defaultValue)
  })

  it('Returns bearer type if the bearer parameter is passed', () => {
    const bearerValue = 'Bearer'

    expect(getAuthType('bearer')).toStrictEqual(bearerValue)
  })

  it('Returns apikey type if the apikey parameter is passed', () => {
    const apikeyValue = ''

    expect(getAuthType('apikey')).toStrictEqual(apikeyValue)
  })
})

describe('resourceBaseOperations function tests', () => {
  const accessToken = { key: 'apis-accesToken', value: 'awsomeAccessToken' }

  // LocalStorage setup before all tests
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    })

    window.localStorage.setItem(accessToken.key, accessToken.value)
  })

  // LocalStorage cleanup after all tests
  afterAll(() => {
    window.localStorage.clear()
  })

  it('Returns an Object with empty fields url and headers', () => {
    const expectedObject = {
      url: '',
      headers: {
        headers: {}
      }
    }
    expect(resourcesBaseOperations(null, null, null, null, { responseType: null, params: null, auth: null, disableAuth: null, body: null, path: null, customHeaders: null })).toStrictEqual(expectedObject)
  })

  it('Returns an object with empty url field and headers object with default type authentication field', () => {
    const tokenName = accessToken.key
    const wrongAuthType = 'wrongAuthType'

    const expectedObject = {
      url: '',
      headers: {
        headers: {
          authorization: `Bearer ${accessToken.value}`
        }
      }
    }

    expect(resourcesBaseOperations(null, tokenName, null, null, { responseType: null, params: null, auth: null, disableAuth: null, body: null, path: null, customHeaders: null })).toStrictEqual(expectedObject)
    expect(resourcesBaseOperations(null, tokenName, null, wrongAuthType, { responseType: null, params: null, auth: null, disableAuth: null, body: null, path: null, customHeaders: null })).toStrictEqual(expectedObject)
  })

  it('Returns an object with empty url field and headers object with bearer type authentication field', () => {
    const tokenName = accessToken.key
    const defaultAuthType = 'bearer'

    const expectedObject = {
      url: '',
      headers: {
        headers: {
          authorization: `Bearer ${accessToken.value}`
        }
      }
    }

    expect(resourcesBaseOperations(null, tokenName, null, defaultAuthType, { responseType: null, params: null, auth: null, disableAuth: null, body: null, path: null, customHeaders: null })).toStrictEqual(expectedObject)
  })

  it('Returns an object with empty url field and headers object with apikey type authentication field', () => {
    const tokenName = accessToken.key
    const apiKeyAuthType = 'apikey'

    const expectedObject = {
      url: '',
      headers: {
        headers: {
          authorization: accessToken.value
        }
      }
    }

    expect(resourcesBaseOperations(null, tokenName, null, apiKeyAuthType, { responseType: null, params: null, auth: null, disableAuth: null, body: null, path: null, customHeaders: null })).toStrictEqual(expectedObject)
  })

  it('Returns an object with empty url field and headers object with bearer type authentication field', () => {
    const tokenName = accessToken.key
    const defaultAuthType = 'bearer'

    const expectedObject = {
      url: '',
      headers: {
        headers: {
          authorization: `Bearer ${accessToken.value}`
        }
      }
    }

    expect(resourcesBaseOperations(null, tokenName, null, defaultAuthType, { responseType: null, params: null, auth: null, disableAuth: null, body: null, path: null, customHeaders: null })).toStrictEqual(expectedObject)
  })

  it('Returns an object with empty url field, custom headers and a body object', () => {
    const tokenName = accessToken.key
    const defaultAuthType = 'bearer'

    const body = {
      key: 'value',
      key2: 'value2'
    }

    const expectedObject = {
      url: '',
      headers: {
        headers: {
          authorization: `Bearer ${accessToken.value}`
        }
      },
      body
    }

    expect(resourcesBaseOperations(null, tokenName, null, defaultAuthType, { responseType: null, params: null, auth: null, disableAuth: null, body, path: null, customHeaders: null })).toStrictEqual(expectedObject)
  })

  it('Returns an object with correct baseUrl taken from resources argument and custom headers', () => {
    const tokenName = accessToken.key
    const defaultAuthType = 'bearer'

    const baseUrl = 'https://baseurl.com'
    const notValidUrl = 'notValidUrl'
    const overriddenUrl = 'https://overriddenurl.com'

    const path = '/added-path'

    const resources = {
      baseUrlResource: baseUrl
    }

    const expectedObject = {
      url: baseUrl,
      headers: {
        headers: {
          authorization: `Bearer ${accessToken.value}`
        }
      }
    }

    const pathExpectedObject = {
      url: `${baseUrl}${path}`,
      headers: {
        headers: {
          authorization: `Bearer ${accessToken.value}`
        }
      }
    }

    const failingExpectedObject = {
      url: '',
      headers: {
        headers: {
          authorization: `Bearer ${accessToken.value}`
        }
      }
    }

    const overridingExpectedObject = {
      url: overriddenUrl,
      headers: {
        headers: {
          authorization: `Bearer ${accessToken.value}`
        }
      }
    }

    expect(resourcesBaseOperations(resources, tokenName, 'baseUrlResource', defaultAuthType, { responseType: null, params: null, auth: null, disableAuth: null, body: null, path: null, customHeaders: null })).toStrictEqual(expectedObject)
    expect(resourcesBaseOperations(resources, tokenName, notValidUrl, defaultAuthType, { responseType: null, params: null, auth: null, disableAuth: null, body: null, path: null, customHeaders: null })).toStrictEqual(failingExpectedObject)
    expect(resourcesBaseOperations(resources, tokenName, overriddenUrl, defaultAuthType, { responseType: null, params: null, auth: null, disableAuth: null, body: null, path: null, customHeaders: null })).toStrictEqual(overridingExpectedObject)
    expect(resourcesBaseOperations(resources, tokenName, 'baseUrlResource', defaultAuthType, { responseType: null, params: null, auth: null, disableAuth: null, body: null, path, customHeaders: null })).toStrictEqual(pathExpectedObject)
  })
})

describe('executeRequest function tests', () => {
  const errorMessage = 'Networkkkk Error'
  const deleteFullResponse = {
    status: 200,
    data: null
  }
  const deleteResponseWithNoData = {
    status: 200
  }

  const fullResponse = {
    status: 200,
    data: {
      key: 'value'
    }
  }

  afterEach(() => {
    axios.interceptors.response.clear()
    axios.get.mockReset()
    if (axios.post.mockReset) {
      axios.post.mockReset()
    }
    if (axios.delete.mockReset) {
      axios.delete.mockReset()
    }
  })

  it('Returns an object with null data and error object', async () => {
    const baseUrl = 'https://baseurl.com'

    axios.get = jest.fn().mockRejectedValue(new Error(errorMessage))

    const expectedResponse = { data: null, error: new Error(errorMessage) }
    const requestResponse = await executeRequest({ url: baseUrl, headers: {} })
    expect(requestResponse).toStrictEqual(expectedResponse)
    expect(axios.get).toHaveBeenCalledWith(baseUrl, {})
  })

  it('Returns an object with correct response data and null error object', async () => {
    const baseUrl = 'https://baseurl.com'

    axios.get = jest.fn().mockResolvedValue(fullResponse)
    axios.post = jest.fn().mockResolvedValue(fullResponse)
    axios.delete = jest.fn().mockResolvedValue(fullResponse)

    const fullExpectedResponse = { data: fullResponse, error: null }
    const expectedResponse = { data: fullResponse.data, error: null }
    const deleteResponse = { data: null, error: null }

    const fullRequestResponse = await executeRequest({ fullResponse: true, url: baseUrl, headers: {} })
    const requestResponse = await executeRequest({ url: baseUrl, headers: {} })
    const postExpectedResponse = await executeRequest({ url: baseUrl, headers: {}, method: 'post', body: fullResponse })

    const deleteWithRandomBodyExpectedResponse = await executeRequest({ url: baseUrl, headers: { authorization: 'Bearer token' }, method: 'delete', body: { data: { key: 'value' } } })


    expect(fullExpectedResponse).toStrictEqual(fullRequestResponse)
    expect(expectedResponse).toStrictEqual(requestResponse)
    expect(expectedResponse).toStrictEqual(postExpectedResponse)
    expect(expectedResponse).toStrictEqual(deleteWithRandomBodyExpectedResponse)

    expect(axios.get).toHaveBeenCalledWith(baseUrl, {})
    expect(axios.post).toHaveBeenCalledWith(baseUrl, fullResponse, {})
    expect(axios.delete).toHaveBeenCalledWith(baseUrl, { authorization: 'Bearer token', data: { key: 'value' } })


    axios.delete.mockReset()

    axios.delete = jest.fn().mockResolvedValue(deleteFullResponse)
    const deleteExpectedResponse = await executeRequest({ url: baseUrl, headers: {}, method: 'delete' })
    expect(deleteExpectedResponse).toStrictEqual(deleteResponse)
    expect(axios.delete).toHaveBeenCalledWith(baseUrl, {})

    axios.delete.mockReset()

    axios.delete = jest.fn().mockResolvedValue(deleteResponseWithNoData)
    const deleteExpectedResponseWithNoData = await executeRequest({ url: baseUrl, headers: {}, method: 'delete' })
    expect(deleteExpectedResponseWithNoData).toStrictEqual(deleteResponse)
    expect(axios.delete).toHaveBeenCalledWith(baseUrl, {})

  })

  it('Receives errorInterceptor correctly as a param if its a function', async () => {
    const baseUrl = 'https://baseurl.com'

    const errorInterceptorFunction = (error) => 'hello'

    axios.get = jest.fn().mockRejectedValue(new Error(errorMessage))
    const expectedResponse = { data: null, error: new Error(errorMessage) }
    const requestResponse = await executeRequest({ url: baseUrl, headers: {}, errorInterceptor: errorInterceptorFunction })

    expect(axios.interceptors.response.handlers.length).toStrictEqual(1)
    expect(requestResponse).toStrictEqual(expectedResponse)
    expect(axios.get).toHaveBeenCalledWith(baseUrl, {})
  })

  it('Receives errorInterceptor correctly as a param if its null', async () => {
    const baseUrl = 'https://baseurl.com'
    
    axios.get = jest.fn().mockRejectedValue(new Error(errorMessage))
    const expectedResponse = { data: null, error: new Error(errorMessage) }
    const requestResponse = await executeRequest({ url: baseUrl, headers: {}, errorInterceptor: null })

    expect(axios.interceptors.response.handlers.length).toStrictEqual(0)
    expect(requestResponse).toStrictEqual(expectedResponse)
    expect(axios.get).toHaveBeenCalledWith(baseUrl, {})
  })

  it('Receives errorInterceptor correctly as a param if its not a function or null', async () => {
    const baseUrl = 'https://baseurl.com'
    
    axios.get = jest.fn().mockRejectedValue(new Error(errorMessage))
    const expectedResponse = { data: null, error: new Error(errorMessage) }
    const requestResponse = await executeRequest({ url: baseUrl, headers: {}, errorInterceptor: 'ImNotAFunction' })

    expect(axios.interceptors.response.handlers.length).toStrictEqual(0)
    expect(requestResponse).toStrictEqual(expectedResponse)
    expect(axios.get).toHaveBeenCalledWith(baseUrl, {})
  })
})
