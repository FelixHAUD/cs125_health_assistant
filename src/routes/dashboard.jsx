function Dashboard() {
  const today = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome, [name]</p>
      <p>It is {time} on {today}.</p>
      <p>Your recommended meal is [meal], to be had for breakfast tomorrow morning.</p>
    </main>
  )
}

export default Dashboard