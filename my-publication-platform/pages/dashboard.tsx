import { useState, useEffect } from "react";
import axios from "axios";
import { signIn, signOut, useSession } from "next-auth/react";
import styles from "./dashboard.module.css";
import { formatDistanceToNow } from "date-fns";
import { cs } from "date-fns/locale";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

export default function Dashboard() {
  interface Content {
    id: number;
    title: string;
    body: string;
    comments: Comment[];
    createdAt: string;
    user: { name: string; email: string };
  }

  interface Comment {
    id: number;
    text: string;
    user: { name: string, email: string };
    createdAt: string;
  }


  const [contents, setContents] = useState<Content[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const { data: session } = useSession() || {};
  const [newComment, setNewComment] = useState("");
  const [editedContentTitle, setEditedContentTitle] = useState("");
  const [editedContentBody, setEditedContentBody] = useState("");
  const [editingContentId, setEditingContentId] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [likeCounts, setLikeCounts] = useState<{ [contentId: number]: number }>({});
  const [currentUser, setCurrentUser] = useState({ email: "user@example.com" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("likes");


  const fetchContents = async () => {
    try {
      const res = await axios.get("/api/content");
      console.log("Fetched contents:", res.data);  
      console.log("SD", currentUser);
      setContents(res.data); 
  
      const likeCountsData: { [contentId: number]: number } = {};
      for (const content of res.data) { 
        const likeCount = await getLikeCount(content.id);
        likeCountsData[content.id] = likeCount;
      }
  
      setLikeCounts(likeCountsData); 
    } catch (error) {
      console.error("Error fetching contents:", error);
    }
  };
  
  

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !body) {
      console.error("Title and body are required");
      return;
    }

    const token = session?.accessToken;
    const userId = session?.user.id;

    const response = await fetch("/api/content/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body, token, userId }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Content created successfully:", result);

      setTitle("");
      setBody("");
      fetchContents();
    } else {
      const errorResult = await response.json();
      console.error("Error creating content:", errorResult.message);
    }
  };
  

  const handleEditContent = async (contentId: number, newTitle: string, newBody: string) => {
    console.log("Editing content:", { contentId, newTitle, newBody });
  
    try {
      const res = await fetch(`/api/content/update/${contentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, body: newBody }),
      });
  
      if (res.ok) {
        console.log("Content updated");
        fetchContents(); 
        window.location.reload();
      } else {
        console.error("Chyba při úpravě obsahu");
      }
    } catch (error) {
      console.error("Chyba při komunikaci s API:", error);
    }
  };
  


  const handleAddComment = async (contentId: number, text: string) => {
    
    const token = session?.accessToken;
    const userId = session?.user.id;
    
    console.log("Creating content:", { contentId, text, token, userId });
    const res = await fetch("/api/content/createComment", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ contentId, text, token, userId }),
    });
  
    if (res.ok) {
      console.log("Komentář přidán");
      fetchContents();
    } else {
      console.error("Chyba při přidávání komentáře");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    console.log("Deleting comment:", commentId);
  
    try {
      const res = await fetch(`/api/content/delete/comment/${commentId}`, {
        method: "DELETE",
      });
  
      if (res.ok) {
        console.log("Komentář smazán");
        fetchContents(); 
      } else {
        console.error("Chyba při mazání komentáře");
      }
    } catch (error) {
      console.error("Chyba při komunikaci s API:", error);
    }
  };
  
  
  const handleEditComment = async (commentId: number, newText: string) => {
    console.log("Editing comment:", { commentId, newText });
  
    try {
      const res = await fetch(`/api/content/update/comment/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText }),
      });
  
      if (res.ok) {
        console.log("Komentář upraven");
        fetchContents();
        window.location.reload();
      } else {
        console.error("Chyba při úpravě komentáře");
      }
    } catch (error) {
      console.error("Chyba při komunikaci s API:", error);
    }
  };
  

  const handleDeleteContent = async (contentId: number) => {
    console.log("Trying to delete content with ID:", contentId);
    
    try {
      const res = await fetch(`/api/content/delete/${contentId}`, {
        method: "DELETE",
      });
  
      if (res.ok) {
        console.log("Content deleted successfully");

        fetchContents();
      } else {
        const data = await res.json();
        console.error("Error deleting content:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error communicating with API:", error);
    }
  };
  
  
  
  
  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signIn("credentials", { redirect: false, email: username, password });
    setUsername("");
    setPassword("");
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post("/api/register", { email: username, password });
      setUsername("");
      setPassword("");
      alert("Registration successful, you can now log in!");
      setIsRegistering(false);
    } catch (error) {
      console.error("Error registering:", error);
      alert("Registration failed.");
    }
  };

  const handleToggleLike = async (contentId: number) => {
    const token = session?.accessToken;
    const userId = session?.user.id;
  
    console.log("Toggling like for content:", { contentId, token, userId });
    
    const res = await fetch("/api/content/toggleLike", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ contentId, token, userId }),
    });
  
    if (res.ok) {
      console.log("Like toggled");
      fetchContents();
    } else {
      console.error("Chyba při přepínání liku");
    }
  };

  const getLikeCount = async (contentId: number) => {
    try {
      const res = await axios.get(`/api/content/getLikeCount/${contentId}`);
      return res.data.likeCount;
    } catch (error) {
      console.error("Error fetching like count:", error);
      return 0; 
    }
  };

  useEffect(() => {
    console.log("USERL", currentUser);
    fetchContents();

  }, [currentUser]);
  
  useEffect(() => {
    if (session) {
      console.log("SIGMA", currentUser); 
      if (session?.user) {
        console.log("session");
        if (session.user.email) {
          console.log(session.user.email);
          setCurrentUser({ email: session.user.email });
        }
      }
    }
  }, [session]); 
  

  if (!session) {
    return (
      <div className={styles.login}>
        {isRegistering ? (
          <>
            <h1 className={styles.Sign}>Register</h1>
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={styles.input}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
              <button className={styles.button}  type="submit">Register</button>
            </form>
            <p  className={styles.signin}>
              Already have an account?{" "}
              <button className={styles.buttonSmall} onClick={() => setIsRegistering(false)}>Login here</button>
            </p>
          </>
        ) : (
          <>
            <h1 className={styles.Sign}>Login</h1>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={styles.input}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
              <button className={styles.button} type="submit">Login</button>
            </form>
            <p className={styles.signin}>
              Do not have an account?{" "}
              <button className={styles.buttonSmall} onClick={() => setIsRegistering(true)}>Register here</button>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={styles.page}>
        <div className={styles.container}>
        <div className={styles.menu}>
            <div className={styles.usermenu}>
                <p>Hello, <strong>{currentUser.email}</strong></p>
                <button className={styles.button} onClick={() => signOut()}>Logout</button>
          </div>
          
          <form className={styles.form} onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={styles.input}
            />
            <textarea
              placeholder="Body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              className={styles.textarea}
            />
            <button type="submit" className={styles.button}>Add post</button>
          </form>
        </div>
      
            <div className={styles.search}>
                <input
                      type="text"
                      placeholder="Search by title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={styles.input}
                    />
                
                <select className={styles.select} onChange={(e) => setSortOption(e.target.value)}>
                  <option value="likes">Most Liked</option>
                  <option value="comments">Most Commented</option>
                  <option value="newest">Newest</option>
                </select>
            </div>

        <ul className={styles.contentList}>
      {contents
        .filter(content => content.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
          if (sortOption === "likes") {
            return (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0);
          } else if (sortOption === "comments") {
            return b.comments.length - a.comments.length;
          } else {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
        })
        .map((content) => (
        <li key={content.id} className={styles.contentItem}>
          {editingContentId === content.id ? (
            <>
              <input
                type="text"
                value={editedContentTitle}
                onChange={(e) => setEditedContentTitle(e.target.value)}
                className={styles.input}
              />
              <textarea
                value={editedContentBody}
                onChange={(e) => setEditedContentBody(e.target.value)}
                className={styles.input}
              />
              <button className={styles.button} onClick={() => handleEditContent(content.id, editedContentTitle, editedContentBody)}>✅</button>
              <button className={styles.button} onClick={() => setEditingContentId(null)}>❌</button>
            </>
          ) : (
            <>
              <h3 className={styles.contentTitle}>{content.title}</h3>
              <p className={styles.contentAutor}>{content.user.email}                 
                <small className={styles.timestampContent}>
                  {formatDistanceToNow(new Date(content.createdAt), { addSuffix: true, locale: cs })}
                </small>
              </p>
              <p className={styles.contentBody}>{content.body}</p>
              <div className={styles.buttonss}>
                <button className={styles.button} onClick={() => handleToggleLike(content.id)}>{likeCounts[content.id] || 0} 👍</button>
                {(content.user.email === currentUser.email || currentUser.email === "dev@dev.com") && (
                  <>
                    <button className={styles.buttonDelete} onClick={() => handleDeleteContent(content.id)}>🗑️</button>
                    <button className={styles.buttonEdit} onClick={() => { 
                      setEditingContentId(content.id); 
                      setEditedContentTitle(content.title); 
                      setEditedContentBody(content.body); 
                    }}>✏️</button>
                  </>
                )}
              </div>
            </>
          )}
          <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} className={styles.input} />
          <button className={styles.button} onClick={() => handleAddComment(content.id, newComment)}>➕</button>
          
          <ul className={styles.commentList}>
            {content.comments.map((comment) => (
              <li key={comment.id} className={styles.commentItem}>
                <strong>{comment.user.email}:</strong>
                {editingCommentId === comment.id ? (
                  <>
                    <input
                      type="text"
                      value={editedCommentText}
                      onChange={(e) => setEditedCommentText(e.target.value)}
                      className={styles.input}
                    />
                    <button className={styles.buttonComm} onClick={() => handleEditComment(comment.id, editedCommentText)}>✅</button>
                    <button className={styles.buttonComm} onClick={() => setEditingCommentId(null)}>❌</button>
                  </>
                ) : (
                  <>
                    {" " + comment.text}
                    <small className={styles.timestamp}>
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: cs })}
                    </small>
                    {(comment.user.email === currentUser.email || currentUser.email === "dev@dev.com") && (
                      <>
                        <button className={styles.buttonComm} onClick={() => handleDeleteComment(comment.id)}>🗑️</button>
                        <button className={styles.buttonComm} onClick={() => { setEditingCommentId(comment.id); setEditedCommentText(comment.text); }}>✎</button>
                      </>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  </div>
  </div>
  );

}
