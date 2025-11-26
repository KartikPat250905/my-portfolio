"use client";
import React, { useEffect, useState } from "react";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, ref, set, onValue, push, off, get, serverTimestamp } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged, Auth } from "firebase/auth";
import emailjs from '@emailjs/browser';


type CommentType = {
  id: string;
  username: string;
  comment: string;
  timestamp: number;
  uid: string;
  editedAt?: number;
  replies?: ReplyType[];
};

type ReplyType = {
  id: string;
  username: string;
  comment: string;
  timestamp: number;
  uid: string;
  parentId: string;
};

type FeedbackFormType = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: number;
  uid: string;
  type: 'form';
};

type FeedbackMode = 'chat' | 'form';

// Extract environment variables the same way as the GitHub token
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const FIREBASE_DATABASE_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const FIREBASE_MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

// EmailJS Configuration
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  databaseURL: FIREBASE_DATABASE_URL,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID
};

// Initialize Firebase only on client-side
let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;

const initializeFirebase = (): boolean => {
  if (typeof window === 'undefined') return false; // Server-side check

  if (!firebaseApp && !getApps().length) {
    try {
      // Check if all required config values are present
      const hasRequiredConfig = firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.databaseURL &&
        firebaseConfig.projectId;

      if (!hasRequiredConfig) {
        console.warn('Firebase config missing required values');
        return false;
      }

      firebaseApp = initializeApp(firebaseConfig);
      auth = getAuth(firebaseApp);
      return true;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      return false;
    }
  } else if (getApps().length > 0) {
    firebaseApp = getApps()[0];
    auth = getAuth(firebaseApp);
    return true;
  }
  return false;
};

async function writeUserData(userName: string, comment: string) {
  if (!initializeFirebase() || !auth) {
    throw new Error("Firebase not initialized");
  }

  const user = auth.currentUser;

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
  await set(rateLimitRef, Date.now());

  // Add comment
  const commentsRef = ref(db, "comments");
  const newCommentRef = push(commentsRef);

  await set(newCommentRef, {
    username: userName,
    comment: comment,
    timestamp: Date.now(),
    uid: user.uid
  });
}

async function writeReply(userName: string, comment: string, parentId: string) {
  if (!initializeFirebase() || !auth) {
    throw new Error("Firebase not initialized");
  }

  const user = auth.currentUser;

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
  await set(rateLimitRef, Date.now());

  // Add reply
  const repliesRef = ref(db, `comments/${parentId}/replies`);
  const newReplyRef = push(repliesRef);

  await set(newReplyRef, {
    username: userName,
    comment: comment,
    timestamp: Date.now(),
    uid: user.uid,
    parentId: parentId
  });
}


// Anti-bot protection utilities
const checkRateLimit = (): boolean => {
  try {
    const lastSubmission = localStorage.getItem('lastFeedbackSubmission');
    if (lastSubmission) {
      const timeSinceLastSubmission = Date.now() - parseInt(lastSubmission);
      const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes
      if (timeSinceLastSubmission < RATE_LIMIT_MS) {
        const remainingMinutes = Math.ceil((RATE_LIMIT_MS - timeSinceLastSubmission) / 60000);
        throw new Error(`Please wait ${remainingMinutes} minute(s) before submitting another feedback.`);
      }
    }
    return true;
  } catch (e) {
    // If localStorage is not available, allow submission
    return true;
  }
};

const updateRateLimit = (): void => {
  try {
    localStorage.setItem('lastFeedbackSubmission', Date.now().toString());
  } catch (e) {
    // If localStorage is not available, silently continue
  }
};

const validateSubmissionTime = (startTime: number): boolean => {
  const submissionTime = Date.now() - startTime;
  const MIN_SUBMISSION_TIME = 3000; // 3 seconds minimum
  return submissionTime >= MIN_SUBMISSION_TIME;
};

