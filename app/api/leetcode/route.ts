import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface DifficultyCount {
  difficulty: string;
  count: number;
  submissions?: number;
}

interface LeetCodeGraphQLResponse {
  data?: {
    allQuestionsCount?: DifficultyCount[];
    matchedUser?: {
      profile?: {
        ranking?: number;
      };
      submitStatsGlobal?: {
        acSubmissionNum?: DifficultyCount[];
        totalSubmissionNum?: DifficultyCount[];
      };
    } | null;
  };
  errors?: Array<{ message: string }>;
}

function getCountByDifficulty(arr: DifficultyCount[], difficulty: string) {
  return arr.find((item) => item.difficulty === difficulty)?.count || 0;
}

function getSubmissionsByDifficulty(arr: DifficultyCount[], difficulty: string) {
  return arr.find((item) => item.difficulty === difficulty)?.submissions || 0;
}

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Missing username query parameter" },
        { status: 400 }
      );
    }

    const query = `
      query getUserProfile($username: String!) {
        allQuestionsCount {
          difficulty
          count
        }
        matchedUser(username: $username) {
          profile {
            ranking
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
        }
      }
    `;

    const upstream = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
        Origin: "https://leetcode.com",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({
        operationName: "getUserProfile",
        query,
        variables: { username },
      }),
      cache: "no-store",
    });

    const rawText = await upstream.text();

    if (!upstream.ok) {
      console.error("LeetCode upstream HTTP error:", upstream.status, rawText);
      return NextResponse.json(
        {
          error: `LeetCode upstream failed with status ${upstream.status}`,
          details: rawText.slice(0, 500),
        },
        { status: 502 }
      );
    }

    let result: LeetCodeGraphQLResponse;

    try {
      result = JSON.parse(rawText);
    } catch {
      console.error("LeetCode returned non-JSON:", rawText);
      return NextResponse.json(
        {
          error: "LeetCode returned a non-JSON response",
          details: rawText.slice(0, 500),
        },
        { status: 502 }
      );
    }

    if (result.errors?.length) {
      return NextResponse.json(
        {
          error: result.errors[0].message || "GraphQL error",
          details: result.errors,
        },
        { status: 502 }
      );
    }

    if (!result.data?.matchedUser) {
      return NextResponse.json(
        { error: "LeetCode user not found" },
        { status: 404 }
      );
    }

    const acStats = result.data.matchedUser.submitStatsGlobal?.acSubmissionNum || [];
    const totalStats =
      result.data.matchedUser.submitStatsGlobal?.totalSubmissionNum || [];
    const questionCounts = result.data.allQuestionsCount || [];

    const totalSolved = getCountByDifficulty(acStats, "All");
    const easySolved = getCountByDifficulty(acStats, "Easy");
    const mediumSolved = getCountByDifficulty(acStats, "Medium");
    const hardSolved = getCountByDifficulty(acStats, "Hard");
    const totalQuestions = getCountByDifficulty(questionCounts, "All");

    const acceptedSubmissions = getSubmissionsByDifficulty(acStats, "All");
    const totalSubmissions = getSubmissionsByDifficulty(totalStats, "All");

    const acceptanceRate =
      totalSubmissions > 0
        ? Number(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1))
        : 0;

    return NextResponse.json({
      totalSolved,
      totalQuestions,
      easySolved,
      mediumSolved,
      hardSolved,
      ranking: result.data.matchedUser.profile?.ranking || 0,
      acceptanceRate,
    });
  } catch (error) {
    console.error("Route handler crashed:", error);

    return NextResponse.json(
      {
        error: "Internal server error in /api/leetcode",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}