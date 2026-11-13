import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import Work from './pages/Work';
import Brand from './pages/Brand';
import Project from './pages/Project';
import NotFound from './pages/NotFound';
import Playground from './pages/Playground';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/work', element: <Work /> },
      { path: '/playground', element: <Playground /> },
      { path: '/work/:brand', element: <Brand /> },
      { path: '/work/:brand/:category', element: <Brand /> },
      { path: '/work/:brand/:category/:slug', element: <Project /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
