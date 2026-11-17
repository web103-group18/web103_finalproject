
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
    throw new Error(data.error || "Failed to create session.");
  }

  return data;
};

const updateSession = async (id, sessionData) => {
  const response = await fetch(`/api/sessions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(sessionData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update session.");
  }

  return data;
};

const joinSession = async (id) => {
  const response = await fetch(`/api/sessions/${id}/join`, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to register for session.");
  }

  return data;
};

const cancelSession = async (id) => {
  const response = await fetch(`/api/sessions/${id}/cancel`, {
    method: "PATCH",
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to cancel session.");
  }

  return data;
};

const getMySessions = async () => {
  const response = await fetch("/api/my-sessions", {
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || "Failed to load your sessions.");
    error.status = response.status;
    throw error;
  }

  return data;
};

export default {
  getSessions,
  createSession,
  updateSession,
  joinSession,
  cancelSession,
  getMySessions
};
