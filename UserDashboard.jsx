import { useState } from "react";
import axios from "axios";

export default function UserDashboard() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await axios.get("http://localhost:5000/api/resume/my", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setResumes(res.data);
      } catch (err) {
        // Ignore error for now
      }
    }
    fetchResumes();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setAnalysis(null);
    setRecommendations([]);
    if (!file) {
      setError("Please select a file.");
      return;
    }
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const res = await axios.post("http://localhost:5000/api/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setResult(res.data);
      // Refresh resume list
      const allResumes = await axios.get("http://localhost:5000/api/resume/my", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setResumes(allResumes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    }
  };

  const handleAnalyze = async (raw_text) => {
    setAnalysis(null);
    if (!raw_text) return;
    try {
      const res = await axios.post("http://localhost:5000/api/resume/analyze", { text: raw_text }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setAnalysis(res.data.analysis);
    } catch (err) {
      setAnalysis("Analysis failed.");
    }
  };

  const handleRecommend = async () => {
    setRecommendations([]);
    if (!result?.skills) return;
    try {
      const res = await axios.post("http://localhost:5000/api/recommender/recommend", {
        skills: result.skills
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRecommendations(res.data);
    } catch (err) {
      setRecommendations([]);
    }
  };

  return (
    <div>
      <h2>User Dashboard</h2>
      <form onSubmit={handleUpload}>
        <input type="file" accept=".pdf,.docx" onChange={e => setFile(e.target.files[0])} />
        <button type="submit">Upload Resume</button>
      </form>
      {error && <div style={{color: "red"}}>{error}</div>}

      {result && (
        <div style={{marginTop: 20}}>
          <h3>Latest Uploaded Resume (Parsed):</h3>
          <ul>
            <li><strong>Name:</strong> {result.name || "-"}</li>
            <li><strong>Email:</strong> {result.email || "-"}</li>
            <li><strong>Phone:</strong> {result.phone || "-"}</li>
            <li><strong>Education:</strong>
              <ul>{result.education && result.education.length ? result.education.map((e, i) => <li key={i}>{e}</li>) : <li>-</li>}</ul>
            </li>
            <li><strong>Experience:</strong>
              <ul>{result.experience && result.experience.length ? result.experience.map((e, i) => <li key={i}>{e}</li>) : <li>-</li>}</ul>
            </li>
            <li><strong>Skills:</strong>
              <ul>{result.skills && result.skills.length ? result.skills.map((s, i) => <li key={i}>{s}</li>) : <li>-</li>}</ul>
            </li>
            <li><strong>Certifications:</strong>
              <ul>{result.certifications && result.certifications.length ? result.certifications.map((c, i) => <li key={i}>{c}</li>) : <li>-</li>}</ul>
            </li>
          </ul>
          <button onClick={() => handleAnalyze(result.raw_text)} style={{marginTop: 10}}>Analyze Resume (AI)</button>
          <button onClick={handleRecommend} style={{marginTop: 10, marginLeft: 10}}>Get Job Recommendations</button>
          {analysis && (
            <div style={{marginTop: 20}}>
              <h3>AI Analysis:</h3>
              <pre>{analysis}</pre>
            </div>
          )}
          {recommendations.length > 0 && (
            <div style={{marginTop: 20}}>
              <h3>Recommended Jobs:</h3>
              <ul>
                {recommendations.map((job, i) => (
                  <li key={i}>
                    <strong>{job.title}</strong> (Skill match: {job.matchCount})
                    <ul>
                      {job.skills.map((s, j) => <li key={j}>{s}</li>)}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{marginTop: 40}}>
        <h3>All Uploaded Resumes</h3>
        {resumes.length === 0 && <div>No resumes uploaded yet.</div>}
        {resumes.map((resume, idx) => (
          <div key={resume._id || idx} style={{border: "1px solid #ccc", margin: "10px 0", padding: 10}}>
            <strong>Name:</strong> {resume.name || "-"}<br/>
            <strong>Email:</strong> {resume.email || "-"}<br/>
            <strong>Phone:</strong> {resume.phone || "-"}<br/>
            <strong>Uploaded:</strong> {resume.createdAt ? new Date(resume.createdAt).toLocaleString() : "-"}
            <details>
              <summary>Show Details</summary>
              <div>
                <strong>Education:</strong>
                <ul>{resume.education && resume.education.length ? resume.education.map((e, i) => <li key={i}>{e}</li>) : <li>-</li>}</ul>
                <strong>Experience:</strong>
                <ul>{resume.experience && resume.experience.length ? resume.experience.map((e, i) => <li key={i}>{e}</li>) : <li>-</li>}</ul>
                <strong>Skills:</strong>
                <ul>{resume.skills && resume.skills.length ? resume.skills.map((s, i) => <li key={i}>{s}</li>) : <li>-</li>}</ul>
                <strong>Certifications:</strong>
                <ul>{resume.certifications && resume.certifications.length ? resume.certifications.map((c, i) => <li key={i}>{c}</li>) : <li>-</li>}</ul>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
} 