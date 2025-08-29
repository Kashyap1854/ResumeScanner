import React, { useState, useRef } from "react";

function App() {
  const uploadRef = useRef(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);

  const scrollToUpload = () => {
    uploadRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
    setResults(null);
    setError("");
    setShowResults(false);
  };

  const handleSubmit = async () => {
    if (!resumeFile || !jobDesc.trim()) {
      setError("Please upload resume and enter job description.");
      return;
    }
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("job_description", jobDesc);

      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      setResults(data);
      setShowResults(true);
      setTimeout(() => {
        document
          .getElementById("results")
          .scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err) {
      setError(err.message || "Failed to analyze");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-700 via-blue-700 to-indigo-800 text-white flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-indigo-900 bg-opacity-90 backdrop-blur-sm shadow z-50 flex justify-between items-center px-8 py-4">
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          JobFit AI
        </h1>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-6 pt-24 pb-16 max-w-4xl mx-40">
        <h2 className="text-6xl font-extrabold mb-6">
          Upload Your Resume, Get Fast Insights
        </h2>
        <p className="text-xl max-w-lg mx-auto mb-16">
          JobFit AI screens resumes against job descriptions — find out if
          you&apos;re the perfect fit!
        </p>
        <button
          onClick={scrollToUpload}
          className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded font-semibold transition"
        >
          Upload Resume
        </button>

        {/* Upload Form */}
        <section
          ref={uploadRef}
          className="bg-white bg-opacity-10 rounded-xl shadow-lg p-8 w-full max-w-xl backdrop-blur-sm mt-64"
        >
          <label
            className="block text-lg font-semibold mb-2 text-white"
            htmlFor="resume"
          >
            Upload Resume (PDF)
          </label>
          <input
            type="file"
            id="resume"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full rounded p-2 mb-6"
          />

          <label
            className="block text-lg font-semibold mb-2 text-black"
            htmlFor="jobdesc"
          >
            Job Description
          </label>
          <textarea
            id="jobdesc"
            rows="5"
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            className="w-full rounded p-3 mb-8 resize-none text-black bg-white border border-blue-600"
            placeholder="Paste job description here..."
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded font-semibold disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Job Fit"}
          </button>

          {error && <p className="mt-4 text-red-800">{error}</p>}
        </section>

        {/* Results Section */}
        {showResults && results && (
          <section
            id="results"
            className="mt-12 w-full max-w-xl bg-white bg-opacity-20 rounded-xl p-6 backdrop-blur-sm shadow-lg text-white"
          >
            <h3 className="text-2xl font-bold mb-4">Results</h3>
            <p className="mb-3">
              <strong>Binary Classification:</strong>{" "}
              <span className="text-white font-bold">
                {results.binary_classification}
              </span>
            </p>
            <p className="mb-3 text-blue-900">
              <strong>Job Role:</strong> {results.job_role}
            </p>
            <p className="text-blue-900">
              <strong>Match Score:</strong> {results.match_score}%
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
