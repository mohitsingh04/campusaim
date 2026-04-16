import { Route } from "react-router-dom";
import PermissionRoute from "./PermissionRoute";

export default function RouteRenderer({ routes }) {
    return routes.map(({ path, element, permissions }) => (
        <Route
            key={path}
            path={path}
            element={
                permissions ? (
                    <PermissionRoute requiredPermissions={permissions}>
                        {element}
                    </PermissionRoute>
                ) : (
                    element
                )
            }
        />
    ));
}
