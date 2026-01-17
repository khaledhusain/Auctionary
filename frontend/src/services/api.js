const BASE_URL = "http://localhost:3333";

async function post(path, body, headers = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error_message || `Request failed (${res.status})`);
  }

  return data;
}

// Create item (requires auth)
function createItem(item) {
  const token = localStorage.getItem("session_token");

  return post("/item", item, {
    "X-Authorization": token,
  });
}

// Place bid (requires auth)
function placeBid(itemId, amount) {
  const token = localStorage.getItem("session_token");

  return post(`/item/${itemId}/bid`, { amount }, {
    "X-Authorization": token,
  });
}

async function get(path, headers = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: {
      ...headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error_message || `Request failed (${res.status})`);
  }

  return data;
}

// Bid history (no auth required)
function getBidHistory(itemId) {
  return get(`/item/${itemId}/bid`);
}

// Ask question (requires auth)
function askQuestion(itemId, question_text) {
  const token = localStorage.getItem("session_token");

  return post(`/item/${itemId}/question`, { question_text }, {
    "X-Authorization": token,
  });
}

// Answer question (requires auth)
function answerQuestion(questionId, answer_text) {
  const token = localStorage.getItem("session_token");

  return post(
    `/question/${questionId}`,
    { answer_text },
    { "X-Authorization": token }
  );
}

// Get questions (no auth required)
function getQuestionsForItem(itemId) {
  return get(`/item/${itemId}/question`);
}

// Search items (no auth required)
function searchItems(query = "") {
  const q = encodeURIComponent(query);
  return get(`/search?q=${q}`);
}

export default {
  post,
  createItem,
  placeBid,
  getBidHistory,
  askQuestion,
  answerQuestion,
  getQuestionsForItem,
  searchItems,
};
