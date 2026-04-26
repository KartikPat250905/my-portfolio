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

  const query = `
    query getUserProfile($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        username
        profile {
          ranking
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    const result = await res.json();

    if (!res.ok || result.errors) {
      return {
        statusCode: 502,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Failed to fetch LeetCode stats via GraphQL",
          details: result.errors || result,
        }),
      };
    }

    const user = result?.data?.matchedUser;
    const allQuestionsCount = result?.data?.allQuestionsCount || [];

    if (!user) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "LeetCode user not found" }),
      };
    }

    const solved = user?.submitStatsGlobal?.acSubmissionNum || [];

    const getSolved = (difficulty) =>
      solved.find((item) => item.difficulty === difficulty)?.count ?? 0;

    const getTotal = (difficulty) =>
      allQuestionsCount.find((item) => item.difficulty === difficulty)?.count ?? 0;

    const totalSolved = getSolved("All");
    const easySolved = getSolved("Easy");
    const mediumSolved = getSolved("Medium");
    const hardSolved = getSolved("Hard");
    const totalQuestions = getTotal("All");

    const totalSubmissions =
      solved.find((item) => item.difficulty === "All")?.submissions ?? 0;

    const acceptanceRate =
      totalSubmissions > 0
        ? ((totalSolved / totalSubmissions) * 100).toFixed(1)
        : "0.0";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({
        totalSolved,
        totalQuestions,
        easySolved,
        mediumSolved,
        hardSolved,
        ranking: user?.profile?.ranking ?? 0,
        acceptanceRate: Number(acceptanceRate),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Failed to fetch stats",
        details: String(err),
      }),
    };
  }
};