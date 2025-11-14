"use client";
import React, { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, onValue, push, off, get, serverTimestamp } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

type CommentType = {
  id: string;
  username: string;
  comment: string;
  timestamp: number;
  uid: string;
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('Firebase env check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasDatabase: !!firebaseConfig.databaseURL,
});

// Initialize Firebase only once
if (!getApps().length) {
  try {
    initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

const auth = getAuth();

async function writeUserData(userName: string, comment: string) {
  const user = auth.currentUser;
  console.log('Writing comment, user:', user?.uid);
  
  if (!user) {
    throw new Error("Not authenticated");
  }

  const db = getDatabase();
  
  // Check rate limit
  const rateLimitRef = ref(db, `userRateLimit/${user.uid}`);
  const snapshot = await get(rateLimitRef);
  
  if (snapshot.exists()) {
    const lastPost = snapshot.val();
    const timeSinceLastPost = Date.now() - lastPost;
    if (timeSinceLastPost < 5000) {
      const remainingSeconds = Math.ceil((5000 - timeSinceLastPost) / 1000);
      throw new Error(`Please wait ${remainingSeconds} seconds before posting again`);
    }
  }

  // Update rate limit timestamp
  await set(rateLimitRef, serverTimestamp());

  // Add comment
  const commentsRef = ref(db, "comments");
  const newCommentRef = push(commentsRef);

  await set(newCommentRef, {
    username: userName,
    comment: comment,
    timestamp: serverTimestamp(),
    uid: user.uid
  });
  
  console.log('Comment posted successfully');
}

export default function Comments() {
  const PAGE_SIZE = 5;

  const [authMethod, setAuthMethod] = useState<"anonymous" | "named">("anonymous");
  const [nameInput, setNameInput] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [savedName, setSavedName] = useState<string | null>(null);
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  const [commentText, setCommentText] = useState<string>("");
  const [comments, setComments] = useState<CommentType[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [initError, setInitError] = useState<string>("");

  // Initialize Firebase Auth
  useEffect(() => {
    console.log('Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? `User ${user.uid}` : 'No user');
      
      if (user) {
        setCurrentUid(user.uid);
        setAuthLoading(false);
        
        // Check for saved name
        try {
          const stored = localStorage.getItem("commenterName");
          if (stored) {
            setSavedName(stored);
            setNameInput(stored === "Anonymous" ? "" : stored);
            setAuthMethod(stored === "Anonymous" ? "anonymous" : "named");
            setIsAuthenticated(true);
          }
        } catch (e) {
          console.error('LocalStorage error:', e);
        }
      } else {
        console.log('No user, signing in anonymously...');
        // Sign in anonymously
        signInAnonymously(auth)
          .then(() => console.log('Anonymous sign-in successful'))
          .catch((error) => {
            console.error("Anonymous sign-in failed:", error);
            setInitError(`Authentication failed: ${error.message}`);
            setAuthLoading(false);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  // Load comments
  useEffect(() => {
    console.log('Setting up comments listener...');
    const db = getDatabase();
    const commentsRef = ref(db, "comments");
    setLoading(true);
    
    const listener = onValue(
      commentsRef, 
      (snapshot) => {
        console.log('Comments snapshot received');
        const data = snapshot.val() || {};
        const arr: CommentType[] = Object.keys(data).map((key) => ({
          id: key,
          username: data[key].username,
          comment: data[key].comment,
          timestamp: data[key].timestamp,
          uid: data[key].uid
        }));
        
        console.log(`Loaded ${arr.length} comments`);
        arr.sort((a, b) => b.timestamp - a.timestamp);
        setComments(arr);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading comments:', error);
        setInitError(`Failed to load comments: ${error.message}`);
        setLoading(false);
      }
    );

    return () => {
      off(commentsRef);
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(comments.length / PAGE_SIZE));

  const getPageComments = (): CommentType[] => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return comments.slice(startIndex, endIndex);
  };

  const handleAuthenticate = () => {
    const chosenName =
      authMethod === "anonymous" ? "Anonymous" : nameInput.trim() || "Anonymous";
    setSavedName(chosenName);
    try {
      localStorage.setItem("commenterName", chosenName);
    } catch (e) {
      console.error('LocalStorage error:', e);
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
      console.error('LocalStorage error:', e);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isAuthenticated || submitting) return;
    
    const trimmed = commentText.trim();
    if (!trimmed) return;
    
    if (trimmed.length > 500) {
      setSubmitError("Comment too long (max 500 characters)");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const userName = savedName || (authMethod === "anonymous" ? "Anonymous" : nameInput.trim() || "Anonymous");
      console.log('Submitting comment as:', userName);
      await writeUserData(userName, trimmed);
      setCommentText("");
      setPage(1);
    } catch (error: any) {
      console.error('Submit error:', error);
      setSubmitError(error.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderAvatar = (username: string) => {
    const isAnon = username === "Anonymous";
    if (isAnon) {
      return (
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-200">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="#9CA3AF" />
            <path d="M4 20c0-2.761 3.582-5 8-5s8 2.239 8 5v1H4v-1z" fill="#9CA3AF" />
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

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    const now = Date.now();
    const diff = now - ts;

    if (diff < 60_000) return "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 24 * 3_600_000) return `${Math.floor(diff / 3_600_000)}h ago`;

    const sameYear = d.getFullYear() === new Date().getFullYear();
    const dateStr = d.toLocaleDateString(undefined, { 
      month: "short", 
      day: "numeric", 
      ...(sameYear ? {} : { year: "numeric" }) 
    });
    const timeStr = d.toLocaleTimeString(undefined, { 
      hour: "numeric", 
      minute: "2-digit" 
    });
    return `${dateStr} at ${timeStr}`;
  };

  if (initError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 m-10">
        <div className="text-red-500 text-center">
          <h3 className="text-xl font-semibold mb-2">Initialization Error</h3>
          <p className="text-sm">{initError}</p>
          <p className="text-xs mt-4 text-gray-400">Check console for details</p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8 m-10">
        <div className="text-gray-400">Initializing authentication...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl m-4 sm:m-6 lg:m-10 w-full max-w-6xl stats-strong-shadow" 
           style={{ backgroundColor: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
        
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Comments</h2>
          <p className="text-gray-400 mt-1">Share feedback or say hi — choose how you&#39;d like to appear.</p>
        </div>

        {/* Authentication Section */}
        <div className="w-full max-w-3xl">
          {!isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="auth"
                    value="anonymous"
                    checked={authMethod === "anonymous"}
                    onChange={() => setAuthMethod("anonymous")}
                    className="cursor-pointer"
                  />
                  <span>Post as Anonymous</span>
                </label>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="auth"
                    value="named"
                    checked={authMethod === "named"}
                    onChange={() => setAuthMethod("named")}
                    className="cursor-pointer"
                  />
                  <span>Use a name</span>
                </label>
              </div>

              {authMethod === "named" && (
                <input
                  aria-label="Your name"
                  placeholder="Enter your name (max 50 characters)"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value.slice(0, 50))}
                  className="px-4 py-2 rounded-lg border text-sm w-full max-w-sm bg-white dark:bg-[#071025]"
                  maxLength={50}
                />
              )}

              <button 
                onClick={handleAuthenticate} 
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-lg border bg-white dark:bg-[#071025]">
              <div className="text-sm">
                Posting as <strong>{savedName}</strong>
              </div>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-3xl">
          <div className="relative">
            <textarea
              placeholder={isAuthenticated ? "Write your comment... (Press Enter to submit, Shift+Enter for new line)" : "Authenticate to enable commenting"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value.slice(0, 500))}
              onKeyDown={handleKeyPress}
              rows={4}
              className={`w-full p-4 rounded-lg border text-sm bg-white dark:bg-[#071025] resize-none ${!isAuthenticated ? "opacity-60 cursor-not-allowed" : ""}`}
              disabled={!isAuthenticated || submitting}
              maxLength={500}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {commentText.length}/500
            </div>
          </div>
          
          {submitError && (
            <div className="mt-2 text-sm text-red-500">{submitError}</div>
          )}
          
          <div className="flex justify-end gap-3 mt-3">
            <button
              type="button"
              onClick={() => {
                setCommentText("");
                setSubmitError("");
              }}
              disabled={!commentText.trim()}
              className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={!isAuthenticated || !commentText.trim() || submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <strong className="text-lg">Comments</strong>
              <div className="text-sm text-gray-400">{comments.length} total</div>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No comments yet. Be the first to leave feedback!
            </div>
          ) : (
            <>
              <ul className="flex flex-col gap-4">
                {getPageComments().map((c) => {
                  const isOwn = currentUid === c.uid;
                  return (
                    <li 
                      key={c.id} 
                      className={`p-4 rounded-lg border bg-white dark:bg-[#071025] ${isOwn ? 'border-blue-400' : ''}`}
                    >
                      <div className="flex gap-3 items-start">
                        {renderAvatar(c.username)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{c.username}</span>
                            {isOwn && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mb-2">
                            {formatTimestamp(c.timestamp)}
                          </div>
                          <p className="text-sm break-words whitespace-pre-wrap">{c.comment}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex gap-2 flex-wrap justify-center mt-6">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 rounded-md text-sm border hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={`px-3 py-2 rounded-md text-sm transition-colors ${
                          page === pageNumber 
                            ? "bg-blue-600 text-white" 
                            : "border hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 rounded-md text-sm border hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .stats-strong-shadow {
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
        }

        @media (prefers-color-scheme: dark) {
          .stats-strong-shadow {
            box-shadow: 0 25px 60px rgba(255, 77, 138, 0.16);
          }
        }

        :global(.dark) .stats-strong-shadow {
          box-shadow: 0 25px 60px rgba(255, 77, 138, 0.16);
          }
      `}</style>
    </>
  );
}
