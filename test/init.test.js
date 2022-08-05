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

  const currentAuthToken = 'apisauthtoken'

  const currentAuthTokenName = 'apis-accessToken'

  const bearerAuthToken = 'Bearer apis-accessToken'

  it('Returns the Auth Type set in the init function', async () => {
    let currentAuthHeader = null

    api.init({
      baseUrl,
      savedUrls: resources,
      authType: 'apikey',
      jwtTokenName: currentAuthTokenName
    })
    
    axios.interceptors.request.use(function (config) {
      currentAuthHeader = config?.headers?.authorization || null
    }, undefined)

    await api.get({ savedUrl: 'key' })
    expect(currentAuthHeader).toBe(currentAuthTokenName)

    await api.delete({ savedUrl: 'key', body: {key: 'deleteValue'} })
    expect(currentAuthHeader).toBe(currentAuthTokenName)
  })

  it('Returns Bearer as Auth Type if no authType is passed', async () => {
    let currentAuthHeader = null

    api.init({
      baseUrl,
      savedUrls: resources,
      jwtTokenName: currentAuthTokenName
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
      jwtTokenName: currentAuthTokenName
    })
    
    axios.interceptors.request.use(function (config) {
      currentAuthHeader = config?.headers?.authorization || null
    }, undefined)

    await api.get({ savedUrl: 'key' })
    expect(currentAuthHeader).toBe(bearerAuthToken)
  })

  it('Returns bearer authToken if is passed as param', async () => {
    let currentAuthHeader = null

    api.init({
      baseUrl,
      savedUrls: resources,
      authToken: currentAuthToken
    })
    
    axios.interceptors.request.use(function (config) {
      currentAuthHeader = config?.headers?.authorization || null
    }, undefined)

    await api.get({ savedUrl: 'key' })
    expect(currentAuthHeader).toBe(`Bearer ${currentAuthToken}`)
  })

  it('Returns apikey authToken if is passed as param', async () => {
    let currentAuthHeader = null

    api.init({
      baseUrl,
      authType: 'apikey',
      savedUrls: resources,
      authToken: currentAuthToken
    })
    
    axios.interceptors.request.use(function (config) {
      currentAuthHeader = config?.headers?.authorization || null
    }, undefined)

    await api.get({ savedUrl: 'key' })
    expect(currentAuthHeader).toBe(currentAuthToken)
  })
 
  it('Returns bearer authToken if is passed as param with jwtTokenName', async () => {
    let currentAuthHeader = null

    api.init({
      baseUrl,
      savedUrls: resources,
      jwtTokenName: currentAuthTokenName,
      authToken: currentAuthToken
    })
    
    axios.interceptors.request.use(function (config) {
      currentAuthHeader = config?.headers?.authorization || null
    }, undefined)

    await api.get({ savedUrl: 'key' })
    expect(currentAuthHeader).toBe(`Bearer ${currentAuthToken}`)
  })

  it('Returns apikey authToken if is passed as param with jwtTokenName', async () => {
    let currentAuthHeader = null

    api.init({
      baseUrl,
      authType: 'apikey',
      savedUrls: resources,
      jwtTokenName: currentAuthTokenName,
      authToken: currentAuthToken
    })
    
    axios.interceptors.request.use(function (config) {
      currentAuthHeader = config?.headers?.authorization || null
    }, undefined)

    await api.get({ savedUrl: 'key' })
    expect(currentAuthHeader).toBe(currentAuthToken)
  }) 

})