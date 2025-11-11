"use client";
import React, { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, onValue, push, off } from "firebase/database";

type CommentType = {
  id: string;
  username: string;
  comment: string;
  timestamp: number;
};

const firebaseConfig = {
  apiKey: "AIzaSyD7Ny818M7EDlRnnoYDAytAfLlOl7JZTj0",
  authDomain: "my-portfolio-kp.firebaseapp.com",
  databaseURL: "https://my-portfolio-kp-default-rtdb.firebaseio.com",
  projectId: "my-portfolio-kp",
  storageBucket: "my-portfolio-kp.firebasestorage.app",
  messagingSenderId: "959556795585",
  appId: "1:959556795585:web:fd018b4c9221a044432840"
};

// Initialize Firebase only once
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

function writeUserData(userName: string, comment: string) {
  const db = getDatabase();
  const commentsRef = ref(db, "comments");
  const newCommentRef = push(commentsRef);

  set(newCommentRef, {
    username: userName,
    comment: comment,
    timestamp: Date.now()
  });
}

export default function Comments() {
  const PAGE_SIZE = 10;

  const [authMethod, setAuthMethod] = useState<"anonymous" | "named">("anonymous");
  const [nameInput, setNameInput] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [savedName, setSavedName] = useState<string | null>(null);

  const [commentText, setCommentText] = useState<string>("");
  const [comments, setComments] = useState<CommentType[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("commenterName");
      if (stored) {
        setSavedName(stored);
        setNameInput(stored === "Anonymous" ? "" : stored);
        setAuthMethod(stored === "Anonymous" ? "anonymous" : "named");
        setIsAuthenticated(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const commentsRef = ref(db, "comments");
    setLoading(true);
    const listener = onValue(commentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const arr: CommentType[] = Object.keys(data).map((key) => ({
        id: key,
        username: data[key].username,
        comment: data[key].comment,
        timestamp: data[key].timestamp
      }));
      // sort ascending by timestamp (old -> new)
      arr.sort((a, b) => a.timestamp - b.timestamp);
      setComments(arr);
      setLoading(false);
      // show newest page
      setPage(1);
    });

    return () => {
      off(commentsRef);
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(comments.length / PAGE_SIZE));

  const getPageComments = (): CommentType[] => {
    if (comments.length === 0) return [];
    const startIndex = Math.max(0, comments.length - page * PAGE_SIZE);
    const endIndex = comments.length - (page - 1) * PAGE_SIZE;
    const pageSlice = comments.slice(startIndex, endIndex);
    // newest first
    return pageSlice.slice().reverse();
  };

  const handleAuthenticate = () => {
    const chosenName =
      authMethod === "anonymous" ? "Anonymous" : nameInput.trim() || "Anonymous";
    setSavedName(chosenName);
    try {
      localStorage.setItem("commenterName", chosenName);
    } catch (e) {
      // ignore
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSavedName(null);
    setNameInput("");
    setAuthMethod("anonymous");
    try {
      localStorage.removeItem("commenterName");
    } catch (e) {
      // ignore
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isAuthenticated) return;
    const trimmed = commentText.trim();
    if (!trimmed) return;
    const userName = savedName || (authMethod === "anonymous" ? "Anonymous" : nameInput.trim() || "Anonymous");
    writeUserData(userName, trimmed);
    setCommentText("");
    setPage(1);
  };

  const renderAvatar = (username: string) => {
    const isAnon = username === "Anonymous";
    if (isAnon) {
      return (
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-200">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="#9CA3AF"/>
            <path d="M4 20c0-2.761 3.582-5 8-5s8 2.239 8 5v1H4v-1z" fill="#9CA3AF"/>
          </svg>
        </div>
      );
    }

    const initials = username
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold">
        {initials || "U"}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8 rounded-2xl m-4 sm:m-6 lg:m-10 w-full max-w-6xl bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_60px_rgba(255,77,138,0.16)]">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-2xl font-semibold">Comments</h2>
        <p className="text-gray-400 mt-1">Share feedback or say hi — choose how you'd like to appear.</p>
      </div>

      <div className="w-full max-w-3xl">
        {!isAuthenticated ? (
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="auth"
                value="anonymous"
                checked={authMethod === "anonymous"}
                onChange={() => setAuthMethod("anonymous")}
              />
              <span>Post as Anonymous</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="auth"
                value="named"
                checked={authMethod === "named"}
                onChange={() => setAuthMethod("named")}
              />
              <span>Use a name</span>
            </label>

            {authMethod === "named" && (
              <input
                aria-label="Your name"
                placeholder="Your name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm w-auto"
              />
            )}

            <button onClick={handleAuthenticate} className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm">
              Authenticate
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm">Signed in as <strong>{savedName}</strong></div>
            <button onClick={handleLogout} className="px-3 py-2 rounded-lg border text-sm">Change</button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-3xl mt-4">
        <textarea
          placeholder={isAuthenticated ? "Write your comment..." : "Authenticate to enable commenting"}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={4}
          className={`w-full p-3 rounded-lg border text-sm bg-white dark:bg-[#071025] ${!isAuthenticated ? "opacity-60" : ""}`}
          disabled={!isAuthenticated}
        />
        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={() => setCommentText("")}
            disabled={!commentText.trim()}
            className="px-3 py-2 rounded-lg border text-sm"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={!isAuthenticated || !commentText.trim()}
            className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm"
          >
            Post Comment
          </button>
        </div>
      </form>

      <div className="w-full max-w-3xl mt-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <strong className="text-base">Latest comments</strong>
            <div className="text-sm text-gray-400">{comments.length} total</div>
          </div>
          <div className="text-sm text-gray-400">Showing up to {PAGE_SIZE} per page</div>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-gray-400">No comments yet. Be the first to leave feedback.</div>
          ) : (
          <ul className="flex flex-col gap-6">
            {getPageComments().map((c, idx) => {
              const isOwn = savedName === c.username;
              return (
                <li key={c.id} className={`w-full flex ${isOwn ? "justify-start" : "justify-end"}`}>
                  <div className={`flex gap-4 items-start bg-white dark:bg-[#041025] p-3 rounded-lg border max-w-[80%] ${isOwn ? "" : "flex-row-reverse text-right"}`}>
                    <div>{renderAvatar(c.username)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">{c.username}</div>
                          <div className="text-xs text-gray-400">{new Date(c.timestamp).toISOString()}</div>
                        </div>
                        <div className="text-xs text-gray-400">#{(page - 1) * PAGE_SIZE + idx + 1}</div>
                      </div>
                      <div className="mt-2 text-sm">{c.comment}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {comments.length > PAGE_SIZE && (
          <div className="flex gap-2 flex-wrap justify-center mt-4">
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  aria-current={page === pageNumber ? "page" : undefined}
                  className={`px-3 py-1 rounded-md text-sm ${page === pageNumber ? "bg-gray-900 text-white" : "bg-white text-gray-900 border"}`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
