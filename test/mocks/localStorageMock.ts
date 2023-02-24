export const localStorageMock = (function () {
  let store: { [key: string]: string | null | false } = {}

  return {
    getItem: function (key: string) {
      return store[key] || null
    },
    setItem: function (key: string, value: string | null | false) {
      store[key] = value ? value.toString() : value
    },
    clear: function () {
      store = {}
    }
  }
})()
