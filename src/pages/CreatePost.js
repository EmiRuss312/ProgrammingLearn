import React, { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebase-config";
import { useNavigate } from "react-router-dom";

function CreatePost({ isAuth }) {
  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [topic, setTopic] = useState("Общее");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answerTitle, setAnswerTitle] = useState("");
  
  const postsCollectionRef = collection(db, "posts");
  let navigate = useNavigate();

  const createPost = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const user = auth.currentUser;
    if (!user) {
      alert("Ошибка: пользователь не авторизован");
      setIsSubmitting(false);
      return;
    }

    if (!title.trim() || !postText.trim()) {
      alert("Заполните все поля перед отправкой!");
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(postsCollectionRef, {
        title: title.trim(),
        postText: postText.trim(),
        topic,
        author: { 
          name: user.displayName || "Аноним", 
          id: user.uid 
        },
        answerTitle: answerTitle.trim(),
        createdAt: new Date()
      });
      navigate("/");
    } catch (error) {
      console.error("Ошибка при создании поста:", error);
      alert("Ошибка при создании поста. Проверь консоль.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, [isAuth, navigate]);

  return (
    <div className="createPostPage">
      <div className="cpContainer">
        <h1>Создать задачу</h1>
        
        <div className="inputGp">
          <label>Тема:</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            <option value="Общее">Общее</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="HTML/CSS">HTML/CSS</option>
            <option value="Алгоритмы">Алгоритмы</option>
            <option value="Базы данных">Базы данных</option>
            <option value="React">React</option>
          </select>
        </div>
        
        <div className="inputGp">
          <label>Заголовок:</label>
          <input
            placeholder="Название задачи..."
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
          />
        </div>
        
        <div className="inputGp">
          <label>Описание задачи:</label>
          <textarea
            placeholder="Детальное описание задачи..."
            onChange={(event) => setPostText(event.target.value)}
            rows={8}
          />
        </div>

        <div className="inputGp">
          <label>Ответ:</label>
          <input
            placeholder="Ответ к этой задаче"
            onChange={(event) => setAnswerTitle(event.target.value)}
            maxLength={100}
          />
        </div>
        
        <button 
          onClick={createPost} 
          disabled={isSubmitting}
          className={isSubmitting ? "submitting" : ""}
        >
          {isSubmitting ? "Отправка..." : "Опубликовать задачу"}
        </button>
      </div>
    </div>
  );
}

export default CreatePost;
