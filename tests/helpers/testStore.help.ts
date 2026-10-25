let adminToken: string = ''
let userToken: string = ''
let adminCookie: string[] = []
let userCookie: string[] = []
let storeId: string = ''
let numberId: number
let testPassword: string = ''

export const setTestPassword = (pass: string): void => {
  testPassword = pass
}

export const getTestPassword = (): string => {
  return testPassword
}

export const setAdminToken = (newToken: string): void => {
  adminToken = newToken
}

export const getAdminToken = (): string => {
  return adminToken
}

export const setAdminCookie = (cookie: string[]): void => {
  adminCookie = cookie
}

export const getAdminCookie = (): string[] => {
  return adminCookie
}

export const setUserToken = (newToken: string): void => {
  userToken = newToken
}

export const getUserToken = (): string => {
  return userToken
}

export const setUserCookie = (cookie: string[]): void => {
  userCookie = cookie
}

export const getUserCookie = (): string[] => {
  return userCookie
}

export const setStringId = (newId: string): void => {
  storeId = newId
}

export const getStringId = (): string => {
  return storeId
}

export const setNumberId = (newId: number): void => {
  numberId = newId
}

export const getNumberId = (): number => {
  return numberId
}
