
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-primary/10">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-sms-blue">404</h1>
        <p className="text-xl mt-4 mb-8 text-gray-600">Oops! Page not found</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={goBack} variant="outline">
            Go Back
          </Button>
          <Button onClick={goHome}>Return to Home</Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
