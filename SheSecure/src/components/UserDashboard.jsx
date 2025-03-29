const UserDashboard = () => {
    return (
        <div className="p-6 space-y-4">
            
            {/* Main Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SOS Activation Card */}
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-2">SOS System</h2>
                    <p className="mb-4">Click the button to activate the SOS alert system. The system will send your location to emergency contacts and authorities.</p>
                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                        Activate SOS
                    </button>
                </div>

                {/* Real-time Location Map */}
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-2">Real-Time Location Map</h2>
                    <div className="w-full h-64 bg-gray-200">
                        {/* Replace with your map component */}
                        <p className="text-center p-4">Map displaying real-time location goes here</p>
                    </div>
                </div>

                {/* Nearest Police Stations */}
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-2">Nearest Police Stations</h2>
                    <ul className="list-disc pl-6">
                        <li>Police Station 1 (1.2 km away)</li>
                        <li>Police Station 2 (3.5 km away)</li>
                        <li>Police Station 3 (5.1 km away)</li>
                    </ul>
                </div>

                {/* Nearest Hospitals */}
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-2">Nearest Hospitals</h2>
                    <ul className="list-disc pl-6">
                        <li>Hospital 1 (0.9 km away)</li>
                        <li>Hospital 2 (2.3 km away)</li>
                        <li>Hospital 3 (4.8 km away)</li>
                    </ul>
                </div>

                {/* Safe Routes */}
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-2">Safe Routes</h2>
                    <p>Showing the safest routes to travel based on traffic, lighting, and police patrols.</p>
                </div>

                {/* Danger Zone Highlights */}
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-2">Danger Zone Highlights</h2>
                    <p>Areas flagged as high-risk based on recent incidents or lack of security measures.</p>
                </div>

                {/* Location History */}
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-2">Location History</h2>
                    <p>Track your previous locations and time stamps for safety and monitoring.</p>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
