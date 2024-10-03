document.addEventListener("DOMContentLoaded", () => {
    const loadDataButton = document.getElementById("loadData");
    let topRoutes = []; // Change topRoutes to a flat array for better data handling
    let allStations = {};

    loadDataButton.addEventListener("click", async () => {
        try {
            let response = await fetch("rides.json");
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
            }

            let data = await response.json();
            topRoutes = [];  // Reset to an empty array
            allStations = {};

            // Process and organize the data
            console.log("Raw data:", data);  // Debugging statement

            data.forEach((ride) => {
                const startStation = ride.start_station_name;
                const endStation = ride.end_station_name;

                // Skip rides that have missing station names
                if (!startStation || !endStation) return;

                // Store unique stations
                if (!allStations[startStation]) {
                    allStations[startStation] = "start";
                }
                if (!allStations[endStation]) {
                    allStations[endStation] = "end";
                }

                // Push each ride directly into topRoutes array
                topRoutes.push({ startStation, endStation, duration: ride.duration });
            });

            console.log("Processed topRoutes:", topRoutes);  // Debugging statement

            // Display checkboxes for Start and End stations
            createCheckboxes();

            // Display full dataset in the table initially
            displayRoutes(topRoutes);

        } catch (error) {
            console.error("Error loading data: ", error);
        }
    });

    function createCheckboxes() {
        const startStationFilter = document.getElementById("startStationFilter");
        const endStationFilter = document.getElementById("endStationFilter");

        // Sort station names alphabetically
        const sortedStations = Object.keys(allStations).sort();

        console.log("Stations for filters:", sortedStations);  // Debugging statement

        // Create checkboxes for each unique station in sorted order
        sortedStations.forEach((station) => {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `station-${station}`;
            checkbox.value = station;

            // Label for the checkbox
            let label = document.createElement("label");
            label.htmlFor = `station-${station}`;
            label.textContent = station;

            // Append to the correct filter (start or end)
            if (allStations[station] === "start") {
                checkbox.className = "start-checkbox";
                startStationFilter.appendChild(checkbox);
                startStationFilter.appendChild(label);
                startStationFilter.appendChild(document.createElement("br"));
            } else {
                checkbox.className = "end-checkbox";
                endStationFilter.appendChild(checkbox);
                endStationFilter.appendChild(label);
                endStationFilter.appendChild(document.createElement("br"));
            }
        });

        // Add event listeners for dynamic filtering
        const startCheckboxes = document.querySelectorAll(".start-checkbox");
        const endCheckboxes = document.querySelectorAll(".end-checkbox");

        startCheckboxes.forEach((checkbox) =>
            checkbox.addEventListener("change", () => filterRoutes())
        );
        endCheckboxes.forEach((checkbox) =>
            checkbox.addEventListener("change", () => filterRoutes())
        );
    }

    // Function to filter routes based on selected start and end stations
    function filterRoutes() {
        const selectedStartStations = Array.from(
            document.querySelectorAll(".start-checkbox:checked")
        ).map((checkbox) => checkbox.value);

        const selectedEndStations = Array.from(
            document.querySelectorAll(".end-checkbox:checked")
        ).map((checkbox) => checkbox.value);

        const filteredRoutes = topRoutes.filter(
            (ride) =>
                (selectedStartStations.length === 0 || selectedStartStations.includes(ride.startStation)) &&
                (selectedEndStations.length === 0 || selectedEndStations.includes(ride.endStation))
        );

        console.log("Filtered routes:", filteredRoutes);  // Debugging statement
        displayRoutes(filteredRoutes);
    }

    // Function to display the routes in the table
    function displayRoutes(routes) {
        let tableBody = document.querySelector("#dataTable tbody");
        tableBody.innerHTML = "";

        console.log("Displaying routes:", routes);  // Debugging statement

        if (routes.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='4'>No rides available</td></tr>";
            return;
        }

        routes.forEach((ride, index) => {
            let row = document.createElement("tr");
            row.className = index === 0 ? "highlight" : "";
            row.innerHTML = `
                <td>${ride.startStation}</td>
                <td>${ride.endStation}</td>
                <td>${ride.duration}</td>
                <td>${index === 0 ? '🥇 1st Place' : index === 1 ? '🥈 2nd Place' : '🥉 3rd Place'}</td>
            `;
            tableBody.appendChild(row);
        });
    }
});
