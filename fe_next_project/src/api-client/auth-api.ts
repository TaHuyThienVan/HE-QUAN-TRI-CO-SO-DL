// src/api-client/auth-api.ts
export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  expiredAt: number
}

const BASE_URL = 'https://js-post-api.herokuapp.com/api'

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', accept: '*/*' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Login failed: ${err}`)
  }

  return res.json()
}
