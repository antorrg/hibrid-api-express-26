import { type RouteObject } from "react-router";
import Admin from "./views/Admin";
import TabsPage from "./views/TabsConfiguration/TabsPage";

export const adminRouter: RouteObject[] = [
  {
    path: "/admin",
    element: <Admin />,
    children: [
      {
        index: true,
        element: <TabsPage />,
      },
      // Aquí se agregarán las rutas hijas para formularios, perfiles, etc.
    ],
  },
];