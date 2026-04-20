import { useRouteError, isRouteErrorResponse, Link } from "react-router";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { motion } from "motion/react";

export function ErrorPage() {
  const error = useRouteError();
  let errorMessage = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-800"
      >
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {errorMessage}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-200 dark:shadow-none"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
          
          <Link 
            to="/"
            className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
