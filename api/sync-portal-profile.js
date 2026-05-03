import { handleSyncPortalProfile } from '../server/sync-portal-profile-service.mjs'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ message: 'Method not allowed' })
    return
  }

  try {
    const authHeader = request.headers.authorization ?? ''
    const result = await handleSyncPortalProfile(process.env, { authHeader })
    response.status(200).json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sync profile right now.'
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
        ? error.statusCode
        : 500

    response.status(statusCode).json({ message })
  }
}
