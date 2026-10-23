import { useState } from "react";
import "./App.css";

function App() {
  const [resume, setResume] = useState(null);
  const [job, setJob] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!resume || !job.trim()) {
      setMessage("Please upload a resume and enter a job description.");
      return;
    }

    if (!resume.name.toLowerCase().endsWith(".pdf")) {
      setMessage("Please upload a PDF resume for now.");
      return;
    }

    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("job_description", job);

      const response = await fetch(
        "http://127.0.0.1:8000/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data);
      setMessage("Resume analysis completed successfully!");
    } catch (error) {
      setMessage(
        "Could not connect to the backend. Check that Python backend is running. " +
          error.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h2>HireAI</h2>
        <span>AI Recruitment Platform</span>
      </nav>

      <main className="container">
        <div className="hero">
          <span className="tag">AI-POWERED RECRUITMENT</span>
          <h1>Find the right talent, faster.</h1>
          <p>
            Analyze resumes, match job descriptions, and
            simplify your recruitment process with AI.
          </p>
        </div>

        <section className="panel">
          <h2>Resume Analyzer</h2>
          <p>Upload a resume and add the job description.</p>

          <label htmlFor="resume">Upload Resume (PDF)</label>
          <input
            id="resume"
            type="file"
            accept=".pdf"
            onChange={(e) => {
              setResume(e.target.files[0] || null);
              setMessage("");
              setResult(null);
            }}
          />

          {resume && (
            <p className="selected">Selected: {resume.name}</p>
          )}

          <label htmlFor="job">Job Description</label>
          <textarea
            id="job"
            rows="6"
            placeholder="Paste the job description here..."
            value={job}
            onChange={(e) => {
              setJob(e.target.value);
              setResult(null);
            }}
          />

          <button onClick={handleAnalyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>

          {message && <p className="message">{message}</p>}

          {result && (
            <div className="analysis-result">
              <h2>Analysis Results</h2>
              <h3>Resume Match Score: {result.match_score}%</h3>

              <p>
                <strong>Resume:</strong> {result.filename}
              </p>

              <h3>Matched Keywords</h3>
              {result.matched_keywords.length > 0 ? (
                <p>{result.matched_keywords.join(", ")}</p>
              ) : (
                <p>No matching keywords found.</p>
              )}

              <h3>Resume Text Preview</h3>
              <p>
                {result.resume_text_preview ||
                  "No readable text found in the PDF."}
              </p>
            </div>
          )}
        </section>

        <section className="features">
          <article>
            <h3>ATS Score</h3>
            <p>Evaluate how well a resume matches a job.</p>
          </article>
          <article>
            <h3>Skill Matching</h3>
            <p>Identify relevant skills and skill gaps.</p>
          </article>
          <article>
            <h3>Smart Hiring</h3>
            <p>Help recruiters review candidate profiles.</p>
          </article>
        </section>
      </main>

      <footer>HireAI | B.Tech Final Year Project</footer>
    </div>
  );
}

export default App;