async function writeFeedbackForm(name: string, email: string, subject: string, message: string, honeypot: string = '', startTime: number) {
  // Anti-bot checks
  
  // 1. Honeypot check
  if (honeypot.trim() !== '') {
    throw new Error("Spam detection triggered. Please try again.");
  }
  
  // 2. Rate limiting check
  checkRateLimit();
  
  // 3. Submission time check (prevent too-fast submissions)
  if (!validateSubmissionTime(startTime)) {
    throw new Error("Please take a moment to review your feedback before submitting.");
  }
  
  // 4. Enhanced validation
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();
  
  // Name validation (prevent common spam patterns)
  if (trimmedName.length < 2 || trimmedName.length > 50) {
    throw new Error("Name must be between 2 and 50 characters.");
  }
  
  if (!/^[a-zA-Z0-9\s._-]+$/.test(trimmedName)) {
    throw new Error("Name contains invalid characters. Please use only letters, numbers, spaces, periods, underscores, and dashes.");
  }
  
  // Email validation (enhanced)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail) || trimmedEmail.length > 100) {
    throw new Error("Please enter a valid email address.");
  }
  
  // Subject validation
  if (trimmedSubject.length < 5 || trimmedSubject.length > 100) {
    throw new Error("Subject must be between 5 and 100 characters.");
  }
  
  // Message validation
  if (trimmedMessage.length < 10 || trimmedMessage.length > 1000) {
    throw new Error("Message must be between 10 and 1000 characters.");
  }
  
  // Check for common spam content
  const spamPatterns = [
    /\b(viagra|cialis|casino|lottery|winner)\b/i,
    /\b(click here|visit now|act now)\b/i,
    /(http[s]?:\/\/[^\s]+){3,}/i, // Multiple URLs
  ];
  
  const fullText = `${trimmedName} ${trimmedEmail} ${trimmedSubject} ${trimmedMessage}`.toLowerCase();
  for (const pattern of spamPatterns) {
    if (pattern.test(fullText)) {
      throw new Error("Message contains prohibited content.");
    }
  }
  
  // Check EmailJS configuration
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    throw new Error("Email service is not properly configured. Please try again later.");
  }
  
  try {
    // Initialize EmailJS (if not already done)
    if (typeof window !== 'undefined') {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }
    
    // Send email via EmailJS
    const templateParams = {
      from_name: trimmedName,
      from_email: trimmedEmail,
      subject: trimmedSubject,
      message: trimmedMessage,
      to_email: 'kartikpat25@gmail.com',
      timestamp: new Date().toLocaleString(),
    };
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );
    
    if (response.status === 200) {
      // Update rate limit after successful submission
      updateRateLimit();
    } else {
      throw new Error("Failed to send email. Please try again.");
    }
    
  } catch (error: any) {
    console.error('EmailJS error:', error);
    if (error.message) {
      throw error;
    } else {
      throw new Error("Failed to send feedback. Please check your internet connection and try again.");
    }
  }
}

