/**
 * @jest-environment jsdom
 */

import axios from 'axios'
import api from '../src/index'

describe('init function tests', () => {

  const baseUrl = 'https://baseurl.com'

  const resources = {
    key: '/:placeholder/value',
    noTrailingSlashKey: '/:noTrailingSlashPlaceholder'
  }

  const currentAuthToken = 'apis-accessToken'

  const bearerAuthToken = 'Bearer apis-accessToken'

  it('Returns the Auth Type set in the init function', async () => {
    let currentAuthHeader = null

    api.init({
      baseUrl,
      savedUrls: resources,
      authType: 'apikey',
      jwtTokenName: currentAuthToken
    })
    
    axios.interceptors.request.use(function (config) {
      currentAuthHeader = config?.headers?.authorization || null
    }, undefined)

    await api.get({ savedUrl: 'key' })
    expect(currentAuthHeader).toBe(currentAuthToken)
  })

  it('Returns Bearer as Auth Type if no authType is passed', async () => {
    let currentAuthHeader = null

    api.init({
      baseUrl,
      savedUrls: resources,
      jwtTokenName: currentAuthToken
    })
    
    axios.interceptors.request.use(function (config) {
      currentAuthHeader = config?.headers?.authorization || null
    }, undefined)

    await api.get({ savedUrl: 'key' })
    expect(currentAuthHeader).toBe(bearerAuthToken)
  })

  it('Returns Bearer as Auth Type if wrong authType is passed', async () => {
    let currentAuthHeader = null

    api.init({
      baseUrl,
      savedUrls: resources,
      authType: 'wrongAuthType',
      jwtTokenName: currentAuthToken
    })
    
    axios.interceptors.request.use(function (config) {
      currentAuthHeader = config?.headers?.authorization || null
    }, undefined)

    await api.get({ savedUrl: 'key' })
    expect(currentAuthHeader).toBe(bearerAuthToken)
  })

})