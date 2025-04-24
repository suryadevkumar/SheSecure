import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUser,
  FiFileText,
  FiAlertCircle,
  FiShield,
  FiImage,
  FiVideo,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiX,
} from "react-icons/fi";
import {
  crimeReportRemove,
  crimeReportVerify,
} from "../routes/crime-report-routes";

const CrimeReportStatus = ({ reports, onReportVerified, onReportRemoved }) => {
  const [expandedReport, setExpandedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const userType = useSelector((state) => state.auth.user.userType);
  const token = useSelector((state) => state.auth.token);

  // Verify crime report
  const verifyCrimeReport = async (reportId) => {
    setIsProcessing(true);
    try {
      const response = await crimeReportVerify(token, reportId);
      if (response.success) {
        toast.success(response.message);
        onReportVerified(reportId); // Update parent state
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to verify report");
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove crime report
  const removeCrimeReport = async (reportId) => {
    setIsProcessing(true);
    try {
      const response = await crimeReportRemove(token, reportId);
      if (response.success) {
        toast.success(response.message);
        onReportRemoved(reportId);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to delete report");
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  // Filter reports based on search term
  const filteredReports = reports.filter(
    (report) =>
      report.typeOfCrime.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleReport = (reportId) => {
    setExpandedReport(expandedReport === reportId ? null : reportId);
  };

  const openImage = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={closeImage}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300 focus:outline-none"
              onClick={closeImage}
            >
              <FiX className="h-6 w-6" />
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-full object-contain max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-xl shadow-2xl flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all duration-300 animate-in fade-in-50 zoom-in-95">
            <div className="flex flex-col items-center">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <FiAlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Delete Crime Report
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this crime report? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 flex justify-center space-x-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 cursor-pointer"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 cursor-pointer"
                onClick={() => removeCrimeReport(reportToDelete)}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {userType === "User" ? (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
              Your Submitted Crime Reports
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Track the status of all your submitted reports
            </p>
          </div>
        ) : (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
              All Crime Reports
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Manage and verify crime reports
            </p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <FiFileText className="w-full h-full" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchTerm
                ? "No matching reports found"
                : "No reports submitted yet"}
            </h3>
            <p className="mt-1 text-gray-500">
              {searchTerm
                ? "Try a different search term"
                : "Submit your first crime report to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report._id}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
                  expandedReport === report._id
                    ? "ring-2 ring-blue-500"
                    : "hover:shadow-lg"
                }`}
              >
                {/* Report Summary Card */}
                <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-lg ${
                          report.status === "Verified"
                            ? "bg-green-100 text-green-800"
                            : report.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {report.status === "Verified" ? (
                          <FiShield className="h-6 w-6" />
                        ) : (
                          <FiAlertCircle className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {report.typeOfCrime}
                        </h3>
                        <p className="text-gray-500 line-clamp-1">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Reported on</p>
                      <p className="font-medium text-gray-900">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          report.status === "Verified"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    {userType === "Admin" &&
                      report.status === "In Progress" && (
                        <div className="flex items-center">
                          <button
                            className={`bg-green-500 px-3 py-1 rounded-full hover:bg-green-400 text-white font-semibold text-sm ${
                              isProcessing
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                            onClick={() => verifyCrimeReport(report._id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Processing..." : "Verify"}
                          </button>
                          <button
                            className={`bg-red-500 px-3 py-1 ml-6 rounded-full hover:bg-red-400 text-white font-semibold text-sm ${
                              isProcessing
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                            onClick={() => {
                              setReportToDelete(report._id);
                              setShowDeleteConfirm(true);
                            }}
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Processing..." : "Delete"}
                          </button>
                        </div>
                      )}
                    <div
                      className="text-blue-600 cursor-pointer"
                      onClick={() => toggleReport(report._id)}
                    >
                      {expandedReport === report._id ? (
                        <FiChevronUp className="h-5 w-5" />
                      ) : (
                        <FiChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Report Details */}
                {expandedReport === report._id && (
                  <div className="px-6 pb-6 pt-0 border-t border-gray-200 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Left Column - Report Details */}
                      <div className="md:col-span-2 space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                            <FiFileText className="text-blue-500 mr-2" />
                            Report Details
                          </h4>
                          <p className="text-gray-700">{report.description}</p>
                        </div>

                        {/* FIR Document */}
                        {report.FIR && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                              <FiFileText className="text-purple-500 mr-2" />
                              FIR Document
                            </h4>
                            <div className="border rounded-lg overflow-hidden shadow-sm">
                              <img
                                src={report.FIR}
                                alt="FIR Document"
                                className="w-full h-auto object-contain max-h-96 cursor-pointer"
                                onClick={() => openImage(report.FIR)}
                              />
                            </div>
                          </div>
                        )}

                        {/* Location Details */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                            <FiMapPin className="text-red-500 mr-2" />
                            Location Details
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Address
                              </p>
                              <p className="text-gray-900">
                                {report.location?.formattedAddress}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Display Name
                              </p>
                              <p className="text-gray-900">
                                {report.location?.displayName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Coordinates
                              </p>
                              <p className="text-gray-900">
                                {report.location?.latitude},{" "}
                                {report.location?.longitude}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Time Range
                              </p>
                              <div className="flex items-center space-x-2">
                                <FiClock className="text-gray-400" />
                                <span className="text-gray-900">
                                  {new Date(
                                    report.location?.startTime
                                  ).toLocaleTimeString()}{" "}
                                  -{" "}
                                  {new Date(
                                    report.location?.endTime
                                  ).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FiCalendar className="text-gray-400" />
                                <span className="text-gray-900">
                                  {new Date(
                                    report.location?.startTime
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Media Attachments */}
                        {(report.crimePhotos?.length > 0 ||
                          report.crimeVideos?.length > 0) && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                              <FiImage className="text-purple-500 mr-2" />
                              Media Evidence
                            </h4>
                            <div className="space-y-4">
                              {report.crimePhotos?.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                    <FiImage className="mr-1" /> Photos (
                                    {report.crimePhotos.length})
                                  </p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {report.crimePhotos.map((photo, index) => (
                                      <div
                                        key={index}
                                        className="group overflow-hidden rounded-lg border shadow-sm relative cursor-pointer"
                                        onClick={() => openImage(photo)}
                                      >
                                        <img
                                          src={photo}
                                          alt={`Crime scene ${index + 1}`}
                                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                              "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20150%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18d5a1e0a5e%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18d5a1e0a5e%22%3E%3Crect%20width%3D%22200%22%20height%3D%22150%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2274.0859375%22%20y%3D%2280.7%22%3EImage%20not%20found%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E";
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {report.crimeVideos?.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                    <FiVideo className="mr-1" /> Videos (
                                    {report.crimeVideos.length})
                                  </p>
                                  <div className="grid grid-cols-1 gap-4">
                                    {report.crimeVideos.map((video, index) => (
                                      <div
                                        key={index}
                                        className="overflow-hidden rounded-lg bg-black shadow-lg"
                                      >
                                        <video controls className="w-full">
                                          <source
                                            src={video}
                                            type="video/mp4"
                                          />
                                          Your browser does not support the
                                          video tag.
                                        </video>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column - People and Admin */}
                      <div className="space-y-6">
                        {/* Assigned Admin */}
                        {report.assignedAdmin && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                              <FiShield className="text-blue-500 mr-2" />
                              Assigned Officer
                            </h4>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                  <FiUser className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                  <p className="font-medium text-blue-800">
                                    {report.assignedAdmin.firstName}{" "}
                                    {report.assignedAdmin.lastName}
                                  </p>
                                  <p className="text-sm text-blue-600">
                                    {report.assignedAdmin.email}
                                  </p>
                                  <p className="text-xs text-blue-400 mt-1">
                                    Officer ID: {report.assignedAdmin._id}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Suspects */}
                        {report.suspects?.length > 0 && (
                          <div className="bg-red-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                              <FiUser className="text-red-500 mr-2" />
                              Suspects ({report.suspects.length})
                            </h4>
                            <div className="space-y-3">
                              {report.suspects.map((suspect, index) => (
                                <div
                                  key={index}
                                  className="bg-white p-4 rounded-lg shadow-sm"
                                >
                                  <div className="flex items-start space-x-3">
                                    {suspect.suspectPhoto ? (
                                      <img
                                        src={suspect.suspectPhoto}
                                        alt={`Suspect ${index + 1}`}
                                        className="h-12 w-12 rounded-full object-cover border border-red-200"
                                        onClick={() =>
                                          openImage(suspect.suspectPhoto)
                                        }
                                        style={{ cursor: "pointer" }}
                                      />
                                    ) : (
                                      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
                                        <FiUser className="h-6 w-6 text-red-500" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <p className="font-medium text-red-800">
                                        {suspect.suspectName || "Unknown"}
                                      </p>
                                      <div className="grid grid-cols-2 gap-2 mt-1">
                                        <p className="text-xs text-red-600 capitalize">
                                          <span className="font-medium">
                                            Gender:
                                          </span>{" "}
                                          {suspect.suspectGender || "Unknown"}
                                        </p>
                                        {suspect.suspectDescription && (
                                          <p className="col-span-2 text-xs text-red-600">
                                            <span className="font-medium">
                                              Description:
                                            </span>{" "}
                                            {suspect.suspectDescription}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Witnesses */}
                        {report.witnesses?.length > 0 && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                              <FiUser className="text-green-500 mr-2" />
                              Witnesses ({report.witnesses.length})
                            </h4>
                            <div className="space-y-3">
                              {report.witnesses.map((witness, index) => (
                                <div
                                  key={index}
                                  className="bg-white p-4 rounded-lg shadow-sm"
                                >
                                  <div className="flex items-start space-x-3">
                                    {witness.witnessPhoto ? (
                                      <img
                                        src={witness.witnessPhoto}
                                        alt={`Witness ${index + 1}`}
                                        className="h-12 w-12 rounded-full object-cover border border-green-200"
                                        onClick={() =>
                                          openImage(witness.witnessPhoto)
                                        }
                                        style={{ cursor: "pointer" }}
                                      />
                                    ) : (
                                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center border border-green-200">
                                        <FiUser className="h-6 w-6 text-green-500" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <p className="font-medium text-green-800">
                                        {witness.witnessName || "Unknown"}
                                      </p>
                                      <div className="grid grid-cols-2 gap-2 mt-1">
                                        <p className="text-xs text-green-600 capitalize">
                                          <span className="font-medium">
                                            Gender:
                                          </span>{" "}
                                          {witness.witnessGender || "Unknown"}
                                        </p>
                                        {witness.witnessContactNumber && (
                                          <p className="col-span-2 text-xs text-green-600">
                                            <span className="font-medium">
                                              Contact:
                                            </span>{" "}
                                            {witness.witnessContactNumber}
                                          </p>
                                        )}
                                        {witness.witnessAddress && (
                                          <p className="col-span-2 text-xs text-green-600 truncate">
                                            <span className="font-medium">
                                              Address:
                                            </span>{" "}
                                            {witness.witnessAddress}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Report Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <FiAlertCircle className="mr-1" />
                        <span>
                          Reported on{" "}
                          {new Date(report.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {userType=='Admin' && report.status=='Verified'?(<div>
                        <button
                          className={`bg-red-500 px-4 py-1 ml-6 rounded-lg hover:bg-red-400 text-white font-semibold text-sm ${
                            isProcessing
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                          onClick={() => {
                            setReportToDelete(report._id);
                            setShowDeleteConfirm(true);
                          }}
                          disabled={isProcessing}
                        >
                          {isProcessing ? "Processing..." : "Delete"}
                        </button>
                      </div>):null}
                      <div className="flex items-center">
                        <FiRefreshCw className="mr-1" />
                        <span>
                          Last updated{" "}
                          {new Date(report.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add some global styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CrimeReportStatus;