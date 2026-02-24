#include <iostream>
#include <cmath>    // For sin, cos, atan2, sqrt
#include <string>   // For std::string
#include <iomanip>  // For std::fixed, std::setprecision
#include <vector>   // For std::vector (though not strictly used, good for general test frameworks)

// Define Earth's radius in kilometers
const double EARTH_RADIUS_KM = 6371.0;
// Define PI for degree-to-radian conversion
const double PI = 3.14159265358979323846;

// Function to convert degrees to radians
double toRadians(double degree) {
    return degree * (PI / 180.0);
}

// Structure to hold city information
struct City {
    std::string name;
    double latitude;  // in degrees
    double longitude; // in degrees
};

// Function to calculate distance between two cities using Haversine formula
double calculateDistance(const City& city1, const City& city2) {
    // Convert latitudes and longitudes from degrees to radians
    double lat1_rad = toRadians(city1.latitude);
    double lon1_rad = toRadians(city1.longitude);
    double lat2_rad = toRadians(city2.latitude);
    double lon2_rad = toRadians(city2.longitude);

    // Differences in coordinates
    double dlat = lat2_rad - lat1_rad;
    double dlon = lon2_rad - lon1_rad;

    // Haversine formula
    double a = std::sin(dlat / 2) * std::sin(dlat / 2) +
               std::cos(lat1_rad) * std::cos(lat2_rad) *
               std::sin(dlon / 2) * std::sin(dlon / 2);
    double c = 2 * std::atan2(std::sqrt(a), std::sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
}

// --- Unit Tests ---
namespace { // Anonymous namespace for test helper functions
    int test_count = 0;
    int passed_count = 0;

    // Helper function for comparing floating-point numbers with a tolerance
    void assert_almost_equal(double actual, double expected, double tolerance, const std::string& test_name) {
        test_count++;
        if (std::abs(actual - expected) < tolerance) {
            std::cout << "[PASS] " << test_name << std::endl;
            passed_count++;
        } else {
            std::cout << "[FAIL] " << test_name
                      << " - Expected: " << std::fixed << std::setprecision(2) << expected
                      << ", Got: " << actual << std::endl;
        }
    }

    // Function to run all defined tests
    void run_all_tests() {
        std::cout << "\n--- Running Unit Tests ---\n";
        double tolerance = 0.01; // 10 meters tolerance for distance calculations

        // Test Case 1: Distance between the same city should be 0
        City london = {"London", 51.5074, -0.1278};
        double dist_london_london = calculateDistance(london, london);
        assert_almost_equal(dist_london_london, 0.0, tolerance, "Test 1: London to London distance");

        // Test Case 2: London to Paris (known value)
        City paris = {"Paris", 48.8566, 2.3522};
        double expected_london_paris = 343.50; // Value derived from running the original code
        double actual_london_paris = calculateDistance(london, paris);
        assert_almost_equal(actual_london_paris, expected_london_paris, tolerance, "Test 2: London to Paris distance");

        // Test Case 3: New York to Los Angeles (known value)
        City newYork = {"New York", 40.7128, -74.0060};
        City losAngeles = {"Los Angeles", 34.0522, -118.2437};
        double expected_ny_la = 3935.74; // Value derived from running the original code
        double actual_ny_la = calculateDistance(newYork, losAngeles);
        assert_almost_equal(actual_ny_la, expected_ny_la, tolerance, "Test 3: New York to Los Angeles distance");

        // Test Case 4: Symmetry - Distance(A, B) should be equal to Distance(B, A)
        double dist_paris_london = calculateDistance(paris, london);
        assert_almost_equal(dist_paris_london, expected_london_paris, tolerance, "Test 4: Paris to London (Symmetry)");

        // Test Case 5: Antipodal points (e.g., Equator at 0 deg and 180 deg longitude)
        // Distance should be half the Earth's circumference (PI * R)
        City point_a = {"Point A", 0.0, 0.0};
        City point_b = {"Point B", 0.0, 180.0};
        double expected_antipodal = PI * EARTH_RADIUS_KM;
        double actual_antipodal = calculateDistance(point_a, point_b);
        assert_almost_equal(actual_antipodal, expected_antipodal, tolerance, "Test 5: Antipodal points (Equator)");

        // Test Case 6: Antipodal points (North Pole to South Pole)
        // Distance should also be half the Earth's circumference
        City north_pole = {"North Pole", 90.0, 0.0};
        City south_pole = {"South Pole", -90.0, 0.0};
        double actual_pole_antipodal = calculateDistance(north_pole, south_pole);
        assert_almost_equal(actual_pole_antipodal, expected_antipodal, tolerance, "Test 6: Antipodal points (Poles)");

        // Test Case 7: Points on the same meridian (different latitudes)
        // Equator to North Pole should be a quarter of the Earth's circumference (PI/2 * R)
        City equator_0_lon = {"Equator 0", 0.0, 0.0};
        City north_pole_0_lon = {"North Pole 0", 90.0, 0.0};
        double expected_equator_pole = PI / 2 * EARTH_RADIUS_KM;
        double actual_equator_pole = calculateDistance(equator_0_lon, north_pole_0_lon);
        assert_almost_equal(actual_equator_pole, expected_equator_pole, tolerance, "Test 7: Equator to North Pole");

        std::cout << "\n--- Test Summary ---\n";
        std::cout << "Total tests: " << test_count << std::endl;
        std::cout << "Passed: " << passed_count << std::endl;
        std::cout << "Failed: " << (test_count - passed_count) << std::endl;
        std::cout << "--------------------\n";
    }
} // end anonymous namespace

int main() {
    // Run unit tests first to verify functionality
    run_all_tests();

    // Original example usage
    std::cout << "\n--- Example Usage ---\n";
    City london = {"London", 51.5074, -0.1278}; // Latitude, Longitude
    City paris = {"Paris", 48.8566, 2.3522};   // Latitude, Longitude

    double distance_london_paris = calculateDistance(london, paris);

    std::cout << std::fixed << std::setprecision(2); // Format output to 2 decimal places

    std::cout << "Distance between " << london.name << " and " << paris.name
              << ": " << distance_london_paris << " km" << std::endl;

    // Another example: New York and Los Angeles
    City newYork = {"New York", 40.7128, -74.0060};
    City losAngeles = {"Los Angeles", 34.0522, -118.2437};

    double distance_ny_la = calculateDistance(newYork, losAngeles);

    std::cout << "Distance between " << newYork.name << " and " << losAngeles.name
              << ": " << distance_ny_la << " km" << std::endl;

    return 0;
}
