const getSubjects = async () => {
  const response = await fetch("/api/subjects")
  if (!response.ok) throw new Error("Failed to fetch subjects.")
  return response.json()
}

export default {
  getSubjects
}