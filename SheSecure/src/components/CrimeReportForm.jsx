import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import {
  FiAlertTriangle,
  FiMapPin,
  FiUser,
  FiUserCheck,
  FiUpload,
  FiCamera,
  FiVideo,
  FiFile,
} from "react-icons/fi";
import { Loader } from "@googlemaps/js-api-loader";
import { googleMapAPI } from "../config/config";
import { submitCrimeReport } from "../routes/crime-report-routes";
import { toast } from "react-toastify";

const CrimeReportForm = () => {
  const [suspects, setSuspects] = useState([]);
  const [witnesses, setWitnesses] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [firFile, setFirFile] = useState(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionToken, setSessionToken] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const token = useSelector((state) => state.auth.token);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();
  const mapRef = useRef(null);
  const autocompleteInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const loader = new Loader({
    apiKey: googleMapAPI,
    version: "weekly",
    libraries: ["places", "maps", "marker"],
  });

  const crimeTypes = [
    "Assault",
    "Homicide",
    "Kidnapping",
    "Domestic Violence",
    "Robbery",
    "Burglary",
    "Theft",
    "Vandalism",
    "Arson",
    "Hacking",
    "Online Fraud",
    "Cyberbullying",
    "Identity Theft",
    "Fraud",
    "Money Laundering",
    "Bribery",
    "Counterfeiting",
    "Drug Trafficking",
    "Illegal Possession of Drugs",
    "Public Intoxication",
    "Sexual Harassment",
    "Rape",
    "Human Trafficking",
    "Child Exploitation",
    "Harassment",
    "Stalking",
    "Trespassing",
    "Extortion",
    "Other",
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        autocompleteInputRef.current &&
        !autocompleteInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const initMapAndPlaces = async () => {
      try {
        const [places, maps, markerLib] = await Promise.all([
          loader.importLibrary("places"),
          loader.importLibrary("maps"),
          loader.importLibrary("marker"),
        ]);

        const { Map } = maps;
        const { AdvancedMarkerElement } = markerLib;

        const token1 = new window.google.maps.places.AutocompleteSessionToken();
        setSessionToken(token1);

        window.geocoder = new window.google.maps.Geocoder();

        setIsMapLoading(false);

        if (showMap && !map && mapRef.current) {
          const mapInstance = new Map(mapRef.current, {
            center: { lat: 20.5937, lng: 78.9629 },
            zoom: 5,
            mapTypeControl: false,
            streetViewControl: false,
            mapId: "crime-report-map",
          });

          const markerInstance = new AdvancedMarkerElement({
            map: mapInstance,
            position: { lat: 20.5937, lng: 78.9629 },
            gmpDraggable: true,
          });

          mapInstance.addListener("click", (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            updateMarkerPosition(markerInstance, lat, lng);
            reverseGeocode(lat, lng);
          });

          markerInstance.addListener("dragend", () => {
            const position = markerInstance.position;
            const lat = position.lat;
            const lng = position.lng;
            reverseGeocode(lat, lng);
          });

          setMap(mapInstance);
          setMarker(markerInstance);

          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                mapInstance.setCenter({ lat, lng });
                mapInstance.setZoom(15);
                updateMarkerPosition(markerInstance, lat, lng);
                reverseGeocode(lat, lng);
              },
              (error) => {
                console.log("Geolocation error:", error);
              }
            );
          }
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setIsMapLoading(false);
      }
    };

    initMapAndPlaces();
  }, [showMap]);

  const handleLocationInputChange = async (e) => {
    const value = e.target.value;
    setLocationQuery(value);

    if (
      value.length > 2 &&
      window.google &&
      window.google.maps &&
      window.google.maps.places
    ) {
      try {
        const request = {
          input: value,
          sessionToken: sessionToken,
          locationRestriction: {
            east: 97.4025614766,
            north: 35.6745457,
            south: 6.7559528,
            west: 68.1097,
          },
          origin: map?.getCenter() || { lat: 20.5937, lng: 78.9629 },
        };

        const { suggestions: placeSuggestions } =
          await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
            request
          );

        if (placeSuggestions && placeSuggestions.length > 0) {
          setSuggestions(placeSuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Error fetching place suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = async (suggestion) => {
    try {
      const place = await suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ["displayName", "formattedAddress", "location"],
      });

      setLocationQuery(place.formattedAddress || place.displayName);
      setShowSuggestions(false);

      const getLatLng = () => {
        if (!place.location) return null;

        if (
          typeof place.location.lat === "function" &&
          typeof place.location.lng === "function"
        ) {
          return {
            lat: place.location.lat(),
            lng: place.location.lng(),
          };
        }

        if (
          typeof place.location.lat === "number" &&
          typeof place.location.lng === "number"
        ) {
          return {
            lat: place.location.lat,
            lng: place.location.lng,
          };
        }

        return null;
      };

      const latLng = getLatLng();

      if (latLng) {
        setValue("location.coordinates", [latLng.lat, latLng.lng]);
        setValue(
          "location.address",
          place.formattedAddress || place.displayName
        );
        setSelectedPlace(place);

        if (map && marker) {
          map.setCenter(latLng);
          map.setZoom(15);
          marker.position = latLng;
        }
      } else {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          {
            address: place.formattedAddress || place.displayName,
          },
          (results, status) => {
            if (
              status === "OK" &&
              results[0] &&
              results[0].geometry &&
              results[0].geometry.location
            ) {
              const lat = results[0].geometry.location.lat();
              const lng = results[0].geometry.location.lng();

              setValue("location.coordinates", [lat, lng]);
              setValue(
                "location.address",
                place.formattedAddress || place.displayName
              );

              if (map && marker) {
                map.setCenter({ lat, lng });
                map.setZoom(15);
                marker.position = { lat, lng };
              }
            }
          }
        );
      }

      const newToken = new window.google.maps.places.AutocompleteSessionToken();
      setSessionToken(newToken);
    } catch (error) {
      console.error("Error selecting place:", error);
      toast.error("Failed to select location. Please try again.");
    }
  };

  const updateMarkerPosition = (marker, lat, lng) => {
    marker.position = { lat, lng };
    setValue("location.coordinates", [lat, lng]);
  };

  const reverseGeocode = (lat, lng) => {
    window.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setLocationQuery(results[0].formatted_address);
        setValue("location.address", results[0].formatted_address);
      }
    });
  };

  const handleFileChange = (e, setFileState, multiple = false) => {
    if (e.target.files) {
      if (multiple) {
        const filesArray = Array.from(e.target.files);
        setFileState((prev) => [...prev, ...filesArray]);
      } else {
        setFileState(e.target.files[0]);
      }
    }
  };

  const handleRemoveFile = (index, fileState, setFileState) => {
    const newFiles = [...fileState];
    newFiles.splice(index, 1);
    setFileState(newFiles);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          if (map && marker) {
            map.setCenter({ lat, lng });
            map.setZoom(15);
            updateMarkerPosition(marker, lat, lng);
            reverseGeocode(lat, lng);
          }
        },
        (error) => {
          console.log("Geolocation error:", error);
          toast.error(
            "Could not get your current location. Please make sure location services are enabled."
          );
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const submitForm = async (data) => {
    setIsSubmitting(true);
    setError(null);
    setUploadProgress(10);

    try {
      // Validate location data
      if (!data.location?.coordinates) {
        throw new Error(
          "Please select a location on the map or from suggestions"
        );
      }

      const formData = new FormData();

      // Append basic form data
      Object.keys(data).forEach((key) => {
        if (key !== "location") {
          formData.append(key, data[key]);
        }
      });

      // Extract location components
      const [latitude, longitude] = data.location.coordinates;

      // Create complete location object
      const locationData = {
        coordinates: [longitude, latitude], // Note: longitude first
        address: data.location.address || locationQuery,
        displayName: data.location.address || locationQuery, // Added displayName
      };

      // Append location data
      formData.append("location", JSON.stringify(locationData));
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("formattedAddress", locationData.address);
      formData.append("displayName", locationData.displayName);

      // Append files
      if (firFile) formData.append("FIR", firFile);
      photoFiles.forEach((file) => formData.append("crimePhotos", file));
      videoFiles.forEach((file) => formData.append("crimeVideos", file));

      // Append suspects
      formData.append(
        "suspects",
        JSON.stringify(
          suspects.map((suspect) => ({
            name: suspect.suspectName,
            gender: suspect.suspectGender,
          }))
        )
      );

      suspects.forEach((suspect, index) => {
        if (suspect.suspectPhoto) {
          formData.append(`suspectPhotos[${index}]`, suspect.suspectPhoto);
        }
      });

      // Append witnesses
      formData.append(
        "witnesses",
        JSON.stringify(
          witnesses.map((witness) => ({
            name: witness.witnessName,
            gender: witness.witnessGender,
            contactNumber: witness.witnessContactNumber,
            address: witness.witnessAddress,
          }))
        )
      );

      witnesses.forEach((witness, index) => {
        if (witness.witnessPhoto) {
          formData.append(`witnessPhotos[${index}]`, witness.witnessPhoto);
        }
      });

      setUploadProgress(30);

      // Send to server
      const response = await submitCrimeReport(token, formData, (progress) => {
        setUploadProgress(30 + Math.round(progress * 0.6));
      });

      setUploadProgress(100);
      setSuccess(true);

      // Reset form
      reset();
      setPhotoFiles([]);
      setVideoFiles([]);
      setFirFile(null);
      setLocationQuery("");
      setSelectedPlace(null);
      setSuspects([]);
      setWitnesses([]);

      setTimeout(() => {
        setUploadProgress(0);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(error.message || "Failed to submit report");
      setIsSubmitting(false);
      setUploadProgress(0);
      toast.error(
        error.message ||
          "There was an error submitting your report. Please try again."
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-10 lg:mb-2">
      <h1 className="text-2xl font-bold text-center mb-2 text-rose-500">
        Report a Crime
      </h1>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className="flex items-center mb-6">
          <FiAlertTriangle className="text-rose-600 text-3xl mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">
            File a Crime Report
          </h2>
        </div>

        <p className="text-gray-600 mb-6">
          Your report can help keep others safe. Please provide accurate
          information to help authorities respond effectively. All reports are
          confidential.
        </p>

        {success && (
          <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-100">
            <p className="text-green-700 font-medium">
              Report submitted successfully! Thank you for your contribution to
              community safety.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-rose-50 p-4 rounded-lg border border-rose-100">
            <p className="text-rose-700 font-medium">{error}</p>
          </div>
        )}

        {isSubmitting && (
          <div className="fixed left-0 right-0 z-50">
            <div className="max-w-md mx-auto p-4 mt-4 shadow-2xl">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-rose-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1 text-center">
                {uploadProgress < 100
                  ? `Uploading report... ${uploadProgress}%`
                  : "Upload complete!"}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
          {/* Type of Crime */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type of Crime <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("typeOfCrime", {
                required: "Please select a crime type",
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 cursor-pointer"
              disabled={isSubmitting}
            >
              <option value="">Select a crime type</option>
              {crimeTypes.map((crime) => (
                <option key={crime} value={crime}>
                  {crime}
                </option>
              ))}
            </select>
            {errors.typeOfCrime && (
              <p className="mt-1 text-sm text-rose-600">
                {errors.typeOfCrime.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              {...register("description", {
                required: "Please provide a description",
                minLength: {
                  value: 20,
                  message: "Description should be at least 20 characters",
                },
              })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              placeholder="Provide detailed information about the incident..."
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-rose-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Date of Crime */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Crime <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              {...register("dateOfCrime", {
                required: "Please select the date of crime",
                validate: {
                  notFutureDate: (value) => {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return (
                      selectedDate <= today || "Date cannot be in the future"
                    );
                  },
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              max={new Date().toISOString().split("T")[0]}
              disabled={isSubmitting}
            />
            {errors.dateOfCrime && (
              <p className="mt-1 text-sm text-rose-600">
                {errors.dateOfCrime.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMapPin className="text-gray-400" />
              </div>
              <input
                ref={autocompleteInputRef}
                type="text"
                value={locationQuery}
                onChange={handleLocationInputChange}
                onFocus={() =>
                  locationQuery.length > 2 &&
                  suggestions.length > 0 &&
                  setShowSuggestions(true)
                }
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="Search for location or click on map"
                disabled={isSubmitting}
              />

              {/* Location suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <p className="text-sm">
                        {suggestion.placePrediction.text.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-sm text-rose-600 hover:text-rose-700 cursor-pointer"
                disabled={isSubmitting}
              >
                {showMap ? "Hide map" : "Show map to select location"}
              </button>
            </div>

            {showMap && (
              <div className="mt-4">
                {isMapLoading ? (
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p>Loading map...</p>
                  </div>
                ) : (
                  <>
                    <div
                      ref={mapRef}
                      className="h-64 w-full rounded-lg border border-gray-300"
                    />
                    <div className="mt-2 flex justify-between">
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                        disabled={isSubmitting}
                      >
                        Use Current Location
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMap(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm"
                        disabled={isSubmitting}
                      >
                        Done
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {errors.location && (
              <p className="mt-1 text-sm text-rose-600">
                Please select a location
              </p>
            )}
            <input
              type="hidden"
              {...register("location.coordinates", { required: true })}
            />
            <input
              type="hidden"
              {...register("location.address", { required: true })}
            />
          </div>

          {/* FIR Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              FIR Copy (Image) <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="firFile"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-rose-600 hover:text-rose-500 focus-within:outline-none"
                  >
                    <span className="flex items-center">
                      <FiFile className="mr-2" />
                      {firFile ? "Change FIR file" : "Upload FIR copy"}
                    </span>
                    <input
                      id="firFile"
                      name="FIR"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setFirFile)}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                {firFile && (
                  <div className="text-sm text-gray-900 mt-2 flex items-center justify-center gap-2">
                    <span>{firFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setFirFile(null)}
                      className="text-rose-600 hover:text-rose-800 cursor-pointer"
                      disabled={isSubmitting}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
            {errors.FIR && (
              <p className="mt-1 text-sm text-rose-600">
                Please upload FIR copy
              </p>
            )}
          </div>

          {/* Photo Evidence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo Evidence
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="crimePhotos"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-rose-600 hover:text-rose-500 focus-within:outline-none"
                  >
                    <span className="flex items-center">
                      <FiCamera className="mr-2" />
                      Upload photos
                    </span>
                    <input
                      id="crimePhotos"
                      name="crimePhotos"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setPhotoFiles, true)}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
                {photoFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {photoFiles.map((file, index) => (
                      <div
                        key={index}
                        className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
                      >
                        <span>
                          {file.name.length > 15
                            ? file.name.substring(0, 15) + "..."
                            : file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveFile(index, photoFiles, setPhotoFiles)
                          }
                          className="text-rose-600 hover:text-rose-800 cursor-pointer"
                          disabled={isSubmitting}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Evidence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video Evidence
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="crimeVideos"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-rose-600 hover:text-rose-500 focus-within:outline-none"
                  >
                    <span className="flex items-center">
                      <FiVideo className="mr-2" />
                      Upload videos
                    </span>
                    <input
                      id="crimeVideos"
                      name="crimeVideos"
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, setVideoFiles, true)}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">MP4, MOV up to 50MB</p>
                {videoFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {videoFiles.map((file, index) => (
                      <div
                        key={index}
                        className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
                      >
                        <span>
                          {file.name.length > 15
                            ? file.name.substring(0, 15) + "..."
                            : file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveFile(index, videoFiles, setVideoFiles)
                          }
                          className="text-rose-600 hover:text-rose-800 cursor-pointer"
                          disabled={isSubmitting}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Suspects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suspects
            </label>
            <div className="space-y-4">
              {suspects.map((suspect, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Suspect Name
                      </label>
                      <input
                        type="text"
                        value={suspect.suspectName || ""}
                        onChange={(e) => {
                          const newSuspects = [...suspects];
                          newSuspects[index] = {
                            ...newSuspects[index],
                            suspectName: e.target.value,
                          };
                          setSuspects(newSuspects);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Name"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={suspect.suspectGender || ""}
                        onChange={(e) => {
                          const newSuspects = [...suspects];
                          newSuspects[index] = {
                            ...newSuspects[index],
                            suspectGender: e.target.value,
                          };
                          setSuspects(newSuspects);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        disabled={isSubmitting}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suspect Photo
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label
                            htmlFor={`suspectPhoto-${index}`}
                            className="relative cursor-pointer bg-white rounded-md font-medium text-rose-600 hover:text-rose-500 focus-within:outline-none"
                          >
                            <span className="flex items-center">
                              <FiCamera className="mr-2" />
                              {suspect.suspectPhoto
                                ? "Change photo"
                                : "Upload photo"}
                            </span>
                            <input
                              id={`suspectPhoto-${index}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const newSuspects = [...suspects];
                                  newSuspects[index] = {
                                    ...newSuspects[index],
                                    suspectPhoto: e.target.files[0],
                                  };
                                  setSuspects(newSuspects);
                                }
                              }}
                              className="sr-only"
                              disabled={isSubmitting}
                            />
                          </label>
                        </div>
                        {suspect.suspectPhoto && (
                          <p className="text-xs text-gray-500">
                            {suspect.suspectPhoto.name || "Photo selected"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const newSuspects = [...suspects];
                        newSuspects.splice(index, 1);
                        setSuspects(newSuspects);
                      }}
                      className="text-sm text-rose-600 hover:text-rose-800"
                      disabled={isSubmitting}
                    >
                      Remove Suspect
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSuspects([...suspects, {}])}
                className="flex items-center text-sm text-rose-600 hover:text-rose-700"
                disabled={isSubmitting}
              >
                <FiUser className="mr-1" /> Add Suspect
              </button>
            </div>
          </div>

          {/* Witnesses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Witnesses
            </label>
            <div className="space-y-4">
              {witnesses.map((witness, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Witness Name
                      </label>
                      <input
                        type="text"
                        value={witness.witnessName || ""}
                        onChange={(e) => {
                          const newWitnesses = [...witnesses];
                          newWitnesses[index] = {
                            ...newWitnesses[index],
                            witnessName: e.target.value,
                          };
                          setWitnesses(newWitnesses);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Name"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        value={witness.witnessGender || ""}
                        onChange={(e) => {
                          const newWitnesses = [...witnesses];
                          newWitnesses[index] = {
                            ...newWitnesses[index],
                            witnessGender: e.target.value,
                          };
                          setWitnesses(newWitnesses);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        disabled={isSubmitting}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        value={witness.witnessContactNumber || ""}
                        onChange={(e) => {
                          const newWitnesses = [...witnesses];
                          newWitnesses[index] = {
                            ...newWitnesses[index],
                            witnessContactNumber: e.target.value,
                          };
                          setWitnesses(newWitnesses);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Phone number"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={witness.witnessAddress || ""}
                        onChange={(e) => {
                          const newWitnesses = [...witnesses];
                          newWitnesses[index] = {
                            ...newWitnesses[index],
                            witnessAddress: e.target.value,
                          };
                          setWitnesses(newWitnesses);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Address"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Witness Photo
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label
                            htmlFor={`witnessPhoto-${index}`}
                            className="relative cursor-pointer bg-white rounded-md font-medium text-rose-600 hover:text-rose-500 focus-within:outline-none"
                          >
                            <span className="flex items-center">
                              <FiCamera className="mr-2" />
                              {witness.witnessPhoto
                                ? "Change photo"
                                : "Upload photo"}
                            </span>
                            <input
                              id={`witnessPhoto-${index}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const newWitnesses = [...witnesses];
                                  newWitnesses[index] = {
                                    ...newWitnesses[index],
                                    witnessPhoto: e.target.files[0],
                                  };
                                  setWitnesses(newWitnesses);
                                }
                              }}
                              className="sr-only"
                              disabled={isSubmitting}
                            />
                          </label>
                        </div>
                        {witness.witnessPhoto && (
                          <p className="text-xs text-gray-500">
                            {witness.witnessPhoto.name || "Photo selected"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const newWitnesses = [...witnesses];
                        newWitnesses.splice(index, 1);
                        setWitnesses(newWitnesses);
                      }}
                      className="text-sm text-rose-600 hover:text-rose-800"
                      disabled={isSubmitting}
                    >
                      Remove Witness
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setWitnesses([...witnesses, {}])}
                className="flex items-center text-sm text-rose-600 hover:text-rose-700"
                disabled={isSubmitting}
              >
                <FiUserCheck className="mr-1" /> Add Witness
              </button>
            </div>
          </div>

          {/* Safety Tips */}
          <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
            <h3 className="font-medium text-rose-800 mb-2">Safety Tips</h3>
            <ul className="text-sm text-rose-700 list-disc pl-5 space-y-1">
              <li>
                If you're in immediate danger, call emergency services first
              </li>
              <li>
                Provide as much detail as possible without compromising your
                safety
              </li>
              <li>
                Your report will be shared with nearby users to alert them
              </li>
              <li>You can choose to report anonymously if needed</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrimeReportForm;
