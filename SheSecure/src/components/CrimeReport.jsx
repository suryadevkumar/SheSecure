import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import CrimeReportStatus from "./CrimeReportStatus";
import CrimeReportForm from "./CrimeReportForm";
import { FiPlusCircle, FiArrowLeft } from "react-icons/fi";
import { fetchReports } from "../routes/crime-report-routes";

const CrimeReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const userType = useSelector((state) => state.auth.user.userType);

  useEffect(() => {
    const getReports = async () => {
      setLoading(true);
      setError(null);

      const result = await fetchReports(token, userType);

      if (result.success) {
        setReports(result.data);
      } else {
        setError(result.error);
      }

      setLoading(false);
    };

    if (token) {
      getReports();
    }
  }, [token, showForm]);

  const handleNewReportClick = () => {
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
  };

  const handleReportVerified = (reportId) => {
    setReports(
      reports.map((report) =>
        report._id === reportId ? { ...report, status: "Verified" } : report
      )
    );
  };

  const handleReportRemoved = (reportId) => {
    setReports(reports.filter((report) => report._id !== reportId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (showForm && userType === "User") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={handleBackToList}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-bold cursor-pointer"
        >
          <FiArrowLeft className="mr-2" />
          Back to Reports
        </button>
        <CrimeReportForm onSuccess={handleBackToList} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {reports.length > 0 ? (
        <>
          {userType === "User" ? (
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Your Crime Reports
              </h1>
              <button
                onClick={handleNewReportClick}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <FiPlusCircle className="mr-2" />
                Create New Report
              </button>
            </div>
          ) : null}
          <CrimeReportStatus
            reports={reports}
            onReportVerified={handleReportVerified}
            onReportRemoved={handleReportRemoved}
          />
        </>
      ) : (
        <div className="my-31 text-center py-16 bg-white rounded-xl shadow-md">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <FiPlusCircle className="w-full h-full" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No crime reports submitted yet
          </h3>
          {userType == "User" && (
            <div>
              <p className="mt-1 text-gray-500 mb-6">
                Be the first to report a crime in your area
              </p>
              <button
                onClick={handleNewReportClick}
                className="flex items-center mx-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors cursor-pointer"
              >
                <FiPlusCircle className="mr-2" />
                Report a Crime
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CrimeReport;
