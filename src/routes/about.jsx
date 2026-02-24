// src/routes/about.jsx
import React from 'react';

function About() {
  return (
    <>
      {/* Empty About page */}
      <h1>About NutriLife</h1>
      <p>Have you ever wished that maintaining a healthy lifestyle was easier? Sometimes, you just don't have the time, the energy, or the knowledge to make meals that fit your budget and your health goals. Thinking of what to make next each and every day is tiring -- so don't. NutriLife takes in your basic health data and preferences and outputs what you should make next. </p>
      <p>NutriLife works by analyzing your health data, preferences, and goals to provide personalized meal recommendations. It considers factors like your dietary restrictions, calorie preferences, and budget to suggest meals that are both healthy and enjoyable. Save the time that you would otherwise spend worrying about what to eat next and live your life!</p>
      <h2>Getting started</h2>
      <p>Get started by creating a profile and entering basic things about your data and preferences. Once your profile is set up, NutriLife will provide personalized meal recommendations tailored to your goals on the <a href="/">dashboard</a>.</p>
      <p>For more advanced usage, log your meals or exercise in the <a href="/log">log</a> section. NutriLife will also take this data into account when making recommendations.</p>
      <p>Not quite satisfied with your recommendation? Use the <a href="/search">search</a> tool to explore other meal options that fit your parameters!</p>

    </>
  );
}

export default About;
