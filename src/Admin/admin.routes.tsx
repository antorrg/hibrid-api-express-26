import { lazy, Suspense } from "react";
import { type RouteObject } from "react-router";
import Loader from "../shared/components/Loader";

const Admin = lazy(() => import("./views/Admin"));
const TabsPage = lazy(() => import("./views/TabsConfiguration/TabsPage"));
const Product = lazy(() => import("./features/product/Product"));
const Variant = lazy(() => import("./features/product/Variant"));
const CreateProduct = lazy(() => import("./features/product/components/CreateProduct"));
const EditProduct = lazy(() => import("./features/product/components/EditProduct"));
const EditVariant = lazy(() => import("./features/product/components/EditVariant"));
const User = lazy(() => import("./features/user/User"));
const CreateFrontPage = lazy(() => import("./features/frontPage/components/CreateFrontPage"));
const EditFrontPage = lazy(() => import("./features/frontPage/components/EditFrontPage"));
const CreateAbout = lazy(() => import("./features/about/components/CreateAbout"));
const EditAbout = lazy(() => import("./features/about/components/EditAbout"));
const CreateVideoGroup = lazy(() => import("./features/videos/components/CreateVideoGroup"));
const VideoGroupDetail = lazy(() => import("./features/videos/components/VideoGroupDetail"));

export const adminRouter: RouteObject[] = [
  {
    path: "/admin",
    element: (
      <Suspense fallback={<Loader fullScreen text="Cargando panel de administración..." />}>
        <Admin />
      </Suspense>
    ),
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
        path: "about/create",
        element: <CreateAbout />,
      },
      {
        path: "about/edit",
        element: <EditAbout />,
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