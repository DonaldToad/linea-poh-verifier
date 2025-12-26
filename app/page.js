export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Linea PoH Verifier</h1>
      <p>API is available at <code>/api/check-poh?wallet=0x...</code></p>
      <p>
        Example:{" "}
        <code>/api/check-poh?wallet=0x0000000000000000000000000000000000000000</code>
      </p>
    </main>
  );
}
