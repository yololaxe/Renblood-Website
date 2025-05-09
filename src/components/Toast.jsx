import React from "react";

export default function Toast({ status, message }) {
  if (!status) return null;

  // Choix de la couleur selon le statut
  const bgClass =
    status === "Good"
      ? "bg-green-600"
      : status === "Bad"
      ? "bg-red-600"
      : "bg-blue-600";

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg text-white ${bgClass}`}
    >
      {message}
    </div>
  );
}
