import { useState, useEffect } from "react";
import axios from "axios";
import { signIn, signOut, useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [likeCounts, setLikeCounts] = useState<{ [contentId: number]: number }>({});


  const fetchContents = async () => {
    try {
      const res = await axios.get("/api/content");
      console.log("Fetched contents:", res.data);  
      setContents(res.data);  // Uložení obsahu
  
      // Získání počtu liků pro každý obsah
      const likeCountsData: { [contentId: number]: number } = {};
      for (let content of res.data) {
        const likeCount = await getLikeCount(content.id);
        likeCountsData[content.id] = likeCount;
      }
  
      setLikeCounts(likeCountsData);  // Uložení počtu liků pro každý obsah
    } catch (error) {
      console.error("Error fetching contents:", error);
    }
  };
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
   
    if (!session) {
      console.log('No session found');
    }
    
    if (session && !session.accessToken) {
      console.log('No access token found in session');
    }
    
    console.log('Session:', session);
    
    try {
      const response = await axios.post(
        "/api/content/create", 
        { title, body },
        {
          withCredentials: true,  
          headers: session && session.accessToken ? {
            Authorization: `Bearer ${session.accessToken}`, 
          } : {},
        }
      );
  
      console.log("Content created successfully:", response.data);
  
     
      setTitle("");
      setBody("");
      fetchContents()
    } catch (error) {
      console.error("Error creating content:", error);
      alert("Failed to create content. Please check the console for errors.");
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
        fetchContents(); // Aktualizuje obsah po smazání
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
        fetchContents(); // Znovu načte obsah po úpravě
      } else {
        console.error("Chyba při úpravě komentáře");
      }
    } catch (error) {
      console.error("Chyba při komunikaci s API:", error);
    }
  };
  

  const handleDelete = async (id: number) => {
    if (!session) {
      alert("You must be logged in to delete content.");
      return;
    }
  
    try {
      console.log("Deleting ID:", {id});
      await axios.delete(`/api/content/delete/${id}`);
      setContents((prevContents) => prevContents.filter((content) => content.id !== id));
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Failed to delete content.");
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
    } else {
      console.error("Chyba při přepínání liku");
    }
  };

  const getLikeCount = async (contentId: number) => {
    try {
      const res = await axios.get(`/api/content/getLikeCount/${contentId}`);
      return res.data.likeCount;  // Předpokládáme, že API vrací počet liků
    } catch (error) {
      console.error("Error fetching like count:", error);
      return 0;  // V případě chyby vrátíme 0
    }
  };
  
  
  
  
  
  
  
  

  useEffect(() => {
    if (session) {
      fetchContents();
    }
  }, [session]);

  if (!session) {
    return (
      <div>
        {isRegistering ? (
          <>
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Register</button>
            </form>
            <p>
              Already have an account?{" "}
              <button onClick={() => setIsRegistering(false)}>Login here</button>
            </p>
          </>
        ) : (
          <>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
            </form>
            <p>
              Don't have an account?{" "}
              <button onClick={() => setIsRegistering(true)}>Register here</button>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => signOut()}>Logout</button>
      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <button type="submit">Create</button>
      </form>
      <h2>Contents</h2>
      <ul>
        {contents.map((content) => (
          <li key={content.id}>
            <h3>{content.title}</h3>
            <p>{content.body}</p>
            <p>{content.id}</p>
            <button onClick={() => handleDelete(content.id)}>Delete</button>
            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
            <button onClick={() => handleAddComment(content.id, newComment)}>Přidat komentář</button>
            <ul>
              {content.comments.map((comment) => (
                <li key={comment.id}>
                    <strong>{comment.user.email}:</strong>
                    {editingCommentId === comment.id ? (
                      <>
                        <input
                          type="text"
                          value={editedCommentText}
                          onChange={(e) => setEditedCommentText(e.target.value)}
                        />
                        <button onClick={() => handleEditComment(comment.id, editedCommentText)}>Uložit</button>
                        <button onClick={() => setEditingCommentId(null)}>Zrušit</button>
                      </>
                    ) : (
                      <>
                        {comment.text}
                        <small> {new Date(comment.createdAt).toLocaleString()}</small>
                        <button onClick={() => handleDeleteComment(comment.id)}>Smazat</button>
                        <button onClick={() => { setEditingCommentId(comment.id); setEditedCommentText(comment.text); }}>Upravit</button>
                        <button onClick={() => handleToggleLike(content.id)}>👍 Like</button> 
                        <p>Počet liků: {likeCounts[content.id] || 0}</p>
                      </>
                    )}
              </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
