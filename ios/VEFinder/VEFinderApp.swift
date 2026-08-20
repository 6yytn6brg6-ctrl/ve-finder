import SwiftUI

@main
struct VEFinderApp: App {
    @StateObject private var locationPermission = LocationPermissionManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(locationPermission)
                .onAppear {
                    locationPermission.requestWhenInUse()
                }
        }
    }
}
