
const getSessions = async () => {
  const response = await fetch("/api/sessions");

  if (!response.ok) {
    throw new Error("Failed to fetch sessions.");
  }

  return response.json();
};

const createSession = async (sessionData) => {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(sessionData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to create session."
    );
  }

  return data;
};

export default {
  getSessions,
  createSession
};
