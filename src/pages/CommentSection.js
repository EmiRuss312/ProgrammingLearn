import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp 
} from "firebase/firestore";
import { db, auth } from "../firebase-config";

const CommentSection = ({ postId, isAuth }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const commentsRef = collection(db, "comments");

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const q = query(commentsRef, where("postId", "==", postId));
        const querySnapshot = await getDocs(q);
        
        const commentsData = [];
        querySnapshot.forEach((doc) => {
          commentsData.push({ 
            id: doc.id, 
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()?.toLocaleString() || "Недавно"
          });
        });
        
        commentsData.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setComments(commentsData);
      } catch (error) {
        console.error("Ошибка загрузки комментариев:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      alert("Комментарий не может быть пустым!");
      return;
    }
    
    if (!isAuth) {
      alert("Войдите, чтобы оставить комментарий!");
      return;
    }

    try {
      const user = auth.currentUser;
      await addDoc(commentsRef, {
        postId,
        text: newComment.trim(),
        author: {
          name: user.displayName || "Аноним",
          id: user.uid
        },
        createdAt: serverTimestamp()
      });
      
      setNewComment("");
      const q = query(commentsRef, where("postId", "==", postId));
      const data = await getDocs(q);
      setComments(data.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate()?.toLocaleString() || "Только что"
      })));
      
    } catch (error) {
      console.error("Ошибка при добавлении комментария:", error);
      alert("Не удалось добавить комментарий");
    }
  };

  const handleDelete = async (commentId, authorId) => {
    if (!isAuth) return;
    
    if (auth.currentUser.uid !== authorId) {
      alert("Вы можете удалять только свои комментарии!");
      return;
    }

    if (window.confirm("Удалить этот комментарий?")) {
      try {
        await deleteDoc(doc(db, "comments", commentId));
        setComments(comments.filter(comment => comment.id !== commentId));
      } catch (error) {
        console.error("Ошибка при удалении комментария:", error);
      }
    }
  };

  return (
    <div className="comment-section">
      <h4>Комментарии ({comments.length}):</h4>
      
      {isAuth ? (
        <div className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ваш комментарий..."
            rows={3}
            maxLength={500}
          />
          <button onClick={handleSubmit}>Отправить</button>
        </div>
      ) : (
        <p className="login-prompt">Войдите, чтобы оставить комментарий</p>
      )}

      {isLoading ? (
        <p>Загрузка комментариев...</p>
      ) : comments.length === 0 ? (
        <p>Пока нет комментариев. Будьте первым!</p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <strong>{comment.author.name}</strong>
                <span className="comment-date">{comment.createdAt}</span>
                
                {isAuth && comment.author.id === auth.currentUser?.uid && (
                  <button 
                    className="delete-comment"
                    onClick={() => handleDelete(comment.id, comment.author.id)}
                    title="Удалить"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="comment-text">
                {comment.text.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;