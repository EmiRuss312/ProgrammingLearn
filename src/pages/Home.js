import React, { useEffect, useState } from "react";
import { getDocs, collection, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase-config";
import CommentSection from "./CommentSection";

function Home({ isAuth }) {
  const [postLists, setPostList] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("Все");
  const [availableTopics, setAvailableTopics] = useState(["Все"]);
  const [userAnswers, setUserAnswers] = useState({}); // { [postId]: { answer: "", isCorrect: null } }

  const postsCollectionRef = collection(db, "posts");

  const deletePost = async (id) => {
    const postDoc = doc(db, "posts", id);
    await deleteDoc(postDoc);
    refreshPosts();
  };

  const refreshPosts = async () => {
    const data = await getDocs(postsCollectionRef);
    const posts = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    const topics = [...new Set(posts.map(post => post.topic || "Общее"))];
    setAvailableTopics(["Все", ...topics]);

    setPostList(posts);
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  const handleAnswerChange = (postId, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [postId]: { ...(prev[postId] || {}), answer: value }
    }));
  };

  const checkAnswer = (postId, correctAnswer) => {
    const userAnswer = (userAnswers[postId]?.answer || "").trim().toLowerCase();
    const correct = correctAnswer.trim().toLowerCase() === userAnswer;
    setUserAnswers(prev => ({
      ...prev,
      [postId]: { ...(prev[postId] || {}), isCorrect: correct }
    }));
  };

  const filteredPosts = selectedTopic === "Все"
    ? postLists
    : postLists.filter(post => post.topic === selectedTopic);

  return (
    <div className="homePage">
      <div className="filter-container">
        <h2>Фильтр задач</h2>
        <div className="filter-controls">
          <label>Тема:</label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            {availableTopics.map((topic, index) => (
              <option key={index} value={topic}>{topic}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredPosts.map((post) => {
        const answerState = userAnswers[post.id] || { answer: "", isCorrect: null };

        return (
          <div className="post" key={post.id}>
            <div className="postHeader">
              <div className="title">
                <h1>{post.title}</h1>
                <span className="topic-badge">{post.topic || "Общее"}</span>
              </div>
              <div className="deletePost">
                {isAuth && post.author.id === auth.currentUser.uid && (
                  <button onClick={() => deletePost(post.id)}>
                    &#128465;
                  </button>
                )}
              </div>
            </div>

            <div className="postTextContainer">
              {post.postText.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            {/* Ответ и проверка */}
            {post.answerTitle && (
              <div className="answerCheckSection">
                <input
                  type="text"
                  placeholder="Введите ваш ответ..."
                  value={answerState.answer}
                  onChange={(e) => handleAnswerChange(post.id, e.target.value)}
                />
                <button onClick={() => checkAnswer(post.id, post.answerTitle)}>
                  Проверить
                </button>
                {answerState.isCorrect === true && <p className="success">Верно!</p>}
                {answerState.isCorrect === false && <p className="error">Неверно. Попробуйте снова.</p>}
              </div>
            )}

            <div className="postFooter">
              <h3>@{post.author.name}</h3>
            </div>

            <CommentSection postId={post.id} isAuth={isAuth} />
          </div>
        );
      })}
    </div>
  );
}

export default Home;
