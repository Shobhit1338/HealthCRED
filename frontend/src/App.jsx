import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import LoanDetails from './pages/LoanDetails';
import LedgerView from './pages/LedgerView';
import './App.css';

const router = createBrowserRouter([
  { 
    path: '/',
    children: [
      {
        index: true,
        element: <Onboarding />
      },
      {
        path: '/loan-details',
        element: <LoanDetails />
      },
      {
        path: '/ledger-view',
        element: <LedgerView />
      }
    ]
   }
]);

function App() {
  return <RouterProvider router={router} />
}

export default App
