const getSessions = async () => {
  const response = await fetch("/api/sessions")
  if (!response.ok) throw new Error("Failed to fetch sessions.")
  return response.json()
}

export default {
  getSessions,
}