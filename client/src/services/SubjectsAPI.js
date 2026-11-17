const API_URL = "https://server-0fb4.onrender.com";

const getSubjects = async () => {
  const response = await fetch(`${API_URL}/api/subjects`);
  if (!response.ok) throw new Error("Failed to fetch subjects.");
  return response.json();
};

export default {
  getSubjects,
};