export default function Comments() {
  const PAGE_SIZE = 5;

  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('chat');
  const [authMethod, setAuthMethod] = useState<"anonymous" | "named">("anonymous");
  const [nameInput, setNameInput] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [savedName, setSavedName] = useState<string | null>(null);
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  const [commentText, setCommentText] = useState<string>("");
  const [comments, setComments] = useState<CommentType[]>([]);

  // Form feedback states
  const [formName, setFormName] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formSubject, setFormSubject] = useState<string>("");
  const [formMessage, setFormMessage] = useState<string>("");
  const [formSubmissions, setFormSubmissions] = useState<FeedbackFormType[]>([]);
  const [honeypot, setHoneypot] = useState<string>(""); // Hidden field for bot detection
  const [formStartTime, setFormStartTime] = useState<number>(Date.now()); // Track when form interaction started

  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [initError, setInitError] = useState<string>("");

  // Reply states
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [replySubmitting, setReplySubmitting] = useState<boolean>(false);

  // Initialize Firebase Auth
  useEffect(() => {
    if (!initializeFirebase() || !auth) {
      setInitError("Firebase initialization failed - environment variables may be missing");
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
          // LocalStorage error - silently handled
        }
      } else {
        // Sign in anonymously
        if (auth) {
          signInAnonymously(auth)
            .then(() => {
              // Anonymous sign-in successful
            })
            .catch((error) => {
              setInitError(`Authentication failed: ${error.message}`);
              setAuthLoading(false);
            });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Load comments and form submissions
  useEffect(() => {
    if (!initializeFirebase()) {
      setLoading(false);
      return;
    }

    const db = getDatabase();
    setLoading(true);

    // Load comments with replies
    const commentsRef = ref(db, "comments");
    const commentsListener = onValue(
      commentsRef,
      (snapshot) => {
        const data = snapshot.val() || {};
        const arr: CommentType[] = Object.keys(data).map((key) => {
          const comment = data[key];
          const replies: ReplyType[] = [];
          
          // Load replies if they exist
          if (comment.replies) {
            Object.keys(comment.replies).forEach((replyKey) => {
              replies.push({
                id: replyKey,
                ...comment.replies[replyKey]
              });
            });
          }
          
          // Sort replies by timestamp (oldest first for replies)
          replies.sort((a, b) => a.timestamp - b.timestamp);

          return {
            id: key,
            username: comment.username,
            comment: comment.comment,
            timestamp: comment.timestamp,
            uid: comment.uid,
            editedAt: comment.editedAt,
            replies: replies
          };
        });

        // Filter out feedback submissions from comments display
        const filteredComments = arr.filter((comment) => 
          !comment.username.includes('_Feedback') && 
          !comment.comment.startsWith('📝 FEEDBACK:')
        );
        
        filteredComments.sort((a, b) => b.timestamp - a.timestamp);
        setComments(filteredComments);
        setLoading(false);
      },
      (error) => {
        setInitError(`Failed to load comments: ${error.message}`);
        setLoading(false);
      }
    );

    // Note: Form submissions are not loaded for display due to Firebase permissions
    // They are stored securely and can only be accessed by admin
    setFormSubmissions([]);

    return () => {
      off(commentsRef);
    };
  }, [currentUid]);

  const totalPages = Math.max(1, Math.ceil(
    feedbackMode === 'chat' ? comments.length / PAGE_SIZE : formSubmissions.length / PAGE_SIZE
  ));

  const getPageComments = (): CommentType[] => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return comments.slice(startIndex, endIndex);
  };

  const getPageForms = (): FeedbackFormType[] => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return formSubmissions.slice(startIndex, endIndex);
  };

  const handleAuthenticate = () => {
    const chosenName =
      authMethod === "anonymous" ? "Anonymous" : nameInput.trim() || "Anonymous";
    setSavedName(chosenName);
    try {
      localStorage.setItem("commenterName", chosenName);
    } catch (e) {
      // LocalStorage error - silently handled
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
      // LocalStorage error - silently handled
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isAuthenticated || submitting) return;

    if (feedbackMode === 'chat') {
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
        await writeUserData(userName, trimmed);
        setCommentText("");
        setPage(1);
      } catch (error: any) {
        setSubmitError(error.message || "Failed to post comment");
      } finally {
        setSubmitting(false);
      }
    } else {
      // Handle form submission
      const trimmedName = formName.trim();
      const trimmedEmail = formEmail.trim();
      const trimmedSubject = formSubject.trim();
      const trimmedMessage = formMessage.trim();

      if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
        setSubmitError("All fields are required");
        return;
      }

      setSubmitting(true);
      setSubmitError("");

      try {
        await writeFeedbackForm(trimmedName, trimmedEmail, trimmedSubject, trimmedMessage, honeypot, formStartTime);
        setFormName("");
        setFormEmail("");
        setFormSubject("");
        setFormMessage("");
        setHoneypot(""); // Clear honeypot
        setFormStartTime(Date.now()); // Reset form start time
        setSubmitSuccess("Feedback submitted successfully! Thank you for your input.");
        setPage(1);
        
        // Clear success message after 5 seconds
        setTimeout(() => setSubmitSuccess(""), 5000);
      } catch (error: any) {
        setSubmitError(error.message || "Failed to submit feedback form");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (parentId: string) => {
    if (!isAuthenticated || replySubmitting || !replyText.trim()) return;

    if (replyText.trim().length > 500) {
      setSubmitError("Reply too long (max 500 characters)");
      return;
    }

    setReplySubmitting(true);
    setSubmitError("");

    try {
      const userName = savedName || (authMethod === "anonymous" ? "Anonymous" : nameInput.trim() || "Anonymous");
      await writeReply(userName, replyText.trim(), parentId);
      setReplyText("");
      setReplyingTo(null);
    } catch (error: any) {
      setSubmitError(error.message || "Failed to post reply");
    } finally {
      setReplySubmitting(false);
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
          <p className="text-xs mt-4 text-theme-secondary">Check console for details</p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8 m-10">
        <div className="text-theme-secondary">Initializing authentication...</div>
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
            {feedbackMode === 'chat' ? (
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
              </svg>
            ) : (
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#0f0f0f' }}>
            {feedbackMode === 'chat' ? 'Comments' : 'Feedback Form'}
          </h2>
          <p className="mt-1" style={{ color: '#0f0f0f' }}>
            {feedbackMode === 'chat'
              ? 'Share feedback or say hi — choose how you\'d like to appear.'
              : 'Send detailed feedback with your contact information.'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="w-full max-w-3xl">
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => {
                setFeedbackMode('chat');
                setPage(1);
                setSubmitError("");
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${feedbackMode === 'chat'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              💬 Chat Comments
            </button>
            <button
              onClick={() => {
                setFeedbackMode('form');
                setPage(1);
                setSubmitError("");
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${feedbackMode === 'form'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              📝 Feedback Form
            </button>
          </div>
        </div>

        {/* Authentication Section - Only show for chat mode */}
        {feedbackMode === 'chat' && (
          <div className="w-full max-w-3xl">
            {!isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#ededed' }}>
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

                  <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#ededed' }}>
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
                <div className="text-sm" style={{ color: '#ededed' }}>
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
        )}

        {/* Simple authentication for form mode */}
        {feedbackMode === 'form' && !isAuthenticated && (
          <div className="w-full max-w-3xl">
            <div className="text-center space-y-4">
              <p className="text-sm" style={{ color: '#ededed' }}>
                Please authenticate to submit feedback forms
              </p>
              <button
                onClick={() => {
                  setIsAuthenticated(true);
                  setSavedName("Form User");
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-3xl">
          {feedbackMode === 'chat' ? (
            // Chat Comment Form
            <div className="relative">
              <textarea
                placeholder={isAuthenticated ? "Write your comment... (Press Enter to submit, Shift+Enter for new line)" : "Authenticate to enable commenting"}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value.slice(0, 500))}
                onKeyDown={handleKeyPress}
                rows={4}
                className={`w-full p-4 rounded-lg border text-sm bg-white dark:bg-[#071025] resize-none ${!isAuthenticated ? "opacity-60 cursor-not-allowed" : ""}`}
                style={{ color: '#ededed' }}
                disabled={!isAuthenticated || submitting}
                maxLength={500}
              />
              <div className="absolute bottom-3 right-3 text-xs" style={{ color: '#ededed' }}>
                {commentText.length}/500
              </div>
            </div>
          ) : (
            // Feedback Form
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="form-name" className="block text-sm font-medium mb-2" style={{ color: '#ededed' }}>
                    Name *
                  </label>
                  <input
                    id="form-name"
                    type="text"
                    placeholder="Your full name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value.slice(0, 50))}
                    className="w-full p-3 rounded-lg border text-sm bg-white dark:bg-[#071025]"
                    style={{ color: '#ededed' }}
                    disabled={!isAuthenticated || submitting}
                    maxLength={50}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="form-email" className="block text-sm font-medium mb-2" style={{ color: '#ededed' }}>
                    Email *
                  </label>
                  <input
                    id="form-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value.slice(0, 100))}
                    className="w-full p-3 rounded-lg border text-sm bg-white dark:bg-[#071025]"
                    style={{ color: '#ededed' }}
                    disabled={!isAuthenticated || submitting}
                    maxLength={100}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="form-subject" className="block text-sm font-medium mb-2" style={{ color: '#ededed' }}>
                  Subject *
                </label>
                <input
                  id="form-subject"
                  type="text"
                  placeholder="Brief description of your feedback"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value.slice(0, 100))}
                  className="w-full p-3 rounded-lg border text-sm bg-white dark:bg-[#071025]"
                  style={{ color: '#ededed' }}
                  disabled={!isAuthenticated || submitting}
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label htmlFor="form-message" className="block text-sm font-medium mb-2" style={{ color: '#ededed' }}>
                  Message *
                </label>
                <div className="relative">
                  <textarea
                    id="form-message"
                    placeholder={isAuthenticated ? "Write your detailed feedback..." : "Authenticate to enable form submission"}
                    value={formMessage}
                    onChange={(e) => {
                      setFormMessage(e.target.value.slice(0, 1000));
                      // Reset form start time when user starts typing (for bot detection)
                      if (formStartTime === 0) {
                        setFormStartTime(Date.now());
                      }
                    }}
                    rows={6}
                    className={`w-full p-4 rounded-lg border text-sm bg-white dark:bg-[#071025] resize-none ${!isAuthenticated ? "opacity-60 cursor-not-allowed" : ""}`}
                    style={{ color: '#ededed' }}
                    disabled={!isAuthenticated || submitting}
                    maxLength={1000}
                    required
                  />
                  <div className="absolute bottom-3 right-3 text-xs" style={{ color: '#ededed' }}>
                    {formMessage.length}/1000
                  </div>
                </div>
              </div>
              
              {/* Honeypot field - hidden from users but visible to bots */}
              <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
                <label htmlFor="website">Please leave this field empty</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
            </div>
          )}

          {submitError && (
            <div className="mt-2 text-sm text-red-500" style={{ color: '#ef4444' }}>{submitError}</div>
          )}

          {submitSuccess && (
            <div className="mt-2 text-sm text-green-600" style={{ color: '#16a34a' }}>{submitSuccess}</div>
          )}

          <div className="flex justify-end gap-3 mt-3">
            <button
              type="button"
              onClick={() => {
                if (feedbackMode === 'chat') {
                  setCommentText("");
                } else {
                  setFormName("");
                  setFormEmail("");
                  setFormSubject("");
                  setFormMessage("");
                }
                setSubmitError("");
              }}
              disabled={feedbackMode === 'chat' ? !commentText.trim() : !formName.trim() && !formEmail.trim() && !formSubject.trim() && !formMessage.trim()}
              className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={
                !isAuthenticated ||
                submitting ||
                (feedbackMode === 'chat' ? !commentText.trim() : !formName.trim() || !formEmail.trim() || !formSubject.trim() || !formMessage.trim())
              }
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (feedbackMode === 'chat' ? "Posting..." : "Submitting...") : (feedbackMode === 'chat' ? "Post Comment" : "Submit Feedback")}
            </button>
          </div>
        </form>

        {/* Content Display */}
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div>
              <strong className="text-lg" style={{ color: '#0f0f0f' }}>
                {feedbackMode === 'chat' ? 'Comments' : 'Your Feedback Submissions'}
              </strong>
              <div className="text-sm" style={{ color: '#0f0f0f' }}>
                {feedbackMode === 'chat' ? `${comments.length} total` : `${formSubmissions.length} submitted`}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-theme-secondary py-8">
              Loading {feedbackMode === 'chat' ? 'comments' : 'submissions'}...
            </div>
          ) : feedbackMode === 'chat' ? (
            comments.length === 0 ? (
              <div className="text-center text-theme-secondary py-8">
                No comments yet. Be the first to leave feedback!
              </div>
            ) : (
              <>
                {/* Comments List */}
                <ul className="flex flex-col gap-4">
                  {getPageComments().map((c) => {
                    const isOwn = currentUid === c.uid;
                    const isReplyingToThis = replyingTo === c.id;
                    
                    return (
                      <li
                        key={c.id}
                        className={`p-4 rounded-lg border bg-white dark:bg-[#071025] ${isOwn ? 'border-blue-400' : ''}`}
                      >
                        <div className="flex gap-3 items-start">
                          {renderAvatar(c.username)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm" style={{ color: '#ededed' }}>{c.username}</span>
                              {isOwn && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs mb-2" style={{ color: '#ededed' }}>
                              <span>{formatTimestamp(c.timestamp)}</span>
                              {c.editedAt && (
                                <span className="text-xs opacity-75">(edited)</span>
                              )}
                            </div>
                            
                            <p className="text-sm break-words whitespace-pre-wrap mb-3" style={{ color: '#ededed' }}>
                              {c.comment}
                            </p>
                            
                            {/* Action buttons */}
                            <div className="flex gap-3 text-xs">
                              <button
                                onClick={() => {
                                  setReplyingTo(replyingTo === c.id ? null : c.id);
                                  setReplyText("");
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Reply
                              </button>
                              
                              {c.replies && c.replies.length > 0 && (
                                <span className="text-gray-500">
                                  {c.replies.length} {c.replies.length === 1 ? 'reply' : 'replies'}
                                </span>
                              )}
                            </div>
                            
                            {/* Reply form */}
                            {isReplyingToThis && (
                              <div className="mt-3 space-y-3">
                                <div className="relative">
                                  <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value.slice(0, 500))}
                                    className="w-full p-3 rounded-lg border text-sm bg-white dark:bg-gray-700 resize-none"
                                    style={{ color: '#ededed' }}
                                    rows={3}
                                    maxLength={500}
                                    placeholder={`Reply to ${c.username}...`}
                                  />
                                  <div className="absolute bottom-2 right-2 text-xs opacity-75">
                                    {replyText.length}/500
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleReplySubmit(c.id)}
                                    disabled={replySubmitting || !replyText.trim()}
                                    className="px-3 py-1 text-xs rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {replySubmitting ? "Posting..." : "Post Reply"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyText("");
                                    }}
                                    className="px-3 py-1 text-xs rounded-md border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            {/* Replies */}
                            {c.replies && c.replies.length > 0 && (
                              <div className="mt-4 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                                {c.replies.map((reply) => (
                                  <div key={reply.id} className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-white">
                                      {reply.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-xs" style={{ color: '#ededed' }}>
                                          {reply.username}
                                        </span>
                                        {reply.uid === currentUid && (
                                          <span className="text-xs px-1 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                            You
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs mb-1 opacity-75">
                                        {formatTimestamp(reply.timestamp)}
                                      </div>
                                      <p className="text-xs break-words whitespace-pre-wrap" style={{ color: '#ededed' }}>
                                        {reply.comment}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Pagination for comments */}
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
                          className={`px-3 py-2 rounded-md text-sm transition-colors ${page === pageNumber
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
            )
          ) : (
            /* Form Mode - Show thank you message styled like chat empty state */
            <div className="text-center text-theme-secondary py-8">
              Thank you for your feedback! All submissions are reviewed and greatly appreciated.
            </div>
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
