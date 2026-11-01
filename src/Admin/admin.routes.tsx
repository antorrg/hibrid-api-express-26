import { type RouteObject } from "react-router";
import Admin from "./views/Admin";
import TabsPage from "./views/TabsConfiguration/TabsPage";

import Product from "./features/product/Product";
import Variant from "./features/product/Variant";
import CreateProduct from "./features/product/components/CreateProduct";
import EditProduct from "./features/product/components/EditProduct";
import EditVariant from "./features/product/components/EditVariant";
import User from "./features/user/User";
import CreateFrontPage from "./features/frontPage/components/CreateFrontPage";
import EditFrontPage from "./features/frontPage/components/EditFrontPage";
import CreateVideoGroup from "./features/videos/components/CreateVideoGroup";
import VideoGroupDetail from "./features/videos/components/VideoGroupDetail";

export const adminRouter: RouteObject[] = [
  {
    path: "/admin",
    element: <Admin />,
    children: [
      {
        index: true,
        element: <TabsPage />,
      },
      {
        path: "product/create",
        element: <CreateProduct />,
      },
      {
        path: "product/:id",
        element: <Product />,
      },
      {
        path: "product/:id/edit",
        element: <EditProduct />,
      },
      {
        path: "product/:productId/variant/:variantId",
        element: <Variant />,
      },
      {
        path: "product/:productId/variant/:variantId/edit",
        element: <EditVariant />,
      },
      {
        path: "user/:id",
        element: <User />,
      },
      {
        path: "frontpage/create",
        element: <CreateFrontPage />,
      },
      {
        path: "frontpage/edit",
        element: <EditFrontPage />,
      },
      {
        path: "videos/create/:productId",
        element: <CreateVideoGroup />,
      },
      {
        path: "videos/:id",
        element: <VideoGroupDetail />,
      },
    ],
  },
];