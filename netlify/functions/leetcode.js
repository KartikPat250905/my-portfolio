exports.handler = async (event) => {
  const username = event.queryStringParameters?.username;

  if (!username) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Username is required" }),
    };
  }

  try {
    const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${encodeURIComponent(username)}`);

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Failed to fetch LeetCode stats" }),
      };
    }

    const data = await res.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        totalSolved: data.totalSolved,
        totalQuestions: data.totalQuestions,
        easySolved: data.easySolved,
        mediumSolved: data.mediumSolved,
        hardSolved: data.hardSolved,
        ranking: data.ranking,
        acceptanceRate: data.acceptanceRate,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Failed to fetch stats" }),
    };
  }
};