/**
 * @jest-environment jsdom
 */

import axios from 'axios'
import { localStorageMock } from './mocks/localStorageMock'
import api from '../src/index'

describe('updatePlaceholders function tests', () => {

  const accessToken = { key: 'apis-accessToken', value: 'awesomeAccessToken' }

  const baseUrl = 'https://baseurl.com'

  const resources = {
    key: '/:placeholder/value'
  }

  // LocalStorage setup before all tests
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    })

    window.localStorage.setItem(accessToken.key, accessToken.value)
    api.init({
      baseUrl,
      savedUrls: resources,
      jwtTokenName: accessToken.key
    })
  })

  // LocalStorage cleanup after all tests
  afterAll(() => {
    window.localStorage.clear()
  })

  it('Returns previous updated placeholder after a new placeholder update', async () => {
    
    let currentUrl = baseUrl
    const notUpdatedFullUrl = 'https://baseurl.com/:placeholder/value'
    const updatedFullUrl = 'https://baseurl.com/key/value'
    const secondUpdatedFullUrl = 'https://baseurl.com/newkey/value'

    axios.interceptors.request.use(function (config) {
      currentUrl = config.url
    }, undefined)

    // Execute a first HTTP GET request without updating any placeholder in the resources object
    await api.get({ savedUrl: 'key' })
    expect(currentUrl).toBe(notUpdatedFullUrl)

    // Execute a second HTTP GET request after update some placeholders
    api.updatePlaceholders({placeholder: '/key'})
    await api.get({ savedUrl: 'key' })
    expect(currentUrl).toBe(updatedFullUrl)

    // Execute a third HTTP GET request after another placeholder update
    api.updatePlaceholders({placeholder: '/newkey'})
    await api.get({savedUrl: 'key'})
    expect(currentUrl).toBe(secondUpdatedFullUrl)
  })

})
