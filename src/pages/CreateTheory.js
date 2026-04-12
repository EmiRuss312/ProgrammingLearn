import React, { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebase-config";
import { useNavigate } from "react-router-dom";

function CreateTheory({ isAuth }) {
  const [topic, setTopic] = useState("Общее");
  const [theoryText, setTheoryText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const theoryCollectionRef = collection(db, "theories");
  let navigate = useNavigate();

  const createTheory = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const user = auth.currentUser;
    if (!user) {
      alert("Ошибка: пользователь не авторизован");
      setIsSubmitting(false);
      return;
    }

    if (!topic.trim() || !theoryText.trim()) {
      alert("Заполните все поля перед отправкой!");
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(theoryCollectionRef, {
        topic: topic.trim(),
        theoryText: theoryText.trim(),
        author: {
          name: user.displayName || "Аноним",
          id: user.uid,
        },
        createdAt: new Date(),
      });
      navigate("/theory");
    } catch (error) {
      console.error("Ошибка при создании теории:", error);
      alert("Ошибка при создании теории. Проверь консоль.");
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
        <h1>Создать теоретический материал</h1>

        <div className="inputGp">
          <label>Тема:</label>
          <input
            placeholder="Название темы..."
            onChange={(event) => setTopic(event.target.value)}
            maxLength={100}
          />
        </div>

        <div className="inputGp">
          <label>Текст теории:</label>
          <textarea
            placeholder="Введите теоретический материал..."
            onChange={(event) => setTheoryText(event.target.value)}
            rows={10}
          />
        </div>

        <button
          onClick={createTheory}
          disabled={isSubmitting}
          className={isSubmitting ? "submitting" : ""}
        >
          {isSubmitting ? "Отправка..." : "Опубликовать теорию"}
        </button>
      </div>
    </div>
  );
}

export default CreateTheory;