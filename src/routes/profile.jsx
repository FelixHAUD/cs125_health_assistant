function Profile() {

  // get vitals from simulated data. placeholders below:
  let heartrate = 72;
  let bp = [120, 80];

  return (
    <main>
      <h1>Profile</h1>
      <h2>User Information</h2>
      <h2>Vitals</h2> {/* from "apple health" */}
      <p>Heartate: {heartrate} bpm</p>
      <p>Blood Pressure: {bp[0]}/{bp[1]}</p>
    </main>
  )
}

export default Profile