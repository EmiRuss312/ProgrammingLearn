import React, { useEffect, useState } from "react";
import { getDocs, collection, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase-config";

function TheoryList({ isAuth }) {
  const [theories, setTheories] = useState([]);
  const theoryCollectionRef = collection(db, "theories");

  const refreshTheories = async () => {
    const data = await getDocs(theoryCollectionRef);
    const theoryData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setTheories(theoryData);
  };

  const deleteTheory = async (id) => {
    await deleteDoc(doc(db, "theories", id));
    refreshTheories();
  };

  useEffect(() => {
    refreshTheories();
  }, []);

  return (
    <div className="homePage">
      <h1>Теоретические материалы</h1>
      {theories.map((theory) => (
        <div className="post" key={theory.id}>
          <div className="postHeader">
            <div className="title">
              <h2>{theory.topic}</h2>
            </div>
            <div className="deletePost">
              {isAuth && theory.author?.id === auth.currentUser?.uid && (
                <button onClick={() => deleteTheory(theory.id)}>&#128465;</button>
              )}
            </div>
          </div>
          <div className="postTextContainer">
            {theory.theoryText.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <div className="postFooter">
            <h4>@{theory.author?.name || "Аноним"}</h4>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TheoryList;